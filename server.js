'use strict';
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');

const { buildSystemPrompt } = require('./lib/system-prompt');
const { toolDefinitions, executeTools } = require('./lib/tools');

const app = express();
app.set('trust proxy', 1); // Fix 6: trust Railway's TLS-terminating proxy so req.secure is correct
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
// Fix 3: add CSP to /downloads so LLM-generated HTML can't execute scripts when opened directly
app.use('/downloads', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src https: data:");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(path.join(__dirname, 'downloads')));

// Serve proposal HTML with auto-print injected (opens print dialog in new tab → Save as PDF)
app.get('/api/print-proposal/:filename', async (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename.endsWith('.html')) return res.status(400).send('Invalid filename');
  const filePath = path.join(__dirname, 'downloads/proposals', filename);
  try {
    let html = await fs.promises.readFile(filePath, 'utf-8');
    // Fix 2: use nonce instead of 'unsafe-inline' so only this specific script is allowed
    const nonce = crypto.randomBytes(16).toString('base64');
    const printScript = `<script nonce="${nonce}">window.addEventListener("load",function(){setTimeout(function(){window.print();},600);});</script>`;
    html = html.replace('</body>', printScript + '</body>');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', `default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src https: data:; script-src 'nonce-${nonce}'`);
    res.send(html);
  } catch {
    res.status(404).send('Proposta non trovata');
  }
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
let systemPrompt = '';

// ── Session management (Vuln 5 fix: HttpOnly cookie replaces plain header/sessionStorage) ──
const sessions = new Map();
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours

function parseCookies(cookieHeader) {
  const cookies = {};
  (cookieHeader || '').split(';').forEach(c => {
    const i = c.indexOf('=');
    if (i > 0) cookies[c.slice(0, i).trim()] = c.slice(i + 1).trim();
  });
  return cookies;
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);
  return token;
}

function checkAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['dash_session'];
  if (token) {
    const expiry = sessions.get(token);
    if (expiry && expiry > Date.now()) return next();
    sessions.delete(token);
    // Fix 5: clear stale cookie so browser stops re-sending it and gets a clean lock screen
    res.clearCookie('dash_session', { httpOnly: true, sameSite: 'Strict' });
  }
  return res.status(401).json({ error: 'Non autorizzato' });
}

// Chat endpoint — SSE streaming with agentic tool loop
app.post('/api/chat', checkAuth, async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    let apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
    const allDownloads = [];

    while (true) {
      const stream = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 16384,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: apiMessages,
        tools: toolDefinitions,
        stream: true,
      });

      const contentBlocks = [];

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          contentBlocks[event.index] = { ...event.content_block, _inputStr: '' };
          if (event.content_block.type === 'tool_use') {
            send({ type: 'tool_start', toolName: event.content_block.name });
          }
        }
        if (event.type === 'content_block_delta') {
          const block = contentBlocks[event.index];
          if (!block) continue;
          if (event.delta.type === 'text_delta') {
            block.text = (block.text || '') + event.delta.text;
            send({ type: 'text_delta', content: event.delta.text });
          }
          if (event.delta.type === 'input_json_delta') {
            block._inputStr += event.delta.partial_json;
          }
        }
      }

      const toolBlocks = contentBlocks.filter(b => b && b.type === 'tool_use');

      if (toolBlocks.length === 0) break; // testo già streamato

      for (const b of toolBlocks) {
        try { b.input = JSON.parse(b._inputStr || '{}'); } catch { b.input = {}; }
      }

      const responseContent = contentBlocks.filter(Boolean).map(b => {
        if (b.type === 'tool_use') return { type: 'tool_use', id: b.id, name: b.name, input: b.input };
        return { type: 'text', text: b.text || '' };
      });

      const toolResults = [];
      for (const block of toolBlocks) {
        try {
          const result = await executeTools(block.name, block.input);
          const content = typeof result === 'string' ? result : JSON.stringify(result);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content });
          if (result?.downloads) {
            allDownloads.push(...result.downloads);
            // Send immediately — don't wait for after the while loop
            send({ type: 'downloads', files: result.downloads });
            console.log('[tools] downloads sent:', result.downloads.map(d => d.url));
          }
        } catch (err) {
          console.error('[tools] error executing', block.name, ':', err.message);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: `Errore: ${err.message}`,
            is_error: true,
          });
          send({ type: 'tool_error', toolName: block.name, message: err.message });
        }
        send({ type: 'tool_end', toolName: block.name });
      }

      apiMessages = [
        ...apiMessages,
        { role: 'assistant', content: responseContent },
        { role: 'user', content: toolResults },
      ];
    }

    // Note: downloads already sent immediately after each tool — allDownloads kept for reference only
  } catch (err) {
    let errorType = 'generic';
    try {
      const parsed = JSON.parse(err.message);
      const t = parsed?.error?.type;
      if (t === 'overloaded_error') errorType = 'overloaded';
      else if (t === 'rate_limit_error') errorType = 'rate_limit';
      else if (t === 'invalid_request_error') errorType = 'invalid_request';
      else if (t === 'authentication_error') errorType = 'auth';
    } catch {}
    if (err.status === 529) errorType = 'overloaded';
    if (err.status === 429) errorType = 'rate_limit';
    send({ type: 'error', message: err.message, errorType });
  }

  send({ type: 'done' });
  res.end();
});

// Password verification — login sets HttpOnly session cookie; no-key call checks existing session
app.post('/api/verify', (req, res) => {
  const password = process.env.DASHBOARD_PASSWORD;
  const { key } = req.body;

  if (key) {
    if (key !== password) return res.json({ ok: false });
    const token = createSession();
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie('dash_session', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'Strict',
      maxAge: SESSION_TTL,
    });
    return res.json({ ok: true });
  }

  // No key — check existing session cookie
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['dash_session'];
  if (token) {
    const expiry = sessions.get(token);
    if (expiry && expiry > Date.now()) return res.json({ ok: true });
    sessions.delete(token);
    res.clearCookie('dash_session', { httpOnly: true, sameSite: 'Strict' });
  }
  return res.json({ ok: false });
});

// KPI endpoint — fetches quick analytics for the welcome screen
app.get('/api/kpi', checkAuth, async (req, res) => {
  const { listRecords } = require('./lib/airtable');

  const [tasks, lastProposal] = await Promise.allSettled([
    // Upcoming confirmed bookings
    listRecords('Bookings', { maxRecords: 100 }).then(records => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = records.filter(r => {
        const f = r.fields;
        const dateStr = f['Data partenza'] || f['Check-in'] || f['Date'] || f['Start Date'] || f['StartDate'];
        if (!dateStr) return false;
        return new Date(dateStr) >= today;
      });
      const count = upcoming.length > 0 ? upcoming.length : records.length;
      const label = upcoming.length > 0 ? 'nei prossimi 90 giorni' : 'confermati totali';
      return { count, label };
    }),

    // Most recent proposal file
    (async () => {
      const dir = path.join(__dirname, 'downloads/proposals');
      try {
        const files = await fs.promises.readdir(dir);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        if (htmlFiles.length === 0) return { daysAgo: null, filename: null };

        const withMtime = await Promise.all(
          htmlFiles.map(async f => {
            const stat = await fs.promises.stat(path.join(dir, f));
            return { name: f, mtime: stat.mtimeMs };
          })
        );
        withMtime.sort((a, b) => b.mtime - a.mtime);
        const newest = withMtime[0];
        const daysAgo = Math.floor((Date.now() - newest.mtime) / 86400000);
        const shortName = newest.name.replace(/^proposal-/, '').replace(/-\d{4}-\d{2}-\d{2}\.html$/, '');
        return { daysAgo, filename: shortName };
      } catch {
        return { daysAgo: null, filename: null };
      }
    })(),
  ]);

  res.json({
    tasks:        tasks.status === 'fulfilled'        ? tasks.value        : { count: '—', label: 'Non disponibile' },
    revenue:      { amount: null, label: 'Q2 2026' },
    lastProposal: lastProposal.status === 'fulfilled' ? lastProposal.value : { daysAgo: null, filename: null },
  });
});

// List all generated proposal files
app.get('/api/list-proposals', checkAuth, async (req, res) => {
  const dir = path.join(__dirname, 'downloads/proposals');
  try {
    const files = await fs.promises.readdir(dir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) return res.json({ proposals: [] });

    const withMeta = await Promise.all(
      htmlFiles.map(async f => {
        const stat = await fs.promises.stat(path.join(dir, f));
        const label = f
          .replace(/^proposal-/, '')
          .replace(/-(\d{4}-\d{2}-\d{2})\.html$/, ' · $1')
          .replace(/-/g, ' ');
        return { filename: f, label, url: `/api/print-proposal/${f}`, mtime: stat.mtimeMs };
      })
    );
    withMeta.sort((a, b) => b.mtime - a.mtime);
    res.json({ proposals: withMeta });
  } catch {
    res.json({ proposals: [] });
  }
});

async function start() {
  if (!process.env.DASHBOARD_PASSWORD) {
    console.error('FATAL: DASHBOARD_PASSWORD non impostata. Il server non si avvia senza autenticazione.');
    process.exit(1);
  }

  // Fix 4: proactive session eviction — prevent unbounded Map growth
  setInterval(() => {
    const now = Date.now();
    for (const [token, expiry] of sessions) {
      if (expiry < now) sessions.delete(token);
    }
  }, 60 * 60 * 1000);

  ['downloads/proposals', 'downloads/supplier-requests'].forEach(dir => {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });

  systemPrompt = await buildSystemPrompt();
  console.log(`System prompt caricato: ${systemPrompt.length} caratteri`);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Motivation Dashboard → http://localhost:${port}`);
  });
}

start().catch(err => {
  console.error('Errore avvio:', err);
  process.exit(1);
});
