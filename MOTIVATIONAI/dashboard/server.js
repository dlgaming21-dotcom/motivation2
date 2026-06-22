'use strict';
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');

const { buildSystemPrompt } = require('./lib/system-prompt');
const { toolDefinitions, executeTools } = require('./lib/tools');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
let systemPrompt = '';

function checkAuth(req, res, next) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return next();
  if (req.headers['x-dashboard-key'] !== password) {
    return res.status(401).json({ error: 'Non autorizzato' });
  }
  next();
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
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 16384,
        system: systemPrompt,
        messages: apiMessages,
        tools: toolDefinitions,
      });

      const toolBlocks = response.content.filter(b => b.type === 'tool_use');
      const textBlocks = response.content.filter(b => b.type === 'text');

      if (toolBlocks.length === 0) {
        send({ type: 'text', content: textBlocks.map(b => b.text).join('') });
        break;
      }

      for (const block of toolBlocks) {
        send({ type: 'tool_start', toolName: block.name });
      }

      const toolResults = [];
      for (const block of toolBlocks) {
        try {
          const result = await executeTools(block.name, block.input);
          const content = typeof result === 'string' ? result : JSON.stringify(result);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content });
          if (result?.downloads) allDownloads.push(...result.downloads);
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: `Errore: ${err.message}`,
            is_error: true,
          });
        }
        send({ type: 'tool_end', toolName: block.name });
      }

      apiMessages = [
        ...apiMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    }

    if (allDownloads.length > 0) {
      send({ type: 'downloads', files: allDownloads });
    }
  } catch (err) {
    send({ type: 'error', message: err.message });
  }

  send({ type: 'done' });
  res.end();
});

// Password verification (called on page load to check if auth is needed)
app.post('/api/verify', (req, res) => {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return res.json({ ok: true, noAuth: true });
  res.json({ ok: req.body.key === password });
});

async function start() {
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
