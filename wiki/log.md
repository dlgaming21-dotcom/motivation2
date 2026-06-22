# Wiki Log — Registro append-only

Ogni ingest aggiunge una entry in cima. Non modificare le entry esistenti.

## Formato

```
## YYYY-MM-DD — [operazione]
- **Fonte:** `raw/[path]`
- **Pagine create:** `wiki/[path]`
- **Pagine aggiornate:** `wiki/[path]` (campo X)
- **Cross-reference:** pagine toccate
```

---

## 2026-06-22 — refactor: creazione categoria wiki/agenzie/

### Operazione
- **Creata:** `wiki/agenzie/` — nuova categoria per agenzie di viaggio B2B (distinte dai fornitori di servizi)
- **Spostato:** `wiki/fornitori/andrew-harper-travel.md` → `wiki/agenzie/andrew-harper-travel.md`
  - `tipo:` aggiornato da `fornitore` a `agenzia`
  - `wiki/fornitori/andrew-harper-travel.md` ora è redirect stub
- **Aggiornato:** `wiki/index.md` — nuova sezione `## Agenzie`, AHT rimosso da Fornitori
- **Aggiornato:** `CLAUDE.md` — `wiki/agenzie/` aggiunto alla struttura wiki documentata

### Note
- I link `[[andrew-harper-travel]]` nei file clienti restano validi senza modifiche (lint risolve per categoria qualsiasi)
- RCS (citata in kehrer.md) non ha ancora pagina wiki — da creare al prossimo ingest se necessario

---

## 2026-06-22 — espansione fornitori e destinazioni (sessione 2)

### Fornitori creati (8 nuovi — totale 14)
- `wiki/fornitori/andrew-harper-travel.md` — agenzia USA principale, 7 clienti
- `wiki/fornitori/ncc-firenze-leonardo.md` — NCC Firenze, 3 clienti
- `wiki/fornitori/wilma-zanco.md` — greeter Venezia, 2 clienti · ⚠️ numero in conflitto tra Weeks (+340) e Goll (+338)
- `wiki/fornitori/laura-sabbadin.md` — guida Venezia S.Marco, 2 clienti
- `wiki/fornitori/fiorella-casartelli.md` — guida/accompagnatrice Lago di Como, 2 clienti
- `wiki/fornitori/villa-deste-cernobbio.md` — Grand Hotel 5★L Cernobbio, 2 clienti
- `wiki/fornitori/gse-leonardo.md` — NCC Roma 2 minivan, 3 clienti
- `wiki/fornitori/fausta-del-piano.md` — guida Roma Colosseo/Fori, 2 clienti

### Destinazioni create (5 nuove — totale 9)
- `wiki/destinazioni/milano.md` — Karger + Kirk · Ester Ghezzi guida standard
- `wiki/destinazioni/lago-di-como.md` — Kirk + Ditmore · Villa d'Este + Fiorella Casartelli
- `wiki/destinazioni/portofino.md` — Kirk + Schwartz TBA · Boris Cervar guida/driver
- `wiki/destinazioni/costiera-amalfitana.md` — Ostrovsky + Fourlon + Schwartz TBA · NCC Palma
- `wiki/destinazioni/puglia.md` — Kent-Lagoulis + Schwartz TBA · Lucia Ubertiello

### Indice aggiornato
- `wiki/index.md` → 12c / 14f / 9d

---

## 2026-06-22 — fix critici lint + creazione fornitori/destinazioni hub

### Fix critici
- **Spostato:** `wiki/thats-amore.md` (vuoto, misplaced) → redirect + `wiki/fornitori/thats-amore.md` (nuova, contenuto completo)
- **Spostato:** `wiki/avignonesi.md` (vuoto, misplaced) → redirect + `wiki/fornitori/avignonesi.md` (nuova, contenuto completo)
- **Corretto:** `[[palazzo-margherita]]` → `[[palazzo-margherita-bernalda]]` in `wiki/clienti/ostrovsky-gossel.md`
- **Standardizzato:** slug Andrew Harper → `[[andrew-harper-travel]]` in ostrovsky-gossel, goll, ditmore, kelly

### Fornitori creati (6 totali)
- `wiki/fornitori/thats-amore.md` — cooking class Roma, 2 clienti
- `wiki/fornitori/avignonesi.md` — cantina Toscana, 2 clienti
- `wiki/fornitori/daniele-meledandri.md` — guida Roma+Basilicata, 3 clienti (hub critico)
- `wiki/fornitori/ester-ghezzi.md` — guida Milano, 2 clienti
- `wiki/fornitori/maria-laura-giorgi.md` — guida Roma, 3 clienti (hub critico)
- `wiki/fornitori/are-group.md` — VIP assistance aeroporti, 5 clienti (hub critico)

### Destinazioni create (4 totali)
- `wiki/destinazioni/roma.md` — 5 clienti, tutti i fornitori mappati
- `wiki/destinazioni/venezia.md` — 2 clienti, nota contraddizione Wilma Zanco numero
- `wiki/destinazioni/firenze.md` — 3 clienti, NCC Leonardo come standard
- `wiki/destinazioni/toscana.md` — 4 clienti, esperienze signature mappate

### Indice aggiornato
- `wiki/index.md` — da 12c/0f/0d → 12c/6f/4d

---

## 2026-06-22 — ingest: schwartz
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Schwartz Italy Outline 24_10_09.docx`
- **Pagina:** `wiki/clienti/schwartz.md` (nuova)
- **Cross-reference aggiornati:** [[matera]] già in Ostrovsky · [[puglia]] già in Kent-Lagoulis · [[costiera-amalfitana]] già in Ostrovsky e Fourlon · [[genova]] già in Kehrer
- **Fornitori da creare:** hotel-santandrea-santa-margherita, la-fontenelle, hotel-poseidon-positano, aquatio-cave-hotel, palazzo-gattini, masseria-san-domenico
- **Destinazioni da creare:** santa-margherita-ligure, liguria, positano, capri
- **Note:** Proposta/outline datata ottobre 2024, viaggio giugno 2025. Molti TBA. Lingua da agenzia (terza parte). Status esecuzione sconosciuto. Grand Tour 24gg — itinerario più lungo in wiki. Palazzo Margherita (Ostrovsky) non citato per Matera.

## 2026-06-22 — ingest: kelly
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Kelly Programma Tecnico.docx`
- **Pagina:** `wiki/clienti/kelly.md` (nuova)
- **Cross-reference aggiornati:** [[lucia-monetti]] condivisa con Weeks · [[ncc-firenze-leonardo]] condiviso con Goll
- **Fornitori da creare:** villa-san-michele-fiesole, benjamin-pantani-guida, fattoria-pianporcino
- **Destinazioni da creare:** fiesole, pisa, lucca (firenze/siena/pienza già in altri)
- **Note:** Cliente con jet privato (Netjets/EMJ). Andrew Harper con referente nominale (Rosa Miranovic). Benjamin Pantani guida Firenze — terza guida diversa per Firenze (accanto a Fernanda Biserni e Ester Ghezzi). Fattoria Pianporcino Pienza — fornitore gastronomico non citato in altri viaggi.

## 2026-06-22 — ingest: fourlon
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Fourlon Program.docx`
- **Pagina:** `wiki/clienti/fourlon.md` (nuova)
- **Cross-reference aggiornati:** [[avignonesi]] già linkato in Goll
- **Fornitori da creare:** hilton-sorrento-palace, grand-hotel-continental-siena, hotel-aleph-roma, terranova-farm-sorrento, avignonesi (condiviso con Goll)
- **Destinazioni da creare:** sorrento, costiera-amalfitana (manca anche da Ostrovsky), val-dorcia (condivisa con Goll)
- **Note:** Documento è proposta lavorativa (con note interne), non programma tecnico. Mancano cognome, contatti, numero pax, agenzia. Kart tour Roma e Vespa Pienza sono esperienze signature da riproporre.

## 2026-06-22 — ingest: cheryl
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Cheryl's Family Piedmont tour.docx`
- **Pagina:** `wiki/clienti/cheryl.md` (nuova)
- **Cross-reference aggiornati:** nessuno
- **Fornitori da creare:** principe-di-piemonte-torino, relais-san-maurizio, castello-di-guarene, ristorante-del-cambio-torino, fontanafredda, baratti-e-milano-torino
- **Destinazioni da creare:** torino, piemonte, langhe, alba
- **Note:** Documento proposta senza dati cliente (cognome, contatti, anno preciso). Date voli nel doc suggeriscono 2022/23. Connessione finale con Villamagna (Abruzzo) — potenziale cliente con seconda casa là.

## 2026-06-22 — ingest: kehrer
- **Fonte:** `G:\Il mio Drive\MOTIVATION\M_M Kehrer Genova\Finali\`
- **Pagina:** `wiki/clienti/kehrer.md` (nuova)
- **Cross-reference aggiornati:** nessuno (fornitori Genova non ancora su wiki)
- **Fornitori da creare:** cooperativa-arte-e-natura-genova, genovarent, ristorante-i-tre-merli, karen-nilson-guida
- **Destinazioni da creare:** genova, portofino (già citata da Kirk per destinazioni)
- **Note:** Escursione da crociera SeaDream (1 giorno). Ken 86 anni, mobilità limitata — prototipo per future escursioni porto. RCS come agenzia. Stessa guida (Boris Cervar) non presente qui — diversi fornitori da Kirk.

## 2026-06-22 — ingest: ditmore
- **Fonte:** `G:\Il mio Drive\MOTIVATION\M_M Ditmore\Finali\`
- **Pagina:** `wiki/clienti/ditmore.md` (nuova)
- **Cross-reference aggiornati:** nessuno (fornitori non ancora su wiki)
- **Fornitori da creare:** villa-deste-cernobbio (condiviso con Kirk), fiorella-casartelli (condivisa con Kirk), villa-balbianello, servicevill, non-solo-barche, lago-maggiore-boat
- **Destinazioni da creare:** lago-di-como (già citata da Kirk), lago-maggiore
- **Note:** Voli TBC, camere Villa D'Este confermate solo venerdì 25/9. No alcol. Prefer minimal walking. Stessa guida di Kirk: Fiorella Casartelli.

## 2026-06-22 — ingest: goll
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Goll Venezia – Firenze - Roma\Finali\`
- **Pagina:** `wiki/clienti/goll.md` (nuova)
- **Cross-reference aggiornati:** nessuno (fornitori non ancora su wiki)
- **Fornitori da creare:** ca-sagredo, hotel-brunelleschi, borgo-scopeto, villa-spalletti, la-fornace-montalcino, avignonesi, vintage-tours, fernanda-biserni, wilma-zanco, laura-sabbadin (condivisa con Weeks), marco-pustetto (condiviso con Weeks), maria-laura-giorgi (condivisa con Weeks+Karger)
- **Destinazioni da creare:** venezia (condivisa con Weeks), firenze (condivisa con Weeks), toscana, siena, val-dorcia, assisi, roma (condivisa con Weeks+Karger)
- **Note:** Cicchetti tour Venezia cancellato ("no cicchetti" da Rachel). Mary MUST HAVE COFFEE. Daniele Meledandri compare anche nei fornitori Roma di Goll.

## 2026-06-22 — ingest: ostrovsky-gossel
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Ostrovsky Party Campania BAsilicata\Finali\`
- **Pagina:** `wiki/clienti/ostrovsky-gossel.md` (nuova)
- **Cross-reference aggiornati:** nessuno (fornitori non ancora su wiki)
- **Fornitori da creare:** belmond-caruso, palazzo-margherita-bernalda, grand-hotel-vesuvio, golden-dream-farm, ristorante-bollicine, palazzo-dei-poeti, silvio-scocuzza, daniele-meledandri (condiviso con Goll Roma e Weeks), pasquale-palma-ncc, antonio-carella-ncc
- **Destinazioni da creare:** costiera-amalfitana, basilicata, matera, ravello
- **Note:** Relazione dal 2017 (file storici non ancora ingestionati). Jerry 85 anni, mobilità ridotta. Connie anti-disuguaglianza — no yacht. Agenzia: Andrew Harper.

## 2026-06-22 — ingest: kent-lagoulis
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Kent & Lagoulis May\Finali\programma Tecnico Kent & Lagoulis.docx`
- **Pagina:** `wiki/clienti/kent-lagoulis.md` (nuova)
- **Cross-reference aggiornati:** nessuno (fornitori non ancora su wiki)
- **Fornitori da creare:** don-ferrante-monopoli, la-fiermontana-lecce, palazzo-bozzi-lecce, lucia-ubertiello, autoservizi-ferrara, are-group, circolo-ippico-tumara, ristorante-ucurdunn
- **Destinazioni da creare:** puglia, monopoli, lecce, alberobello, ostuni, otranto, polignano-a-mare
- **Note:** Coppia mid-80s con mobilità ridotta. Gloria cavallerizza. Nessuna allergia dichiarata. Agenzia: Andrew Harper Travel Holdings LLC.

## 2026-06-22 — ingest: famiglia-weeks
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Weeks Venezia – Firenze - Roma\Finali\Weeks party programma tecnico.docx`
- **Pagina:** `wiki/clienti/famiglia-weeks.md` (nuova)
- **Cross-reference aggiornati:** nessuno (fornitori non ancora su wiki — molti condivisi con Karger)
- **Fornitori da creare:** hotel-ai-reali-venezia, hotel-plaza-lucchesi-firenze, hotel-rose-garden-palace-roma, venezia-turismo, wilma-zanco, vilma-calzavara, laura-sabbadin, marco-pustetto, patrizia-vigiani, lucia-monetti, julia-nunez, rosanna-peluso, ncc-firenze-leonardo, funmoving
- **Fornitori condivisi con Karger:** daniele-meledandri, maria-laura-giorgi, fausta-del-piano, gse-leonardo, thats-amore, laura-paterno
- **Fornitori condivisi con Kirk:** ester-ghezzi (non Weeks), thats-amore
- **Destinazioni da creare:** venezia, firenze, roma
- **Note:** Restrizioni complesse: no alcol (David+Bev), gluten-free (Jonathan), no frutti di mare (Kyle+Natalie), no frutta a guscio (Natalie). Fotografo Romeo Mancori prenotato.

## 2026-06-22 — ingest: famiglia-karger
- **Fonte:** `G:\Il mio Drive\MOTIVATION\Karger 9 pax  mil verona Garda roma\Finali\Karger party programma tecnico aggiornato al 24 ottobre.docx`
- **Pagina:** `wiki/clienti/famiglia-karger.md` (nuova)
- **Cross-reference aggiornati:** nessuno (fornitori non ancora su wiki)
- **Fornitori da creare:** bulgari-milano, quellenhof-luxury-resort-lazise, hotel-de-la-ville-roma, stefano-mutti, andrea-recalcati, beta-viaggi, anelli-autoservizi, bersi-serlini-franciacorta, bertoldi-boats, ristorante-la-dolce-vita, ristorante-vittorio-emanuele-verona, ristorante-tre-scalini, garden-risto
- **Fornitori condivisi con Kirk:** ester-ghezzi, daniele-meledandri, fausta-del-piano (indirettamente)
- **Destinazioni da creare:** lago-di-garda, verona (+ milano e roma già in Weeks)
- **Note:** Nessuna allergia dichiarata. Birthday dinner per Richard (80 anni) il 27 giugno. 2 voli di partenza separati. Agenzia: Andrew Harper Travel Holdings LLC.

## 2026-06-22 — ingest: famiglia-kirk
- **Fonte:** `raw/clienti/proposal-kirk-family-2025.html`
- **Pagina:** `wiki/clienti/famiglia-kirk.md` (nuova)
- **Cross-reference aggiornati:** nessuno (wiki ancora vuota — link [[slug]] presenti nella pagina)
- **Fornitori da creare al prossimo ingest:** splendido-mare-portofino, mandarin-oriental-milano, villa-deste-cernobbio, boris-cervar, fiorella-casartelli, il-doge-camogli, il-ciliegio-monterosso, victoria-grill-varenna
- **Destinazioni da creare:** portofino, cinque-terre, milano, lago-di-como
- **Note:** Agenzia di origine non presente nel documento. Prezzo "upon request" — quota separata non inclusa.

## 2026-06-22 — Inizializzazione wiki
- **Operazione:** Creazione struttura iniziale wiki (LLM-Wiki pattern)
- **Pagine create:** `wiki/index.md`, `wiki/log.md`
- **Note:** Migrazione da Ragie a wiki locale. Struttura `raw/` e `wiki/` create. Nessun contenuto ancora ingested.
