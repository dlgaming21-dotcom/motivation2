'use strict';
const fs = require('fs').promises;
const path = require('path');

const FILE = path.join(__dirname, '../data/conversations.json');

async function ensureDir() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

async function loadAll() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveAll(list) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(list), 'utf-8');
}

async function getConversations() {
  return loadAll();
}

async function upsertConversation(conv) {
  const all = await loadAll();
  const idx = all.findIndex(c => c.id === conv.id);
  if (idx >= 0) all[idx] = conv;
  else all.unshift(conv);
  await saveAll(all);
  return conv;
}

async function deleteConversation(id) {
  const all = await loadAll();
  await saveAll(all.filter(c => c.id !== id));
}

module.exports = { getConversations, upsertConversation, deleteConversation };
