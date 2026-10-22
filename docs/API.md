# API Specification: Marketing Strategy Assessment
**Component of:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Document Version:** 1.1.0 - Standardized Team Stack (October 2026)  
**Base URL:** `http://localhost:8000/api/v1`  
**Authentication:** Better Auth Session Cookie (`better-auth.session_token`) or `Authorization: Bearer <token>`  
**Specification Standard:** OpenAPI 3.1 / JSON REST  

---

## 1. Authentication & Multi-Tenant Authorization Policy

- **Session Ingestion:** Endpoints accept identity credentials through:
  - Better Auth session cookie (`better-auth.session_token`)
  - HTTP header: `Authorization: Bearer <session_or_jwt_token>`
  - HTTP header: `X-Session-Token: <token>`
- **Tenant Scoping:** All operations are scoped server-side to the caller's verified `organization_id`.
- **System Roles:**
  - `admin`: Full configuration, product deletion, and knowledge ingestion authority.
  - `researcher`: Read-all research evaluation access and knowledge ingestion.
  - `expert`: Multi-criteria AHP pairwise evaluation and review submission.
  - `member`: Standard company tenant user.
- **Header Security:** Caller forwarded headers (`X-User-Id`, `X-Org-Id`) are ignored unless extracted from a cryptographically signed session token.

---

## 2. Complete Endpoint Catalog

### 2.1 System & Health Monitoring
- **`GET /health`**
  - Public liveness check.
  - Response: `{"status": "healthy", "service": "Marketing Strategy Assessment System", "version": "1.1.0"}`
- **`GET /config/public`**
  - Public settings, channels, currency (LKR), and active provider configuration status.
- **`GET /integrations/health`**
  - Comprehensive health check across PostgreSQL (Prisma Postgres), Pinecone Vector DB, OpenAI Generation, and Better Auth.

### 2.2 Product Management (FR1)
- **`GET /products`**
  - List products for the authenticated organization.
- **`POST /products`**
  - Register a new technology product profile.
- **`GET /products/{id}`**
  - Retrieve product details.
- **`PUT /products/{id}`**
  - Update product attributes.
- **`DELETE /products/{id}`**
  - Delete product and cascade related data (Admin role required).

### 2.3 Questionnaire & Wizard (FR2)
- **`GET /questionnaire/schema`**
  - Full metadata for questions Q1 - Q21, option catalogs, and validation rules.
- **`POST /questionnaire/validate`**
  - Validates full 5-step questionnaire payload without running inference.
- **`POST /questionnaire/draft`**
  - Saves in-progress questionnaire draft.
- **`GET /questionnaire/draft/{id}`**
  - Retrieves saved in-progress draft.

### 2.4 Audience Technical Literacy Classifier (FR3)
- **`POST /audience/predict`**
  - Invokes multimodal PyTorch neural network (`fusion_model.pt`) using 600-dim TF-IDF free-text and tabular survey features.
  - Returns: `predicted_class` (`Low`, `Medium`, `High`), `confidence_score`, `probabilities`, and model metadata.

### 2.5 Feature-to-Value Message Translation (FR4)
- **`POST /messages/generate`**
  - Generates customer benefit messages, core value proposition, literacy-segmented copy (Simple, Balanced, Technical), short headline, social caption, CTA, and factual claim warnings.
  - Powered by OpenAI Responses API with JSON schema enforcement and deterministic template fallback.

### 2.6 AHP Channel Recommendation (FR5)
- **`POST /channels/rank`**
  - Ranks 8 Sri Lankan channels using Saaty reciprocal pairwise comparison matrix math across 5 criteria (Audience, Objective, Cost, Reach, Content).
  - Validates Consistency Ratio ($CR \le 0.10$).
- **`GET /channels/catalog`**
  - Lists Sri Lankan benchmark channels with reach rates and cost indices.
- **`GET /channels/criteria`**
  - Lists AHP decision criteria and active weights.

### 2.7 Marketing Budget Optimization (FR6)
- **`POST /budget/allocate`**
  - Allocates monthly and campaign budgets in exact integer LKR using SciPy SLSQP optimization.
  - Preserves reserve fund and satisfies channel viability constraints.

### 2.8 End-to-End Orchestration & Strategy Reports (FR7)
- **`POST /analysis/run`**
  - Orchestrates: Questionnaire $\to$ FR3 $\to$ Pinecone RAG Grounding $\to$ OpenAI FR4 $\to$ Saaty FR5 $\to$ SciPy FR6 $\to$ PostgreSQL Persistence.
  - Returns `ComprehensiveStrategyReport`.
- **`GET /analysis/runs`**
  - Lists historical assessment runs for the tenant.
- **`GET /analysis/{id}/report`**
  - Retrieves completed strategy report with source citations and research caveats.

### 2.9 Knowledge Base & Vector RAG
- **`POST /knowledge/search`**
  - Searches Pinecone vector store (3072 dims) or relational fallback for Sri Lankan market intelligence.
- **`GET /knowledge/sources`**
  - Lists authorized public and tenant-specific knowledge documents.
- **`POST /knowledge/ingest`**
  - Admin/Researcher endpoint to chunk, hash, embed, and index a document into Pinecone & PostgreSQL.
- **`GET /knowledge/jobs/{job_id}`**
  - Ingestion job status and chunk count.

### 2.10 Cross-Module Consulting Framework Integration
- **`GET /integrations/summary`**
  - Inter-service summary endpoint for partner modules (Product Management, Finance, Operations).
  - Returns latest marketing assessment intelligence for a given `product_id`.

---
*Maintained by Principal Full-Stack Migration Architect.*
