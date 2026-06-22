---
name: proposal
description: Genera una proposta viaggio in PDF per un cliente. Cerca i dati del viaggio in Ragie, riempie il template HTML e lo converte in PDF. Usare su "genera proposta", "crea proposta", "nuova proposta", "fai la proposta per [CLIENTE]", o qualsiasi richiesta di generare una proposta di viaggio.
---

## Cosa fa questa skill

Produce un PDF di proposta viaggio completo e brandizzato:
1. Interroga Ragie per i dati del viaggio del cliente
2. Riempie `templates/proposal-template.html` con tutti i dati trovati
3. Salva l'HTML compilato in `templates/proposals/`
4. Converte in PDF con `scripts/html-to-pdf.ps1` (Chrome headless)
5. Apre il PDF risultante

## Trigger

- "genera proposta per [CLIENTE]"
- "crea proposta [CLIENTE]"
- "fai la proposta per [CLIENTE]"
- "/proposal [CLIENTE]"
- Qualsiasi richiesta di generare/costruire una proposta di viaggio

---

## Esecuzione

### Step 1 — Raccogli le info del cliente

Dal messaggio dell'utente, estrai:
- **Nome cliente** (obbligatorio) — per il filename e la cover
- **Date** — inizio e fine viaggio
- **Destinazione** — se non presente nei dati Ragie
- **Numero ospiti** — se non presente nei dati Ragie

Se mancano, chiedi solo le info strettamente necessarie per procedere. Non bloccare per dettagli che Ragie può fornire.

### Step 2 — Interroga Ragie (ripetutamente se necessario)

Prima query:
```
.\scripts\ragie-retrieve.ps1 -Query "[NOME CLIENTE] program itinerary hotel" -TopK 10
```

Controlla gli indici dei chunk restituiti. Se ci sono lacune (es. hai chunk 0, 2, 4 ma manca 1 e 3), fai query aggiuntive mirate per recuperare il contenuto mancante:
```
.\scripts\ragie-retrieve.ps1 -Query "[NOME CLIENTE] [parola chiave del giorno mancante]" -TopK 6
```

Continua finché hai copertura completa di tutti i giorni del programma.

### Step 3 — Riempi il template

Parti da `templates/proposal-template.html`. Salva il file compilato in:
```
templates/proposals/proposal-[CLIENTE-SLUG]-[YYYY-MM-DD].html
```

**Regole contenuto — FONDAMENTALI:**
- Includi TUTTO il contenuto dal documento originale — non riassumere, non omettere
- Orari precisi, nomi ristoranti con indirizzi e telefoni, nomi guide con contatti → tutto presente
- Note operative, dress code, avvisi logistici → includi in `.note-box`
- Opzioni cena suggerite → includi nel blocco `.dinner-options`
- Info ospiti (nomi, date nascita, contatti) → pagina "Guests & Contacts"
- Se un dato non è in Ragie → lascia `[TO COMPLETE]` visibile nel testo

**Struttura pagine:**
- Pagina 1: Cover (B2B — intestata all'agenzia, non al cliente finale)
- Pagina 2: Ospiti & Contatti + Note importanti
- Pagine 3+: Itinerario (1–2 giorni per pagina in base alla densità del contenuto)
- Ultima pagina: Giorno di partenza — **nessuna pagina Investment** (i prezzi vanno in documento separato)

**Cover B2B — regola fondamentale:**
Motivation lavora con agenzie di viaggio americane (B2B), non con i clienti finali. La proposta viene consegnata all'agenzia.
- Cover line: `Prepared for [NOME AGENZIA] — Re: [NOME VIAGGIATORI]`
- Se il nome dell'agenzia non è fornito nel messaggio, chiederlo prima di procedere
- Non includere prezzi, preventivi o termini di pagamento nella proposta

**Cover image — REGOLA OBBLIGATORIA:**
La foto di copertina DEVE rappresentare la destinazione del viaggio. È VIETATO usare foto di ristoranti, cibo, interni di locali, o qualsiasi immagine non pertinente al territorio italiano di lusso.

Struttura HTML per cover con foto (applicare sul div `.cover.page`):
```html
<div class="cover page" style="background-image: url('PHOTO_URL'); background-size: cover; background-position: center;">
  <div class="cover-bg" style="background: rgba(15,20,45,0.70); opacity: 1;"></div>
  ...
</div>
```

Foto approvate per destinazione:

| Destinazione | URL foto |
|---|---|
| Roma | `https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80` |
| Costiera Amalfitana / Positano | `https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?auto=format&fit=crop&w=1600&q=80` |
| Venezia | `https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=80` |
| Toscana / Firenze | `https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=1600&q=80` |
| Sicilia | `https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80` |
| Capri | `https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1600&q=80` |
| Portofino / Cinque Terre | `https://images.unsplash.com/photo-1571434969867-8dd0bc8cccde?auto=format&fit=crop&w=1600&q=80` |
| Lago di Como | `https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80` |
| Italia generica / multi-destinazione | `https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&w=1600&q=80` |

Per viaggi multi-destinazione (es. Roma + Costiera), usa la foto della destinazione più iconica o quella dell'Italia generica.

**Layout giorno — usa sempre:**
- Riga `.guide-line` con nome e telefono guida/assistente
- Blocco `.timeline` con orari precisi e descrizioni complete
- Cards `.restaurant` per ogni ristorante prenotato (con indirizzo, telefono, nome prenotazione)
- Blocco `.hotel-block` per l'hotel della notte
- `.dinner-block` per le opzioni cena libera (dove previste)

Per aggiungere giorni: duplica il blocco `.day-section` — non c'è limite al numero di pagine itinerario.

### Step 4 — Converti in PDF

```powershell
.\scripts\html-to-pdf.ps1 -HtmlPath "templates/proposals/proposal-[CLIENTE-SLUG]-[YYYY-MM-DD].html"
```

Il PDF viene salvato nella stessa cartella dell'HTML, con estensione `.pdf`. Lo script lo apre automaticamente.

### Step 5 — Riporta all'utente

Comunica:
- Percorso del PDF generato
- Numero di pagine
- Elenco dei `[TO COMPLETE]` rimasti (se presenti), così l'operatore sa cosa completare manualmente

---

## File coinvolti

| File | Ruolo |
|---|---|
| `templates/proposal-template.html` | Template base con variabili `{{...}}` — non modificare |
| `templates/proposals/proposal-[SLUG]-[DATE].html` | HTML compilato per questo cliente |
| `templates/proposals/proposal-[SLUG]-[DATE].pdf` | PDF finale |
| `scripts/html-to-pdf.ps1` | Conversione HTML → PDF via Chrome headless |
| `scripts/ragie-retrieve.ps1` | Query semantica su Google Drive |

---

## Gestione casi limite

| Caso | Comportamento |
|---|---|
| Cliente non in Ragie | Riempi con i dati del messaggio utente, `[TO COMPLETE]` per il resto |
| Viaggio multi-destinazione | Aggiungi pagine itinerario extra — nessun limite |
| Nessun dato di prezzo | Lascia `Upon request` nella sezione Investment (default del template) |
| Guida non specificata | Lascia `[TO COMPLETE — guide TBD]` nella riga `.guide-line` |
| Chunk Ragie incompleti | Fai query aggiuntive prima di procedere — non produrre una proposta lacunosa |
