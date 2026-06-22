# wiki/ — Knowledge base

Questa è la knowledge base compilata e mantenuta da Claude (AIOS).

L'operatore **legge** da qui. Claude **scrive e aggiorna** questa cartella tramite `/ingest`.

Non modificare manualmente queste pagine — se c'è un errore, crea un file corretto in `raw/` e riesegui `/ingest`.

## Struttura

- `clienti/` — profili compilati, preferenze, storia viaggi
- `fornitori/` — analisi, rating, contatti strutturati
- `destinazioni/` — sintesi, itinerari tipo, fornitori collegati
- `processi/` — procedure operative, template
- `index.md` — catalogo di tutto il contenuto wiki
- `log.md` — registro append-only di ogni ingest e query rilevante

## Come funziona

```
/ingest raw/clienti/brief-rossi.md  → crea wiki/clienti/rossi.md
/query "preferenze famiglia Kirk"   → legge wiki e risponde con citazioni
/lint                               → health check, trova gap e contraddizioni
```
