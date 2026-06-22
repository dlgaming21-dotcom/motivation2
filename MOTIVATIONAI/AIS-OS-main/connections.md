# Connections

Registry of every system your AIOS can reach. Filled by `/onboard` from Q4-Q7 answers; expanded over time as you wire new tools. `/audit` checks this file for domain coverage and freshness.

| # | Domain | Tool | Mechanism | Auth | Last checked |
|---|---|---|---|---|---|
| 1 | Revenue / Financials | Excel (manuale) + Conto bancario | export | — | — |
| 2 | Customer interactions | Gmail (testing) + WhatsApp | not yet connected | — | — |
| 3 | Calendar | Google Calendar (inferred da Gmail) | not yet connected | — | — |
| 4 | Communication | Gmail SMTP (invio) + WhatsApp + Telefono | script | GMAIL_ADDRESS + GMAIL_APP_PASSWORD in .env | 2026-06-21 ✓ |
| 5 | Project / task tracking | Da definire | not yet connected | — | — |
| 6 | Meeting intelligence | N/A — nessuna registrazione meeting | — | — | — |
| 7 | Knowledge / files (RAG) | Ragie.ai + Google Drive | script | RAGIE_API_KEY in .env | 2026-06-21 ✓ |
| 8 | Structured data / analytics | Airtable (TravelAgencyDB) | mcp | AIRTABLE_API_KEY + AIRTABLE_BASE_ID in .env | 2026-06-21 ✓ |

**Mechanism options:** `mcp` (MCP server), `script` (Python/Bash hitting an API, in `scripts/`), `export` (CSV/JSON dump pipeline), `key+ref` (`.env` key + `references/{tool}-api.md` guide), `not yet connected`.

When you wire a new tool, also save `references/{tool}-api.md` capturing endpoints, auth flow, and common queries — researched-once-saved-forever.
