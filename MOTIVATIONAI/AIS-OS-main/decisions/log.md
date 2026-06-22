# Decisions Log

Append-only record of meaningful decisions and why they were made. `/level-up` Phase 2 (Method interview) writes scoped automation specs here. You can also append manually whenever you decide something worth remembering.

**Format per entry:**

```
## YYYY-MM-DD — Short title

**Decision:** what was decided.

**Why:** the reasoning, constraints, and what would change your mind.

**Alternatives considered:** what else was on the table.

**Owner:** who's accountable.
```

Keep it terse. Future-you will thank present-you for capturing the *why*, not just the *what*.

---

## 2026-06-21 — Architettura document intelligence: Ragie + Airtable

**Decision:** Stack a due layer per comunicare con il database documentale OneDrive (5-6 anni di documenti agenzia di lusso): Ragie.ai come RAG layer per Q&A semantico + Airtable come layer strutturato per analytics e relazioni. Entrambi connessi all'AIOS via MCP server.

**Why:** RAG puro non copre tutti e 4 i use case richiesti (Q&A semantico, entity lookup, analytics, automazioni). Passare fatture a Claude per sommare numeri è 50x meno efficiente rispetto a una query Airtable. Ragie è l'unica opzione no-code con connettore OneDrive nativo + MCP ufficiale + entity extraction built-in. Microsoft 365 Copilot scartato perché non ha API programmabile (non richiamabile da skill AIOS).

**Alternatives considered:** M365 Copilot (no API), Azure AI Search (non no-code), AnythingLLM (no OneDrive connector), GraphRAG (overkill per lookup strutturati), NotebookLM (no automazioni).

**Token efficiency:** routing per tipo di query ottiene 60-85% di risparmio vs RAG naive. Analytics → Airtable (200-500 token). Semantic → Ragie topK=4 (2.000-6.000 token). Prompt caching sul system prompt (-90% token di sistema).

**Owner:** Da implementare in 3 fasi — Fase 1 (giorni 1-3): Ragie + MCP. Fase 2 (settimane 2-3): Airtable + routing skill. Fase 3 (mese 2): skill /client-brief, /generate-proposal, /destination-report.

---
