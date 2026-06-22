# AIS-OS Intake

This is the source-of-truth file for your AIOS. Fill it in by typing, voice-pasting (Wispr Flow / OS dictation), or running `/onboard` for a guided conversation. Whichever mode, this file is what `/onboard` reads to scaffold your Day-1 setup.

**Hard cap: 7 questions.** Each answerable in under 60 seconds. Don't overthink — you can edit and re-run `/onboard` any time.

---

## Q1 — Who are you, what do you sell, who do you sell it to?

Identity, offer, ICP. One paragraph each is fine.

```
Siamo un tour operator specializzato in turismo incoming in Italia per clienti privati (High Net Worth Individuals) e gruppi. Vendiamo tour tailor-made nelle destinazioni più iconiche d'Italia. Il cliente target è Premium Luxury, solitamente over 65, molto innamorato delle esperienze italiane e con aspettative molto alte.
```

---

## Q2 — Paste 1-2 things you've written recently. Don't edit them.

An email, a LinkedIn post, a DM, a doc — anything that sounds like you when you're not trying. **Paste verbatim.** Do not type these mid-conversation with Claude — chat-shaped samples are worse than no samples (voice contamination).

```
[Sample 1 — paste raw]
```

```
[Sample 2 — paste raw]
```

---

## Q3 — What are your 2-3 biggest priorities for the next 90 days?

Quarterly priorities. Not yearly aspirations. Things that, if not done by July, would make you say "I wasted Q2."

```
1. Creare proposte viaggio automatiche per i clienti basate sulla conoscenza passata e i requisiti del cliente.
2. Inviare richieste automatiche ai fornitori di servizi (hotel, ristoranti, guide turistiche, staff, autisti NCC, ecc.) per prezzi e disponibilità in base al programma e alle date proposti.
3. Ricevere conferme scritte dai fornitori e riassumere lo stato del viaggio in un documento di project management.
```

---

## Q4 — Where does revenue actually land, and where is it tracked?

Multiple answers OK. Stripe? Skool? GoHighLevel? QuickBooks? A spreadsheet?

```
I ricavi arrivano sui conti correnti bancari aziendali. Il tracking viene fatto manualmente su un file Excel.
```

---

## Q5 — Where do you talk to customers, your team, and the outside world day-to-day?

Email (which one — Gmail / Outlook)? Slack? Teams? DMs (Skool / Discord / iMessage)? Phone?

```
Email (attualmente Outlook, migrazione in corso verso Gmail — il testing AIOS si fa su Gmail), WhatsApp, telefono. Le richieste dei clienti arrivano principalmente via email e WhatsApp. Coordinamento fornitori via email e telefono. Calendario: Google Calendar (Gmail).
```

---

## Q6 — Where do meeting recordings, notes, and important docs live?

Granola? Otter? Fireflies? Google Drive? Notion? Dropbox? A folder on your desktop you keep meaning to organize?

```
Attualmente Office 365 SharePoint. Migrazione in corso verso Google Drive (già connesso a Ragie per il testing). Nessuna registrazione di meeting — solo documenti importanti: programmi viaggio, conferme fornitori, feedback clienti, proposte. Il testing AIOS si fa su Google Drive.
```

---

## Q7 — What's the one task that eats your week, and where do you currently track work?

The single biggest time-suck or recurring drudgery. Plus where tasks/projects live (ClickUp / Asana / Linear / Notion / a notebook).

```
Le attività più time-consuming:
1. Preparare la proposta viaggio per i clienti
2. Richiedere disponibilità e prezzi ai fornitori di servizi
3. Creare la proposta finanziaria per il cliente
4. Gestire i fornitori durante il viaggio del cliente e verificare che tutto proceda come pianificato

Nessun sistema di tracking strutturato menzionato — da definire.
```

---

When this file is filled, run `/onboard` (or re-run it) and the wizard will scaffold your Day-1 file set: `context/`, `references/voice.md`, populated `connections.md`, and a filled `CLAUDE.md`.
