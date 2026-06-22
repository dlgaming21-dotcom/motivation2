---
name: proposal
description: Genera una proposta viaggio per un cliente. Verifica prima se il cliente è in wiki, poi cerca i dati del viaggio, riempie il template HTML e lo salva/converte. Usare su "genera proposta", "crea proposta", "nuova proposta", "fai la proposta per [CLIENTE]", o qualsiasi richiesta di generare una proposta di viaggio.
---

## Cosa fa questa skill

Produce una proposta viaggio completa e brandizzata in formato B2B (destinataria: l'agenzia di viaggio USA):
1. Verifica se il cliente è presente nella wiki (Step 0)
2. Cerca tutti i dati del viaggio nella wiki
3. Riempie `templates/proposal-template.html` con i dati trovati
4. Salva l'HTML compilato e lo converte in PDF

## Trigger

- "genera proposta per [CLIENTE]"
- "crea proposta [CLIENTE]"
- "fai la proposta per [CLIENTE]"
- "/proposal [CLIENTE]"
- Qualsiasi richiesta di generare/costruire una proposta di viaggio

---

## Esecuzione

### Step 0 — Verifica cliente in wiki

Prima di qualsiasi altra operazione, cerca il cliente nella wiki:

1. Chiama `search_wiki` con il nome del cliente (o leggi `wiki/clienti/[slug].md` direttamente)
2. **Se esiste la pagina cliente** → usa quei dati come fonte primaria per compilare il template. Non inventare dettagli non presenti nella wiki.
3. **Se non esiste la pagina cliente** → avvisa l'operatore:
   > "Il cliente [NOME] non è presente nella wiki. Per procedere servono: nome completo, nome agenzia USA, date del viaggio, destinazione, numero partecipanti, strutture previste. Fornisci questi dati o esegui prima `/ingest` del materiale su questo cliente."

Non procedere oltre se il cliente non è in wiki e l'operatore non ha fornito i dati manualmente.

### Step 1 — Raccogli le info del cliente

Dal messaggio dell'utente, estrai:
- **Nome cliente** (obbligatorio) — per il filename e la cover
- **Date** — inizio e fine viaggio
- **Destinazione** — se non presente nei dati Ragie
- **Numero ospiti** — se non presente nei dati Ragie

Se mancano, chiedi solo le info strettamente necessarie per procedere. Non bloccare per dettagli che Ragie può fornire.

### Step 2 — Cerca nella wiki (ripetutamente se necessario)

Query primaria: `search_wiki("[NOME CLIENTE] programma itinerario hotel")`

Se il programma è multi-destinazione o la wiki ha pagine separate per fornitori/destinazioni, fai query aggiuntive mirate:
- `search_wiki("[NOME CLIENTE] [città/giorno specifico]")`
- `search_wiki("[nome hotel] [destinazione]")` — per i dettagli struttura

Continua finché hai copertura completa di tutti i giorni del programma. Non produrre una proposta lacunosa.

### Step 3 — Riempi il template

Parti da `templates/proposal-template.html`. Salva il file compilato in:
```
templates/proposals/proposal-[CLIENTE-SLUG]-[YYYY-MM-DD].html
```

**Regole contenuto — FONDAMENTALI:**
- Includi TUTTO il contenuto dalla wiki — non riassumere, non omettere
- Orari precisi, nomi ristoranti con indirizzi e telefoni, nomi guide con contatti → tutto presente
- Note operative, dress code, avvisi logistici → includi in `.note-box`
- Opzioni cena suggerite → includi nel blocco `.dinner-options`
- Info ospiti (nomi, date nascita, contatti) → pagina "Guests & Contacts"
- Se un dato non è nella wiki → lascia `[TO COMPLETE]` visibile nel testo

**Tono — B2B professionale:**
Il destinatario è un travel agent americano professionista (es. Andrew Harper Travel). Scrivi per chi deve leggere velocemente e verificare la logistica.
- Priorità: struttura, servizi inclusi, orari, note operative, contatti
- Riduci del 40% le frasi enfatiche e descrittive: evita "indimenticabile", "magica", "straordinaria", "immerso nell'atmosfera di..."
- Frasi fattuali: "Private guided tour of the Uffizi — 2 hours, skip-the-line access included" invece di "Un'esperienza magica tra i capolavori del Rinascimento"
- Un minimo di calore è accettabile; la proposta deve però essere scansionabile in 30 secondi
- Le descrizioni dei luoghi possono essere evocative (1 frase) — i dettagli logistici devono essere esaurienti

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

### Step 4 — Salva la proposta

Chiama il tool `generate_proposal` con:
- `client_slug`: slug del cliente (es. `"kirk-family-2025"`)
- `html_content`: l'HTML completo compilato

Il sistema salva il file e fornisce automaticamente il link di download. **NON includere URL o link nel testo della risposta** — il pulsante di download è fornito automaticamente dal sistema.

### Step 5 — Riporta all'utente

Conferma solo:
- Proposta generata ✓
- Elenco dei `[TO COMPLETE]` rimasti (se presenti), così l'operatore sa cosa completare manualmente

**Non scrivere URL, percorsi di file o link** — il pulsante di download appare automaticamente sotto il messaggio.

---

## File coinvolti

| File | Ruolo |
|---|---|
| `templates/proposal-template.html` | Template base con variabili `{{...}}` — non modificare |
| `templates/proposals/proposal-[SLUG]-[DATE].html` | HTML compilato per questo cliente |
| `wiki/clienti/[slug].md` | Fonte dati principale del cliente |
| `wiki/fornitori/[slug].md` | Dettagli strutture e fornitori collegati |

---

## Gestione casi limite

| Caso | Comportamento |
|---|---|
| Cliente non in wiki | Avvisa operatore, chiedi dati o suggerisci `/ingest` — non procedere senza dati |
| Wiki ha dati parziali | Usa ciò che c'è, `[TO COMPLETE]` per il resto, elenca le lacune all'operatore |
| Viaggio multi-destinazione | Aggiungi pagine itinerario extra — nessun limite |
| Nessun dato di prezzo | Nessuna pagina Investment nel template — i prezzi vanno in documento separato |
| Guida non specificata | Lascia `[TO COMPLETE — guide TBD]` nella riga `.guide-line` |
