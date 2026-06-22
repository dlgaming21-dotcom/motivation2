'use strict';

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

module.exports = { searchRagie };
