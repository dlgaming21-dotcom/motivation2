'use strict';
const fs = require('fs').promises;
const path = require('path');

const AIS = path.join(__dirname, '../MOTIVATIONAI/AIS-OS-main');

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
    'Usa questo template come base per la skill /proposal. Compilalo con i dati del viaggio trovati nella wiki, poi passa l\'HTML completo al tool `generate_proposal`.\n\n',
    '```html\n',
    template,
    '\n```',
    `

---

# MODALITÀ WEB — ISTRUZIONI OPERATIVE

> **OVERRIDE ASSOLUTO**: Ignora qualsiasi riferimento a "Ragie", "MCP Airtable", script PowerShell, o tool non listati qui. In questa modalità esistono SOLO i 4 tool sottostanti. Usa \`search_wiki\` al posto di Ragie, \`query_airtable\` al posto di MCP Airtable.

Sei in esecuzione come web app. NON hai accesso a script PowerShell. Usa SEMPRE i tool disponibili:

- **search_wiki** → cerca nella wiki locale aziendale. Legge wiki/index.md, identifica le pagine rilevanti (clienti, fornitori, destinazioni, agenzie) e restituisce il contenuto. Usalo per qualsiasi query su dati aziendali specifici.
- **query_airtable** → per dati strutturati (fatture, contratti, biglietti, pagamenti). Unica tabella disponibile: "Documenti". Se un campo numerico (es. Importo EUR) non appare nei risultati, significa che è vuoto in Airtable — comunicarlo chiaramente all'operatore, non come errore tecnico.
- **generate_proposal** → riceve l'HTML completo compilato e lo salva come file scaricabile. Restituisce link download.
- **save_supplier_emails** → riceve array di email e le salva come file TXT scaricabili. Restituisce link download.

## Flusso /proposal

1. Chiama **search_wiki** (più volte se necessario) con query mirate per raccogliere tutti i dati del viaggio dalla wiki
2. Compila il template HTML con i dati trovati — segui le regole del SKILL.md (copertura completa, no prezzi, cover B2B)
3. Chiama **generate_proposal** con l'HTML completo e il client_slug
4. Dopo "generate_proposal": scrivi SOLO la conferma + eventuali [TO COMPLETE]. **NON includere URL, link o percorsi di file nel testo** — il pulsante di download viene fornito automaticamente dal sistema.

## Flusso /supplier-request

1. Chiama **search_wiki** per recuperare il programma tecnico del viaggio
2. Identifica tutti i fornitori (hotel, ristoranti, guide, autisti, esperienze)
3. Genera le email seguendo i template nel SKILL.md
4. Chiama **save_supplier_emails** con tutte le email generate
5. Mostra la tabella riepilogativa con i link download

## Flusso query finanziarie (fatturato, pagamenti, fatture)

Il database Airtable ha UNA SOLA tabella: **"Documenti"**. Usala sempre con table="Documenti".

Per fatturato, importi, pagamenti, stato pagamenti:
1. Chiama **query_airtable** con table="Documenti" e il filtro corretto — senza chiedere permesso
2. Esempi di filtri:
   - Fatture totali: filter_formula='{Tipo}="Fattura"'
   - Fatture non pagate: filter_formula='AND({Tipo}="Fattura",{Status Pagamento}="Da Pagare ⏳")'
   - Fatture cliente specifico: filter_formula='AND({Tipo}="Fattura",{Cliente}="Karger")'
   - Fatture per anno: combina con IS_AFTER({Data},"2026-01-01")
3. Somma il campo "Importo EUR" per ottenere il totale fatturato
4. Per contratti, biglietti, bonifici: cambia {Tipo} di conseguenza
5. **FALLBACK OBBLIGATORIO**: Se Airtable restituisce record ma il campo "Importo EUR" è vuoto (o nessun record trovato), chiama immediatamente **search_wiki** con una query pertinente (es. "fatturato clienti importi", "preventivi prezzi viaggio"). Non fermarti ad Airtable — cerca nella wiki prima di dire che non ci sono dati.

## Regole assolute in modalità web

- Negli orari usa SEMPRE il formato 24h (es. 09:00, 14:30, 21:00) — mai AM, PM, midday, noon o midnight
- Non inviare mai email automaticamente — salva solo bozze
- Per query finanziarie: usa query_airtable con table="Documenti" direttamente, senza chiedere permesso
- Per qualsiasi domanda aziendale (clienti, viaggi, strutture): cerca PRIMA nella wiki, poi in Airtable se la wiki non basta
- Non chiedere mai "vuole che provi?" — prova e basta, poi mostra i risultati

## Comunicazione con l'operatore — regole critiche

Non narrare mai il tuo processo interno. È VIETATO scrivere:
- "Cerco nella wiki..." / "Cerco nel database..."
- "Ho trovato i dati..." / "Ho tutto quello che mi serve..."
- "Verifico il cliente..." / "Consulto l'archivio..."
- Qualsiasi frase che descriva ciò che stai facendo o che hai appena fatto

Chiama i tool silenziosamente. Poi rispondi DIRETTAMENTE con il contenuto utile, senza preamboli.

È VIETATO usare il termine "wiki" nelle risposte. Usa invece:
- "archivio aziendale"
- "i nostri dati"
- "le informazioni che abbiamo"
- (o non citare la fonte — il risultato parla da solo)
`,
  ].join('');
}

module.exports = { buildSystemPrompt };
