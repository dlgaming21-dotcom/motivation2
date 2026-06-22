'use strict';
const fs = require('fs').promises;
const path = require('path');

const AIS = path.join(__dirname, '../../AIS-OS-main');

async function read(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    console.warn(`[system-prompt] File non trovato: ${filePath}`);
    return '';
  }
}

async function buildSystemPrompt() {
  const [claudeMd, proposalSkill, supplierSkill, template] = await Promise.all([
    read(path.join(AIS, 'CLAUDE.md')),
    read(path.join(AIS, '.claude/skills/proposal/SKILL.md')),
    read(path.join(AIS, '.claude/skills/supplier-request/SKILL.md')),
    read(path.join(AIS, 'templates/proposal-template.html')),
  ]);

  return [
    claudeMd,
    '\n\n---\n\n# SKILL: /proposal\n\n',
    proposalSkill,
    '\n\n---\n\n# SKILL: /supplier-request\n\n',
    supplierSkill,
    '\n\n---\n\n# TEMPLATE PROPOSTA HTML\n\n',
    'Usa questo template come base per la skill /proposal. Compilalo con i dati del viaggio trovati in Ragie, poi passa l\'HTML completo al tool `generate_proposal`.\n\n',
    '```html\n',
    template,
    '\n```',
    `

---

# MODALITÀ WEB — ISTRUZIONI OPERATIVE

Sei in esecuzione come web app. NON hai accesso a script PowerShell. Usa SEMPRE i tool disponibili:

- **search_ragie** → sostituisce \`ragie-retrieve.ps1\`. Usalo per qualsiasi query sul knowledge base (programmi viaggio, clienti, strutture, fornitori).
- **query_airtable** → sostituisce il MCP Airtable. Per conteggi, elenchi, filtri strutturati. Tabelle: Clients, Bookings, Properties, Suppliers, Invoices.
- **generate_proposal** → riceve l'HTML completo compilato e lo salva come file scaricabile. Restituisce link download.
- **save_supplier_emails** → riceve array di email e le salva come file TXT scaricabili. Restituisce link download.

## Flusso /proposal

1. Chiama **search_ragie** (più volte se necessario) con query mirate per raccogliere tutti i dati del viaggio
2. Compila il template HTML con i dati trovati — segui le regole del SKILL.md (copertura completa, no prezzi, cover B2B)
3. Chiama **generate_proposal** con l'HTML completo e il client_slug
4. Informa l'utente con il link download + elenco eventuali [TO COMPLETE] rimasti

## Flusso /supplier-request

1. Chiama **search_ragie** per recuperare il programma tecnico del viaggio
2. Identifica tutti i fornitori (hotel, ristoranti, guide, autisti, esperienze)
3. Genera le email seguendo i template nel SKILL.md
4. Chiama **save_supplier_emails** con tutte le email generate
5. Mostra la tabella riepilogativa con i link download

## Regole assolute in modalità web

- Non inviare mai email automaticamente — salva solo bozze
- Per qualsiasi domanda aziendale (clienti, viaggi, strutture): cerca PRIMA in Ragie/Airtable
- Se Ragie non trova nulla: riferiscilo e proponi query alternative
`,
  ].join('');
}

module.exports = { buildSystemPrompt };
