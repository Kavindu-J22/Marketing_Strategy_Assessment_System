# Developer Migration Guide: Team Stack Standardization
**Project:** Marketing Strategy Assessment System  
**Framework:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Document ID:** `GUIDE-MIG-2026-001`  
**Date:** October 2026  
**Status:** Approved Standard  

---

## 1. Overview

This guide details the technical instructions for setting up, configuring, and verifying the standardized technology stack for the **Marketing Strategy Assessment System**.

### Standardized Stack Summary
- **Frontend:** React 19 + TypeScript + Vite + Material UI (MUI v9 syntax).
- **Backend:** Python FastAPI (3.10+) with Pydantic v2 schemas.
- **Relational Storage:** PostgreSQL hosted on Prisma Postgres (`DATABASE_URL` for application queries, `DIRECT_URL` for DDL migrations).
- **Vector Database:** Pinecone Vector Database with dense BYO-vectors (3072 dimensions, cosine distance metric).
- **Embeddings:** OpenAI `text-embedding-3-large` (3072 dimensions).
- **Generative AI:** OpenAI Responses / Chat API with structured JSON output and deterministic template fallback.
- **Identity & Authentication:** Better Auth session and token interoperability with tenant-scoped authorization.
- **Machine Learning & Math:** Pre-trained PyTorch multimodal neural network (FR3), Saaty AHP (FR5), and SciPy SLSQP (FR6) preserved without alteration.

---

## 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Populate `.env` with freshly rotated server-side secrets (never commit `.env`):
   ```dotenv
   # Relational Database
   DATABASE_URL="postgresql://USER:PASSWORD@pooled.db.prisma.io:5432/postgres?sslmode=require"
   DIRECT_URL="postgresql://USER:PASSWORD@db.prisma.io:5432/postgres?sslmode=require"

   # OpenAI Credentials
   OPENAI_API_KEY="sk-proj-YOUR_ROTATED_KEY"
   OPENAI_EMBEDDING_MODEL="text-embedding-3-large"
   OPENAI_GENERATION_MODEL="gpt-4o-mini"

   # Pinecone Vector Database
   PINECONE_API_KEY="pcsk_YOUR_ROTATED_KEY"
   PINECONE_INDEX_HOST="https://YOUR_INDEX_NAME.svc.REGION.pinecone.io"
   PINECONE_INDEX_NAME="smart-tech-consulting-platform"
   PINECONE_NAMESPACE_PREFIX="staging-marketing"
   RAG_ENABLED=true

   # Shared Team Authentication
   BETTER_AUTH_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="YOUR_ROTATED_BETTER_AUTH_SECRET"
   ```

*(Note: If API keys or database URLs are omitted or offline during local development, the backend automatically engages its resilient offline fallback mode: in-memory datastore, deterministic template generation, and local semantic search).*

---

## 3. Database Migration & Schema Deployment

### Direct Connection DDL Deployment
When deploying schema changes to the team Prisma Postgres instance, use `DIRECT_URL`:

1. Apply core schema:
   ```bash
   psql "$DIRECT_URL" -f supabase/migrations/20261020000001_initial_schema.sql
   ```
2. Apply RLS policies:
   ```bash
   psql "$DIRECT_URL" -f supabase/migrations/20261020000002_rls_policies.sql
   ```
3. Apply team standardization tables (knowledge documents, chunks, Better Auth links):
   ```bash
   psql "$DIRECT_URL" -f supabase/migrations/20261022000001_team_stack_standardization.sql
   ```
4. Seed channel catalog and baseline criteria:
   ```bash
   psql "$DIRECT_URL" -f supabase/seed/seed.sql
   ```

---

## 4. Market Knowledge Ingestion into Pinecone & PostgreSQL

To populate the knowledge base with authorized Sri Lankan market intelligence (DataReportal Digital 2026, ICTA Strategy 2030, EDB Export Overview):

```bash
python backend/scripts/ingest_market_sources.py
```
This CLI script:
- Verifies document authorization.
- Computes SHA-256 content hashes.
- Deterministically chunks text passages.
- Generates 3072-dimensional embeddings via OpenAI `text-embedding-3-large`.
- Upserts vectors into Pinecone under namespace `staging-marketing-public`.
- Stores canonical document and chunk records in PostgreSQL.

---

## 5. Running the Application Locally

### Starting Backend (FastAPI)
```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

### Starting Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Application interface: `http://localhost:5173`

---

## 6. Running Tests & Quality Gates

Run Python unit and security tests:
```bash
python -m pytest backend/tests/unit -v
```

Run frontend build verification:
```bash
cd frontend
npm run build
```

---

## 7. Rollback Procedure

If a deployment blocker arises on the shared infrastructure:
1. **Database Rollback:** The backend repository layer automatically detects if PostgreSQL is unreachable and falls back to its in-memory transactional store with zero application downtime.
2. **OpenAI / LLM Rollback:** If the OpenAI API is unreachable or rate-limited, `MarketingMessageService` engages its deterministic rule-based template engine (`is_ai_generated=False`).
3. **Pinecone Rollback:** If Pinecone is unreachable, `KnowledgeRetriever` automatically executes relational text queries over canonical `knowledge_documents` in PostgreSQL.
4. **Git Branch Reversion:** To revert code changes, restore the `main` branch:
   ```bash
   git checkout main
   ```

---
*Maintained by Principal Full-Stack Migration Architect.*
