# Wiki Index — Motivation AIOS

Catalogo live della knowledge base. Si aggiorna automaticamente ad ogni `/ingest`.

---

## Clienti

```dataview
TABLE agenzia, tipologia, destinazioni, prima-relazione AS "Dal"
FROM "clienti"
WHERE tipo = "cliente"
SORT prima-relazione DESC
```

_Pagine manuali (visibili anche senza Dataview):_
- [Famiglia Kirk](clienti/famiglia-kirk.md) — Portofino & Lago di Como, luglio 2025 · 8 ospiti · No alcol · jet privato
- [Famiglia Karger](clienti/famiglia-karger.md) — Milano · Garda · Verona · Roma, giu 2026 · 9 ospiti · birthday Richard · Andrew Harper
- [Famiglia Weeks](clienti/famiglia-weeks.md) — Venezia · Firenze · Roma, giu 2026 · 9 ospiti · No alcol · gluten-free · Andrew Harper
- [Kent & Lagoulis](clienti/kent-lagoulis.md) — Puglia, mag 2026 · 2 ospiti · mid-80s · equitazione Gloria · Andrew Harper
- [Ostrovsky & Gossel](clienti/ostrovsky-gossel.md) — Campania + Basilicata, apr–mag 2026 · 2 ospiti · no alcol no · Andrew Harper · relazione dal 2017
- [Goll](clienti/goll.md) — Venezia · Firenze · Toscana · Roma, mar 2026 · 2 ospiti · coffee required Mary · Andrew Harper
- [Ditmore](clienti/ditmore.md) — Lago di Como + Lago Maggiore, set 2026 · 2 ospiti · no alcol · minimal walking · Andrew Harper
- [Kehrer](clienti/kehrer.md) — Escursione Genova + Portofino (crociera SeaDream), mag 2026 · 2 ospiti · Ken 86 anni · RCS
- [Cheryl](clienti/cheryl.md) — Piemonte (Torino · Alba · Langhe), 2022/23 · famiglia · ⚠️ cognome/contatti mancanti
- [Fourlon](clienti/fourlon.md) — Sorrento · Amalfi · Siena · Roma, nov 2023 · 2 ospiti · ⚠️ contatti mancanti
- [Kelly](clienti/kelly.md) — Firenze & Fiesole, set 2023 · 2 ospiti · jet privato · Andrew Harper · Benjamin Pantani guida
- [Schwartz](clienti/schwartz.md) — Grand Tour 24gg: Liguria · Toscana · Costiera · Matera · Puglia, giu-lug 2025 · 2 ospiti · ⚠️ proposta TBA

---

## Agenzie

```dataview
TABLE categoria, stato
FROM "agenzie"
WHERE tipo = "agenzia"
SORT nome ASC
```

- [Andrew Harper Travel](agenzie/andrew-harper-travel.md) — Agenzia USA principale · 7 clienti · Rosa Miranovic referente

---

## Fornitori

```dataview
TABLE categoria, destinazione, stelle, rating
FROM "fornitori"
WHERE tipo = "fornitore"
SORT categoria ASC
```

- [That's Amore](fornitori/thats-amore.md) — Cooking class Pizza & Gelato, Trastevere · 2 clienti (Karger, Weeks)
- [Avignonesi](fornitori/avignonesi.md) — Cantina wine tasting premium, Val d'Orcia · Ilaria Roccanti · 2 clienti (Goll, Fourlon)
- [Daniele Meledandri](fornitori/daniele-meledandri.md) — Guida/assistente Roma + Basilicata · +39 346 801 6736 · 3 clienti
- [Ester Ghezzi](fornitori/ester-ghezzi.md) — Guida Milano · +39 347 770 1285 · 2 clienti (Karger, Kirk)
- [Maria Laura Giorgi](fornitori/maria-laura-giorgi.md) — Guida Roma (Barocca, Vaticano) · +39 340 8422795 · 3 clienti
- [ARE Group](fornitori/are-group.md) — VIP assistance multi-aeroporto · coord@aregroup.com · 5 clienti
- [NCC Firenze Leonardo](fornitori/ncc-firenze-leonardo.md) — NCC Firenze standard · +39 348 140 2548 · 3 clienti
- [Wilma Zanco](fornitori/wilma-zanco.md) — Greeter/assistente Venezia · ⚠️ numero da verificare · 2 clienti
- [Laura Sabbadin](fornitori/laura-sabbadin.md) — Guida Venezia (S.Marco) · +39 347 8145286 · 2 clienti
- [Fiorella Casartelli](fornitori/fiorella-casartelli.md) — Guida/accompagnatrice Lago di Como · +39 348 5114649 · 2 clienti
- [Villa d'Este Cernobbio](fornitori/villa-deste-cernobbio.md) — Grand Hotel 5★L Cernobbio · reservations@villadeste.it · 2 clienti
- [GSE Leonardo](fornitori/gse-leonardo.md) — NCC Roma standard (2 minivan gruppi) · +39 320 472 9365 · 3 clienti
- [Fausta Del Piano](fornitori/fausta-del-piano.md) — Guida Roma (Colosseo/Fori) · +39 329 636 6077 · 2 clienti

---

## Destinazioni

```dataview
TABLE regione, stagione-alta AS "Alta stagione"
FROM "destinazioni"
WHERE tipo = "destinazione"
SORT file.name ASC
```

- [Roma](destinazioni/roma.md) — 5 clienti · guide: maria-laura-giorgi, daniele-meledandri · hotel: de-la-ville, rose-garden, villa-spalletti, aleph
- [Venezia](destinazioni/venezia.md) — 2 clienti (Weeks, Goll) · guide: laura-sabbadin, wilma-zanco · hotel: ai-reali, ca-sagredo
- [Firenze](destinazioni/firenze.md) — 3 clienti (Weeks, Goll, Kelly) · NCC Leonardo standard · hotel: plaza-lucchesi, brunelleschi, villa-san-michele
- [Toscana](destinazioni/toscana.md) — 4 clienti · esperienze: Avignonesi, La Fornace, eBike Chianti, Vespa Val d'Orcia
- [Milano](destinazioni/milano.md) — 2 clienti (Karger, Kirk) · guida: Ester Ghezzi · hotel: Bulgari, Mandarin Oriental
- [Lago di Como](destinazioni/lago-di-como.md) — 2 clienti (Kirk, Ditmore) · hotel: Villa d'Este · guida: Fiorella Casartelli
- [Portofino](destinazioni/portofino.md) — 2 clienti (Kirk, Schwartz TBA) · hotel: Splendido Mare · guida: Boris Cervar
- [Costiera Amalfitana](destinazioni/costiera-amalfitana.md) — 3 clienti (Ostrovsky, Fourlon, Schwartz TBA) · NCC Pasquale Palma
- [Puglia](destinazioni/puglia.md) — 2 clienti (Kent-Lagoulis, Schwartz TBA) · guida: Lucia Ubertiello

---

## Processi

```dataview
LIST
FROM "processi"
WHERE tipo = "processo"
```

_Nessuna pagina ancora._

---

*Ultimo aggiornamento: 2026-06-22 — 12 clienti, 1 agenzia, 13 fornitori, 9 destinazioni*
