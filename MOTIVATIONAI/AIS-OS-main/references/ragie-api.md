# Ragie.ai — Reference

RAG-as-a-service connesso a Google Drive. Layer semantico dell'AIOS.

## Config

```
Partition:    default  (unica partizione attiva, verificato 2026-06-21)
Connector:    Google Drive  (non OneDrive)
API key env:  RAGIE_API_KEY
Script:       scripts/ragie-retrieve.ps1
```

> MCP (npx) non è usato — richiede Node.js. Si usa lo script PowerShell direttamente.

## Come usare da Claude Code

```powershell
# Semantic search
.\scripts\ragie-retrieve.ps1 -Query "programma Kirk famiglia luglio 2025"

# Con più risultati
.\scripts\ragie-retrieve.ps1 -Query "hotel Portofino" -TopK 8

# Lista tutti i documenti indicizzati
.\scripts\ragie-retrieve.ps1 -Action list
```

## Parametri retrieve raccomandati

- **TopK default: 4** per query su singolo cliente. Usa 8 per ricerche cross-documento.
- **Rerank: true** (default) — migliora la precisione senza costo extra

## Google Drive connector

- Configurato in Ragie → Connections → Google Drive
- Sync automatico: ogni modifica a Drive viene reindicizzata entro ~15 min
- Documenti indicizzati ora: 1 (Kirk Family Program, 6 pag, 13 chunk)
- **Costo connector:** il primo connettore è incluso in tutti i piani

## Piani

| Piano | Pagine | Costo |
|---|---|---|
| Developer | 1.000 | $0 |
| Starter | 10.000 | $100/mese |
| Pro | 60.000 | $500/mese |

## Query di esempio da Claude Code

```
# Semantic Q&A su un cliente
.\scripts\ragie-retrieve.ps1 -Query "intolleranze alimentari famiglia Kirk"

# Ricerca su itinerario
.\scripts\ragie-retrieve.ps1 -Query "programma Portofino luglio 2025" -TopK 4
```
