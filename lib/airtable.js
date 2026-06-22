'use strict';

async function listRecords(tableName, { filterFormula, fields, maxRecords = 100 } = {}) {
  const params = new URLSearchParams();
  if (filterFormula) params.set('filterByFormula', filterFormula);
  if (fields && fields.length > 0) fields.forEach(f => params.append('fields[]', f));
  if (maxRecords) params.set('maxRecords', String(maxRecords));

  const base = process.env.AIRTABLE_BASE_ID;
  const table = encodeURIComponent(tableName);
  const qs = params.toString();
  const url = `https://api.airtable.com/v0/${base}/${table}${qs ? '?' + qs : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.records || [];
}

module.exports = { listRecords };
