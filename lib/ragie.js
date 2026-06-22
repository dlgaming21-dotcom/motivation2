'use strict';
const fs = require('fs').promises;
const path = require('path');

const WIKI_DIR = path.join(__dirname, '../wiki');

async function searchWiki(query) {
  // Step 1 — leggi index
  let indexContent;
  try {
    indexContent = await fs.readFile(path.join(WIKI_DIR, 'index.md'), 'utf-8');
  } catch {
    return 'Wiki index non trovato. Verifica che AIS-OS-main/wiki/ sia presente nel deploy.';
  }

  // Step 2 — estrai entries: [Nome](categoria/slug.md) — descrizione
  const entries = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)\s*[—–-]\s*(.+)/g;
  let match;
  while ((match = linkRegex.exec(indexContent)) !== null) {
    entries.push({ name: match[1], filePath: match[2], desc: match[3] });
  }

  // Step 3 — scoring keyword (parole query >2 chars contro nome+descrizione)
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const scored = entries.map(e => {
    const text = `${e.name} ${e.desc}`.toLowerCase();
    const score = queryWords.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
    return { ...e, score };
  });

  const relevant = scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Step 4 — leggi le pagine rilevanti
  const sections = [];
  for (const e of relevant) {
    try {
      const resolved = path.resolve(WIKI_DIR, e.filePath);
      if (!resolved.startsWith(WIKI_DIR + path.sep)) continue; // path traversal guard
      const content = await fs.readFile(resolved, 'utf-8');
      sections.push(`## ${e.name}\n_Fonte: wiki/${e.filePath}_\n\n${content}`);
    } catch {
      // pagina referenziata in index ma file mancante — skip silenzioso
    }
  }

  if (sections.length === 0) {
    return `# Wiki Index\n\n${indexContent}\n\n---\n\nNessuna pagina specifica trovata per la query "${query}". Consulta l'indice per navigare.`;
  }

  return [
    `# Risultati wiki per: "${query}"`,
    `_${sections.length} pagine trovate_`,
    ...sections,
  ].join('\n\n---\n\n');
}

module.exports = { searchWiki };

/* RAGIE — mantenuto per rollback. Per riattivare: esporta searchRagie, importala in tools.js.

async function searchRagie(query, topK = 6) {
  const res = await fetch('https://api.ragie.ai/retrievals', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RAGIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, top_k: topK, rerank: true, partition: 'default' }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ragie API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const chunks = (data.scored_chunks || []).map((c, i) =>
    `[Chunk ${i + 1}] Score: ${c.score?.toFixed(3) ?? 'N/A'}\n${c.text ?? ''}`
  );

  return chunks.length > 0 ? chunks.join('\n\n---\n\n') : 'Nessun risultato trovato.';
}

*/
