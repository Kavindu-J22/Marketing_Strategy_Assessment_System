# RAG Knowledge Data Provenance & Source Registry
**Project:** Marketing Strategy Assessment System  
**Framework:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Document ID:** `PROV-RAG-2026-001`  
**Date:** October 2026  
**Status:** Approved Research Registry  

---

## 1. Provenance Statement & Academic Integrity

In compliance with academic research standards, this document explicitly distinguishes between:
1. **Synthetic Simulation Research Datasets:** The 5,000 scenario records used for pre-training the multimodal neural network (FR3), AHP simulation, and budget constraints. These records represent simulated enterprise profiles and **must not be characterized as empirical market truth**.
2. **Authorized External Benchmark Documents:** Authenticated, publicly accessible research publications and government policy roadmaps from recognized Sri Lankan authorities. These documents are ingested into the Pinecone vector database and PostgreSQL knowledge tables to ground generative marketing outputs (FR4) and channel reach estimates (FR5) with traceable citations.

---

## 2. Ingested Market Intelligence Documents

### 2.1 Digital 2026: Sri Lanka National Digital Connectivity Benchmark
- **Document ID:** `doc-datareportal-sl-2026`
- **Publisher:** Kepios / DataReportal
- **Publication Date:** February 2026
- **Accessed Date:** October 2026
- **Canonical URL:** `https://datareportal.com/reports/digital-2026-sri-lanka`
- **Geographic Scope:** Sri Lanka National
- **Trust Tier:** Tier 1 - Public Industry Benchmark
- **Licensing & Usage:** Publicly released annual statistical report; cited for non-commercial academic research and decision modeling.
- **Key Empirical Benchmarks Ingested:**
  - Total internet users: 16.4 million (74.5% penetration rate).
  - Social media user identities: 8.10 million.
  - Facebook eligible reach: 7.30 million (primary SME discovery network).
  - YouTube adult reach: 6.90 million (lead video and software demo platform).
  - Mobile connections: 32.8 million (148% penetration; multi-SIM smartphone adoption).
- **Pinecone Chunk Mapping:**
  - `doc-datareportal-sl-2026#chunk-0000` (Vector ID: `doc-datareportal-sl-2026#chunk-0000`)
  - Namespace: `staging-marketing-public`

### 2.2 National Digital Economy Strategy 2030
- **Document ID:** `doc-icta-strategy-2030`
- **Publisher:** Information and Communication Technology Agency (ICTA) of Sri Lanka
- **Publication Date:** May 15, 2023
- **Accessed Date:** October 2026
- **Canonical URL:** `https://www.icta.lk/icta-assets/uploads/2023/05/Annex-1-National-Digital-Strategy-2030.pdf`
- **Geographic Scope:** Sri Lanka National
- **Trust Tier:** Tier 1 - Government Policy Document
- **Licensing & Usage:** Public government policy roadmap for national technology enablement.
- **Key Empirical Benchmarks Ingested:**
  - Goal of expanding ICT/BPM digital economy to $5 Billion.
  - Priority digitalization of 100,000 local micro, small, and medium enterprises (MSMEs).
  - Primary adoption barriers: low technical literacy among traditional merchant owners, fear of vendor lock-in, and unfamiliarity with recurring SaaS billing.
  - Recommended marketing strategies: localized onboarding, Sinhala/Tamil interfaces, transparent LKR pricing.
- **Pinecone Chunk Mapping:**
  - `doc-icta-strategy-2030#chunk-0000` (Vector ID: `doc-icta-strategy-2030#chunk-0000`)
  - Namespace: `staging-marketing-public`

### 2.3 Sri Lanka Export Performance & ICT/BPM Sector Overview
- **Document ID:** `doc-edb-export-2025`
- **Publisher:** Sri Lanka Export Development Board (EDB)
- **Publication Date:** January 15, 2026
- **Accessed Date:** October 2026
- **Canonical URL:** `https://www.srilankabusiness.com/news/sri-lankas-export-performance-exceeded-us-17.2-billion-in-2025.html`
- **Geographic Scope:** Sri Lanka National & Export Markets
- **Trust Tier:** Tier 1 - Government Trade Authority
- **Licensing & Usage:** Official trade statistics and sectoral performance bulletin.
- **Key Empirical Benchmarks Ingested:**
  - ICT/BPM sector recognized as top-tier net foreign exchange contributor.
  - Active ecosystem of over 500 tech startups and scale-ups.
  - High efficacy of professional B2B marketing channels (LinkedIn, Google Search Ads, case study marketing) for regional and global tech export sales.
- **Pinecone Chunk Mapping:**
  - `doc-edb-export-2025#chunk-0000` (Vector ID: `doc-edb-export-2025#chunk-0000`)
  - Namespace: `staging-marketing-public`

---

## 3. Vector Embedding Specifications & Storage Design

| Parameter | Specification | Verification Method |
| :--- | :--- | :--- |
| **Embedding Model** | OpenAI `text-embedding-3-large` | Configured via `OPENAI_EMBEDDING_MODEL` |
| **Vector Dimensionality** | Exactly `3072` floats | Dimension verification in `EmbeddingService.embed_batch()` |
| **Index Type** | Pinecone Dense Vector BYO-vectors Index | Verified via Pinecone REST API metadata |
| **Distance Metric** | Cosine Similarity | Pre-configured in Pinecone index |
| **Namespace Isolation** | Public sources: `{prefix}-public`<br>Tenant sources: `{prefix}-{organization_id}` | Enforced by `KnowledgeRetriever` and `KnowledgeIngestionService` |
| **Chunking Parameters** | 120 words per chunk, 20-word overlap | `KnowledgeIngestionService._chunk_text()` |
| **Deduplication** | SHA-256 content hash check before re-indexing | Relational table `knowledge_documents.content_hash` |

---

## 4. Citation Integrity & Anti-Hallucination Guardrails

1. Every RAG hit returned to `MarketingMessageService` includes `source_id`, `title`, and `trust_tier`.
2. Citations are attached to generated strategy reports in `report.source_citations`.
3. If no relevant vector passage scores above the minimum threshold (`score >= 0.35`), the retriever falls back to canonical relational source benchmarks rather than fabricating data.
4. Generative models are forbidden via system instructions from asserting ISO/SLSI certifications or inventing customer statistics that do not appear in user product data or verified RAG context.

---
*Maintained by Principal Full-Stack Migration Architect & Research Lead.*
