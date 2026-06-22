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

Sei in esecuzione come web app. NON hai accesso a script PowerShell. Usa SEMPRE i tool disponibili:

- **search_wiki** → cerca nella wiki locale aziendale. Legge wiki/index.md, identifica le pagine rilevanti (clienti, fornitori, destinazioni, agenzie) e restituisce il contenuto. Usalo per qualsiasi query su dati aziendali specifici.
- **query_airtable** → per conteggi, elenchi, filtri strutturati. Tabelle: Clients, Bookings, Properties, Suppliers, Invoices.
- **generate_proposal** → riceve l'HTML completo compilato e lo salva come file scaricabile. Restituisce link download.
- **save_supplier_emails** → riceve array di email e le salva come file TXT scaricabili. Restituisce link download.

## Flusso /proposal

1. Chiama **search_wiki** (più volte se necessario) con query mirate per raccogliere tutti i dati del viaggio dalla wiki
2. Compila il template HTML con i dati trovati — segui le regole del SKILL.md (copertura completa, no prezzi, cover B2B)
3. Chiama **generate_proposal** con l'HTML completo e il client_slug
4. Dopo `generate_proposal`: scrivi SOLO la conferma + eventuali [TO COMPLETE]. **NON includere URL, link o percorsi di file nel testo** — il pulsante di download viene fornito automaticamente dal sistema.

## Flusso /supplier-request

1. Chiama **search_wiki** per recuperare il programma tecnico del viaggio
2. Identifica tutti i fornitori (hotel, ristoranti, guide, autisti, esperienze)
3. Genera le email seguendo i template nel SKILL.md
4. Chiama **save_supplier_emails** con tutte le email generate
5. Mostra la tabella riepilogativa con i link download

## Regole assolute in modalità web

- Non inviare mai email automaticamente — salva solo bozze
- Per qualsiasi domanda aziendale (clienti, viaggi, strutture): cerca PRIMA nel database aziendale/Airtable
- Se il database non trova nulla di rilevante: usa l'indice completo per navigare e proporre query alternative

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
