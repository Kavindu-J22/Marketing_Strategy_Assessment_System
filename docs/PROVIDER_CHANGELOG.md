# Provider & Technology Changelog
**Project:** Marketing Strategy Assessment System  
**Framework:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Document ID:** `CHG-PROV-2026-001`  
**Date:** October 2026  
**Status:** Approved  

---

## 1. Summary of Changes

| Domain | Previous Provider / Component | New Standardized Provider / Component | Motivation / Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Relational Database** | Supabase PostgreSQL / Local Memory Store | PostgreSQL hosted via Prisma Postgres (`DATABASE_URL`, `DIRECT_URL`) | Central team database standardization; connection pooling via PgBouncer / Accelerate; shared infrastructure. |
| **Generative LLM (FR4)** | Google Gemini (`gemini-2.5-flash`, `google-genai` SDK) | OpenAI Chat & Responses API (`OPENAI_GENERATION_MODEL`, `openai` SDK) | Cross-team standardization on OpenAI generation with structured JSON schema enforcement; robust retry backoffs. |
| **Vector Storage (RAG)** | None | Pinecone Vector Database (Dense BYO-vectors, 3072 dimensions) | Dedicated managed vector search for Sri Lankan market intelligence; isolated namespaces per tenant and environment. |
| **Vector Embeddings** | None | OpenAI Embeddings API (`text-embedding-3-large`, 3072 dimensions) | Dense semantic vector representation aligned with 3072-dimensional Pinecone index; content hashing and batching. |
| **Authentication & RBAC**| Supabase Auth Bearer JWT | Better Auth Session & Signed Token Interoperability | Shared team identity provider; multi-tenant organization scoping; protection against forged forwarded headers. |
| **Audience Classifier (FR3)** | PyTorch Multimodal Classifier (`fusion_model.pt`) | **Unchanged** PyTorch Multimodal Classifier (`fusion_model.pt`) | Preserved 600-feature TF-IDF, categorical encoding, and numeric scaling to maintain research reproducibility. |
| **AHP Engine (FR5)** | Saaty Reciprocal Pairwise Engine | **Unchanged** Saaty Reciprocal Pairwise Engine | Pure mathematical multi-criteria decision modeling ($CR \le 0.10$); zero hallucinated weights. |
| **Budget Optimizer (FR6)**| SciPy SLSQP Optimization Engine | **Unchanged** SciPy SLSQP Optimization Engine | Constrained non-linear optimization with exact integer LKR allocation and reserve conservation. |

---

## 2. Component-by-Component Details

### 2.1 Generative AI: Gemini to OpenAI
- **Removed:** `gemini-2.5-flash` client initialization via `google.genai.Client`.
- **Added:** `MarketingMessageService` in `backend/app/services/openai_service.py` using `openai.OpenAI` client.
- **Safety Features:** Strict prompt injection defenses; rejection of fabricated ISO/SLSI credentials; deterministic fallback engine (`_generate_template_fallback`) that returns structured copy with `is_ai_generated=False` during outages.
- **Backward Compatibility:** `app/services/gemini_service.py` retained as an alias forwarding calls to `MarketingMessageService`.

### 2.2 Vector Retrieval & Knowledge Base: Pinecone + OpenAI Embeddings
- **Added:** `backend/app/services/embedding_service.py` enforcing exact 3072-dimensional vectors from `text-embedding-3-large`.
- **Added:** `backend/app/services/retrieval_service.py` querying Pinecone with metadata filtering and quality score thresholds ($\ge 0.35$).
- **Added:** `backend/app/services/ingestion_service.py` providing deterministic text chunking (120 words with 20-word overlap) and SHA-256 deduplication.
- **Added:** `backend/scripts/ingest_market_sources.py` CLI utility for indexing authorized Sri Lankan reports.

### 2.3 PostgreSQL & Prisma Postgres
- **Added:** Support for pooled `DATABASE_URL` and direct `DIRECT_URL` in `backend/app/core/config.py`.
- **Added:** SQLAlchemy session factory and connection pooling in `backend/app/core/database.py`.
- **Added:** DDL migration `supabase/migrations/20261022000001_team_stack_standardization.sql` creating:
  - `embedding_versions`
  - `knowledge_documents`
  - `knowledge_chunks`
  - `knowledge_ingestion_jobs`
  - `retrieval_audit_events`
  - `organization_auth_links`
- **Resilience:** Automatic fallback to in-memory repository when remote database is unconfigured or offline during local testing.

### 2.4 Authentication & Tenant Scoping: Better Auth
- **Added:** Session token extraction from Better Auth cookies (`better-auth.session_token`), Bearer headers, and `X-Session-Token`.
- **Added:** `require_tenant()` dependency verifying caller organization membership before executing data mutations.
- **Added:** `require_role()` dependency restricting administrative and researcher actions.

---
*Maintained by Principal Full-Stack Migration Architect.*
