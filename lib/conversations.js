'use strict';
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const FILE = path.join(__dirname, '../data/conversations.json');
const MAX_CONVERSATIONS = 200;
const MAX_MESSAGES_PER_CONV = 300;

// Serialize writes to avoid read-modify-write race conditions
let writeQueue = Promise.resolve();

function enqueue(fn) {
  writeQueue = writeQueue.then(fn).catch(() => {});
  return writeQueue;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

async function loadAll() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Atomic write: write to tmp file then rename — prevents corrupt JSON on crash
async function saveAll(list) {
  await ensureDir();
  const tmp = path.join(os.tmpdir(), `moti_convs_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
  await fs.writeFile(tmp, JSON.stringify(list), 'utf-8');
  await fs.rename(tmp, FILE);
}

async function getConversations() {
  return loadAll();
}

async function upsertConversation(conv) {
  return enqueue(async () => {
    const all = await loadAll();
    const idx = all.findIndex(c => c.id === conv.id);

    // Cap messages per conversation to avoid unbounded growth
    const trimmed = { ...conv };
    if (Array.isArray(trimmed.messages) && trimmed.messages.length > MAX_MESSAGES_PER_CONV) {
      trimmed.messages = trimmed.messages.slice(-MAX_MESSAGES_PER_CONV);
    }

    if (idx >= 0) all[idx] = trimmed;
    else all.unshift(trimmed);

    // Cap total conversations
    const capped = all.slice(0, MAX_CONVERSATIONS);
    await saveAll(capped);
  });
}

async function deleteConversation(id) {
  return enqueue(async () => {
    const all = await loadAll();
    await saveAll(all.filter(c => c.id !== id));
  });
}

module.exports = { getConversations, upsertConversation, deleteConversation };
