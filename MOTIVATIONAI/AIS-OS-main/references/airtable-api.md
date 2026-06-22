# Airtable — Reference

Database strutturato per analytics e relazioni. Layer complementare a Ragie nell'AIOS.

## Config

```
Base name:      TravelAgencyDB
Base ID:        <da compilare dopo creazione base>
API key env:    AIRTABLE_API_KEY
Base ID env:    AIRTABLE_BASE_ID
```

## MCP install (una volta sola)

```bash
claude mcp add-json "airtable" '{"command":"npx","args":["-y","@anthropic-ai/mcp-airtable"],"env":{"AIRTABLE_API_KEY":"<your_key>","AIRTABLE_BASE_ID":"<your_base_id>"}}'
```

## Schema tabelle

### Clients
| Campo | Tipo | Note |
|---|---|---|
| Name | Text | Nome completo |
| Email | Email | Contatto principale |
| Phone | Phone | |
| Tier | Select | economy / standard / luxury / ultra-luxury |
| Preferred Destinations | Multi-select | |
| Notes | Long text | Preferenze generali |
| Linked Bookings | Link to Bookings | |

### Bookings
| Campo | Tipo | Note |
|---|---|---|
| Client | Link to Clients | |
| Property | Link to Properties | |
| Destination | Text | |
| Travel Start | Date | |
| Travel End | Date | |
| Value (EUR) | Currency | |
| Status | Select | confirmed / pending / cancelled / completed |
| Notes | Long text | |
| Linked Invoices | Link to Invoices | |

### Properties
| Campo | Tipo | Note |
|---|---|---|
| Name | Text | Nome struttura |
| Country | Text | |
| Region | Text | es. Southeast Asia, Maldives, Mediterranean |
| Supplier | Link to Suppliers | |
| Category | Select | hotel / resort / villa / cruise / lodge |
| Rating | Number | stelle / punteggio interno |
| Notes | Long text | Osservazioni interne |

### Suppliers
| Campo | Tipo | Note |
|---|---|---|
| Name | Text | |
| Region | Text | |
| Category | Select | hotel / DMC / airline / transfer / experiences |
| Contact | Email | |
| Contract Validity | Date | Scadenza contratto |
| Linked Properties | Link to Properties | |

### Invoices
| Campo | Tipo | Note |
|---|---|---|
| Client | Link to Clients | |
| Booking | Link to Bookings | |
| Amount (EUR) | Currency | |
| Invoice Date | Date | |
| Due Date | Date | |
| Status | Select | paid / pending / overdue |
| Invoice Number | Text | |

## Query di esempio da Claude Code

```
# Analytics
Usa Airtable MCP per filtrare tabella Bookings dove Status = "completed" e Travel Start >= "2023-01-01" e Travel Start <= "2023-12-31". Somma il campo Value (EUR) e raggruppa per Destination.

# Entity lookup
Usa Airtable MCP per cercare nella tabella Bookings dove Property.Name contiene "Hotel X". Restituisci i clienti collegati con le date di viaggio.

# Relazione cross-tabella
Usa Airtable MCP per trovare tutti i Suppliers nella tabella Properties con Region = "Southeast Asia". Lista le Properties collegate e i Clients che le hanno visitate.
```

## Routing: quando usare Airtable vs Ragie

| Tipo di query | Tool |
|---|---|
| "Revenue totale 2023?" | Airtable — filtro + somma |
| "Quanti clienti questo anno?" | Airtable — count |
| "Quali strutture in Polinesia?" | Airtable — entity lookup |
| "Cosa preferisce il cliente Rossi?" | Ragie — semantic Q&A |
| "Riassumi il feedback sulle strutture Maldive" | Ragie — semantic aggregation |
| "Cliente Rossi ha prenotato Hotel X?" | Airtable prima, Ragie fallback |

## Migrazione iniziale

La prima popolazione delle tabelle avviene chiedendo a Claude Code (con Ragie MCP attivo) di:
1. Recuperare da Ragie le entità estratte per tipo di documento
2. Scrivere i record nelle tabelle Airtable corrispondenti

È un task manuale/guidato one-shot, non una pipeline automatica. Poi si mantiene aggiornato a mano dopo ogni prenotazione chiusa (~1 minuto).
