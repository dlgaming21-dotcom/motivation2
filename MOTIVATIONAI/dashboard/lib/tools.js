'use strict';
const path = require('path');
const fs = require('fs').promises;
const { searchRagie } = require('./ragie');
const { listRecords } = require('./airtable');

const toolDefinitions = [
  {
    name: 'search_ragie',
    description: 'Cerca informazioni nel knowledge base aziendale (programmi viaggio, clienti, strutture, fornitori, feedback). Usare per qualsiasi domanda su dati aziendali specifici.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Query di ricerca in linguaggio naturale' },
        top_k: { type: 'integer', description: 'Numero di chunk da restituire (default 6)', default: 6 },
      },
      required: ['query'],
    },
  },
  {
    name: 'query_airtable',
    description: 'Interroga il database strutturato per conteggi, elenchi, filtri. Tabelle disponibili: Clients, Bookings, Properties, Suppliers, Invoices.',
    input_schema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Nome tabella Airtable (Clients, Bookings, Properties, Suppliers, Invoices)' },
        filter_formula: { type: 'string', description: 'Formula filtro Airtable, es. {Status}="Confirmed"' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Campi da restituire (opzionale, default tutti)' },
        max_records: { type: 'integer', description: 'Numero massimo di record (default 100)', default: 100 },
      },
      required: ['table'],
    },
  },
  {
    name: 'generate_proposal',
    description: 'Salva la proposta viaggio come file HTML scaricabile. Usare dopo aver compilato il template con i dati del viaggio trovati in Ragie.',
    input_schema: {
      type: 'object',
      properties: {
        client_slug: { type: 'string', description: 'Slug identificativo del cliente, es. "kirk-family-2025"' },
        html_content: { type: 'string', description: 'Contenuto HTML completo della proposta compilata' },
      },
      required: ['client_slug', 'html_content'],
    },
  },
  {
    name: 'save_supplier_emails',
    description: 'Salva le bozze email fornitori come file TXT scaricabili. NON invia email — salva solo bozze da revisionare.',
    input_schema: {
      type: 'object',
      properties: {
        client_slug: { type: 'string', description: 'Slug cliente per la cartella, es. "kirk-family-2025"' },
        emails: {
          type: 'array',
          description: 'Lista email da salvare',
          items: {
            type: 'object',
            properties: {
              filename: { type: 'string', description: 'Nome file, es. "01-hotel-villa-crespi.txt"' },
              to: { type: 'string', description: 'Destinatario email o "[CONTATTO DA VERIFICARE]"' },
              subject: { type: 'string', description: 'Oggetto email' },
              body: { type: 'string', description: 'Corpo email' },
            },
            required: ['filename', 'to', 'subject', 'body'],
          },
        },
      },
      required: ['client_slug', 'emails'],
    },
  },
];

const DOWNLOADS_DIR = path.join(__dirname, '../downloads');

async function executeTools(name, input) {
  switch (name) {
    case 'search_ragie':
      return searchRagie(input.query, input.top_k ?? 6);

    case 'query_airtable': {
      const records = await listRecords(input.table, {
        filterFormula: input.filter_formula,
        fields: input.fields,
        maxRecords: input.max_records ?? 100,
      });
      if (records.length === 0) return 'Nessun record trovato.';
      return JSON.stringify(records.map(r => r.fields), null, 2);
    }

    case 'generate_proposal': {
      const slug = sanitizeSlug(input.client_slug);
      const today = new Date().toISOString().slice(0, 10);
      const filename = `proposal-${slug}-${today}.html`;
      const dir = path.join(DOWNLOADS_DIR, 'proposals');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), input.html_content, 'utf-8');
      return {
        success: true,
        message: `Proposta salvata: ${filename}`,
        downloads: [
          { label: `Scarica Proposta — ${input.client_slug}`, url: `/api/print-proposal/${filename}`, type: 'proposal' },
        ],
      };
    }

    case 'save_supplier_emails': {
      const slug = sanitizeSlug(input.client_slug);
      const today = new Date().toISOString().slice(0, 10);
      const dirName = `${slug}-${today}`;
      const dir = path.join(DOWNLOADS_DIR, 'supplier-requests', dirName);
      await fs.mkdir(dir, { recursive: true });

      const downloads = [];
      for (const email of input.emails) {
        const safeName = email.filename.replace(/[^a-z0-9._-]/gi, '-');
        const content = `TO: ${email.to}\nSUBJECT: ${email.subject}\n---\n${email.body}`;
        await fs.writeFile(path.join(dir, safeName), content, 'utf-8');
        downloads.push({
          label: safeName,
          url: `/downloads/supplier-requests/${dirName}/${safeName}`,
          type: 'email',
        });
      }

      return {
        success: true,
        message: `${downloads.length} bozze email salvate`,
        downloads,
      };
    }

    default:
      throw new Error(`Tool non riconosciuto: ${name}`);
  }
}

function sanitizeSlug(s) {
  return s.replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 60);
}

module.exports = { toolDefinitions, executeTools };
