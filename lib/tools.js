'use strict';
const path = require('path');
const fs = require('fs').promises;
const { searchWiki } = require('./ragie'); // era: const { searchRagie } = require('./ragie');
const { listRecords } = require('./airtable');

const toolDefinitions = [
  {
    name: 'search_wiki',
    description: 'Cerca nella wiki locale aziendale (programmi viaggio, clienti, strutture, fornitori, destinazioni). Legge wiki/index.md per trovare le pagine rilevanti e ne restituisce il contenuto completo. Usare per qualsiasi domanda su dati aziendali specifici.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Query di ricerca in linguaggio naturale' },
      },
      required: ['query'],
    },
  },
  {
    name: 'query_airtable',
    description: 'Interroga il database documenti operativi Airtable. Unica tabella disponibile: "Documenti". Campi: Cliente (singleSelect: Goll, Weeks, Kehrer, Karger, Kirk, Ditmore, Kent-Lagoulis, Ostrovsky-Gossel, St. John, Sciotto, Kelly, Fourlon, Schwartz, Cheryl, AHI Travel, Andrew Harper, Interno), Tipo (singleSelect: Fattura, Proforma/Deposito, Contratto, Biglietto, Bonifico, Email, Programma, Chart of Account, Ricevuta, Altro), Status Pagamento (singleSelect: "Pagato ✓", "Da Pagare ⏳", N/A), Importo EUR (numero), Data (data), Fornitore (testo), Viaggio (testo), Firmato (checkbox), Note (testo).',
    input_schema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Sempre "Documenti" — è l\'unica tabella disponibile' },
        filter_formula: { type: 'string', description: 'Formula filtro Airtable. Esempi: {Tipo}="Fattura", {Cliente}="Karger", {Status Pagamento}="Da Pagare ⏳", AND({Tipo}="Fattura",{Cliente}="Goll")' },
        fields: { type: 'array', items: { type: 'string' }, description: 'Campi da restituire (opzionale, default tutti). Esempi: ["Cliente","Importo EUR","Data","Status Pagamento"]' },
        max_records: { type: 'integer', description: 'Numero massimo di record (default 100)', default: 100 },
      },
      required: ['table'],
    },
  },
  {
    name: 'generate_proposal',
    description: 'Salva la proposta viaggio come file HTML scaricabile. Usare dopo aver compilato il template con i dati del viaggio trovati nella wiki.',
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
    case 'search_wiki':
      return searchWiki(input.query);

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
      if (!input.client_slug) throw new Error('client_slug mancante');
      if (!input.html_content) throw new Error('html_content mancante');
      const slug = sanitizeSlug(input.client_slug);
      const today = new Date().toISOString().slice(0, 10);
      const filename = `proposal-${slug}-${today}.html`;
      const dir = path.join(DOWNLOADS_DIR, 'proposals');
      console.log('[generate_proposal] saving', filename, 'html_content length:', input.html_content.length);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), input.html_content, 'utf-8');
      return {
        success: true,
        message: `Proposta salvata: ${filename}`,
        downloads: [
          { label: `Apri Proposta — ${input.client_slug}`, url: `/downloads/proposals/${filename}`, type: 'proposal' },
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
