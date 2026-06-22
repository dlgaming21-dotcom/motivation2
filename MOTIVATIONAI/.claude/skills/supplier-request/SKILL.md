---
name: supplier-request
description: Genera email di richiesta disponibilità e preventivo ai fornitori (hotel, ristoranti, guide, autisti NCC, esperienze) a partire dal programma di un viaggio. Salva le bozze in templates/supplier-requests/. Trigger su "richiesta fornitori", "manda richiesta a", "prepara le richieste per [CLIENTE]", "/supplier-request [CLIENTE]".
---

## Cosa fa questa skill

Dato un programma di viaggio, produce una bozza di email professionale per ogni fornitore da contattare:

1. Recupera il programma tecnico da Ragie (o dall'input utente)
2. Identifica tutti i fornitori: hotel, ristoranti, guide, autisti NCC, esperienze
3. Genera un'email personalizzata per ciascuno in base alla categoria
4. Salva le bozze in `templates/supplier-requests/[cliente-slug]/`
5. Produce un riepilogo con tutti i fornitori da contattare

**REGOLA ASSOLUTA: le email non partono mai automaticamente.** La skill salva sempre le bozze e si ferma. L'invio avviene solo se l'operatore lo chiede esplicitamente dopo aver visto le bozze.

---

## Trigger

- "prepara le richieste fornitori per [CLIENTE]"
- "manda richiesta a [FORNITORE] per [CLIENTE]"
- "richiesta disponibilità [CLIENTE]"
- "/supplier-request [CLIENTE]"

---

## Esecuzione

### Step 1 — Raccogli dati viaggio

Dal messaggio utente, estrai:
- **Nome cliente / gruppo** — per i filename e il riferimento nelle email
- **Date** — check-in / check-out per ogni segmento
- **Numero PAX** — per hotel (camere), ristoranti (coperti), esperienze
- **Deadline risposta richiesta** — default: 48h da oggi

Se non forniti, interroga Ragie prima di chiedere all'utente:
```powershell
.\scripts\ragie-retrieve.ps1 -Query "[CLIENTE] programma fornitori hotel ristoranti guide" -TopK 10
```

### Step 2 — Identifica fornitori

Dal programma, estrai una lista strutturata per tipo:

| Tipo | Dati da estrarre |
|------|-----------------|
| Hotel / Property | nome, date check-in/out, N camere, tipologia camera |
| Ristorante | nome, data, ora, N coperti, eventuali menu/allergie |
| Guida | nome o "TBD", date, orari, lingua, specialità |
| Autista NCC | date, tratte, tipo veicolo, N PAX |
| Esperienza | nome attività, data, ora, N PAX, dettagli specifici |

Se un fornitore ha già email/telefono in Airtable Suppliers, recuperala. Altrimenti lascia `[CONTATTO DA VERIFICARE]`.

### Step 3 — Genera le email

Per ogni fornitore, usa il template corrispondente alla categoria (vedi sezione **Template email** più sotto).

**Lingua:** italiano per default. Inglese se il nome del fornitore o il contesto suggerisce fornitore internazionale.

**Variabili comuni a tutte le email:**
- `[FORNITORE]` — nome del fornitore
- `[DATES]` — date specifiche del servizio
- `[N_PAX]` — numero ospiti
- `[REF]` — riferimento interno (es. "Karger Group — giugno 2026")
- `[DEADLINE]` — data di risposta richiesta (default: oggi + 2 giorni lavorativi)

### Step 4 — Salva le bozze

Crea la cartella se non esiste:
```
templates/supplier-requests/[cliente-slug]-[YYYY-MM-DD]/
```

Per ogni fornitore, salva:
```
[numero]-[tipo]-[nome-fornitore].txt
```
Esempio: `01-hotel-villa-crespi.txt`, `02-ristorante-dal-pescatore.txt`

Formato file:
```
TO: [email fornitore o CONTATTO DA VERIFICARE]
SUBJECT: [oggetto email]
---
[corpo email]
```

### Step 5 — Riepilogo

Dopo aver salvato tutte le bozze, mostra una tabella:

| # | Tipo | Fornitore | Date | Contatto | File |
|---|------|-----------|------|----------|------|
| 1 | Hotel | Villa Crespi | 3-5 lug | info@villacrespi.it | 01-hotel-villa-crespi.txt |
| ... | | | | | |

Indica quante bozze sono pronte e ricorda all'utente di verificare i `[CONTATTO DA VERIFICARE]` prima dell'invio.

---

## Template email per categoria

### Hotel / Property

```
Oggetto: Richiesta disponibilità — [DATES] — Motivation m.i.c.e. srl — Rif. [REF]

Gentile [FORNITORE],

siamo Motivation m.i.c.e. srl, tour operator incoming specializzato in viaggi tailor-made di lusso in Italia.

Vi scriviamo per richiedere disponibilità per un gruppo privato:

▸ Check-in: [DATA ARRIVO]
▸ Check-out: [DATA PARTENZA] ([N] notti)
▸ Ospiti: [N_PAX] persone
▸ Camere richieste: [N_CAMERE] [TIPOLOGIA] (es. Deluxe, Suite)
[▸ Note speciali: anniversario / allergie / richieste specifiche se presenti]

Vi chiedo cortesemente di confermarci disponibilità e tariffe nette entro il [DEADLINE].

Rimango a disposizione per qualsiasi chiarimento.

Cordiali saluti,
Davide Lamanna
Motivation m.i.c.e. srl
```

### Ristorante

```
Oggetto: Richiesta prenotazione — [DATA] — [N_PAX] coperti — Motivation m.i.c.e. srl

Gentile [FORNITORE],

siamo Motivation m.i.c.e. srl, tour operator incoming per viaggi di lusso in Italia.

Desideriamo prenotare per:

▸ Data: [DATA]
▸ Orario: [ORA] (flessibile di ±30 minuti se necessario)
▸ Coperti: [N_PAX]
▸ Riferimento: [REF]
[▸ Allergie / intolleranze: [DETTAGLIO se presente]]
[▸ Richiesta: menu degustazione / carta / menu fisso per gruppo]

Potete confermarci disponibilità e condizioni entro il [DEADLINE]?

Cordiali saluti,
Davide Lamanna
Motivation m.i.c.e. srl
```

### Guida turistica

```
Oggetto: Richiesta disponibilità guida — [DATES] — Motivation m.i.c.e. srl

Gentile [NOME GUIDA / Gentili],

siamo Motivation m.i.c.e. srl, tour operator incoming specializzato in lusso incoming in Italia.

Cerchiamo una guida per il seguente servizio:

▸ Data/e: [DATES]
▸ Orari: [ORA INIZIO] → [ORA FINE] (circa [N] ore)
▸ Gruppo: [N_PAX] ospiti
▸ Lingua: [LINGUA]
▸ Percorso / Tema: [DESCRIZIONE es. "visita privata Galleria Borghese + area fori"]
▸ Riferimento: [REF]

Siete disponibili? Potete inviarci la vostra tariffa per questo servizio entro il [DEADLINE]?

Cordiali saluti,
Davide Lamanna
Motivation m.i.c.e. srl
```

### Autista NCC

```
Oggetto: Richiesta disponibilità transfer — [DATES] — Motivation m.i.c.e. srl

Gentile [FORNITORE],

siamo Motivation m.i.c.e. srl, tour operator incoming per viaggi tailor-made di lusso.

Cerchiamo copertura transfer per:

▸ Data/e: [DATES]
▸ Tratte: [ELENCO TRATTE es. "Roma FCO → Hotel de Russie", "Roma → Firenze"]
▸ Passeggeri: [N_PAX]
▸ Veicolo: [TIPO es. van luxury, berlina, minibus]
▸ Riferimento: [REF]

Siete disponibili? Potete quotarci il servizio entro il [DEADLINE]?

Cordiali saluti,
Davide Lamanna
Motivation m.i.c.e. srl
```

### Esperienza / Attività

```
Oggetto: Richiesta disponibilità — [NOME ESPERIENZA] — [DATA] — Motivation m.i.c.e. srl

Gentile [FORNITORE],

siamo Motivation m.i.c.e. srl, tour operator incoming specializzato in esperienze di lusso in Italia.

Vorremmo organizzare per i nostri ospiti:

▸ Esperienza: [NOME ATTIVITÀ]
▸ Data: [DATA]
▸ Orario preferito: [ORA]
▸ Partecipanti: [N_PAX]
▸ Riferimento: [REF]
[▸ Richieste speciali: [DETTAGLIO se presente]]

Potete confermarci disponibilità e condizioni entro il [DEADLINE]?

Cordiali saluti,
Davide Lamanna
Motivation m.i.c.e. srl
```

---

## Invio email di test

Per inviare una bozza all'indirizzo di test, usare `scripts/send-draft-email.ps1`:

```powershell
.\scripts\send-draft-email.ps1 -DraftFile "templates/supplier-requests/[cartella]/[file].txt" -TestMode
```

Con `-TestMode` l'email viene mandata a `davidelamanna1109@gmail.com` invece del destinatario reale.

Prerequisiti: `GMAIL_APP_PASSWORD` nel `.env` (impostazioni Google Account → Sicurezza → Password per le app).

---

## File coinvolti

| File | Ruolo |
|------|-------|
| `templates/supplier-requests/[slug]/` | Cartella bozze per cliente |
| `scripts/send-draft-email.ps1` | Script invio test via Gmail SMTP |
| `scripts/ragie-retrieve.ps1` | Recupero dati programma |
| Airtable → Suppliers | Lookup contatti fornitori esistenti |
