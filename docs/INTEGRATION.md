# Cross-Component Integration Guide
**Parent System:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Integrated Component:** Marketing Strategy Assessment System (Smart Marketing System)  
**Interface Contract Version:** `v1.0-SL-2026`  
**Status:** Standardized for Prisma Postgres, Pinecone, OpenAI, and Better Auth  

---

## 1. Overview of Framework Interoperability

The *Product and Service Management Consulting Framework* comprises multiple specialized consulting components (e.g., product readiness assessment, operational evaluation, financial forecasting, and market strategy).

The **Marketing Strategy Assessment** component exposes standardized, secure integration contracts allowing partner modules to query strategic marketing intelligence (audience literacy tier, core value proposition, recommended marketing channels, and monthly LKR budget allocations) without duplicating credentials, models, or databases.

---

## 2. Standardized Integration Endpoints

### 2.1 Strategic Marketing Summary Contract
- **Endpoint:** `GET /api/v1/integrations/summary`
- **Authentication:** Better Auth Session Cookie or `Authorization: Bearer <token>`
- **Query Parameters:**
  - `product_id` (String/UUID, required): ID of target product.
  - `organization_id` (String/UUID, optional, defaults to caller's tenant).
- **Response Schema (`v1.0-SL-2026`):**
  ```json
  {
    "status": "ready",
    "integration_schema_version": "v1.0-SL-2026",
    "organization_id": "org-ceylontech-001",
    "product_id": "prod-001",
    "product_name": "Nivora StockSync Cloud",
    "latest_run_id": "run-4a92c817e012",
    "assessed_at": "2026-10-22T20:30:00Z",
    "target_audience_literacy": "Low",
    "core_value_proposition": "Nivora StockSync Cloud helps retail merchants avoid stockouts through automated cloud inventory forecasting.",
    "recommended_channels": [
      "Facebook",
      "YouTube",
      "Google Ads"
    ],
    "monthly_budget_allocation_lkr": {
      "Facebook": 35000,
      "YouTube": 25000,
      "Google Ads": 15000
    },
    "consulting_framework_contract": "Verified"
  }
  ```

### 2.2 Cross-Service Health Check Contract
- **Endpoint:** `GET /api/v1/integrations/health`
- **Authentication:** Public / Internal Infrastructure Monitor
- **Response Schema:**
  ```json
  {
    "status": "operational",
    "service": "Marketing Strategy Assessment System",
    "database": {
      "status": "connected",
      "provider": "Prisma Postgres (PostgreSQL)",
      "pool_active": true
    },
    "generative_ai": {
      "provider": "OpenAI",
      "model": "gpt-4o-mini",
      "status": "connected"
    },
    "vector_search": {
      "provider": "Pinecone",
      "embedding_model": "text-embedding-3-large",
      "dimensions": 3072,
      "status": "connected",
      "namespace_prefix": "staging-marketing"
    },
    "authentication": {
      "provider": "Better Auth",
      "endpoint": "http://localhost:3000",
      "status": "configured"
    }
  }
  ```

---

## 3. Shared Database & Table Ownership Boundaries

All components of the consulting framework share the central PostgreSQL database hosted on Prisma Postgres. To prevent conflicting migrations and accidental data loss:
- **Marketing Strategy Assessment Component owns:**
  - `products`, `target_audience_profiles`, `campaigns`, `questionnaire_responses`
  - `analysis_runs`, `audience_predictions`, `generated_messages`, `channel_rankings`, `budget_allocations`
  - `knowledge_documents`, `knowledge_chunks`, `knowledge_ingestion_jobs`, `embedding_versions`, `retrieval_audit_events`
  - `channel_catalog`, `ahp_criteria`, `ahp_weight_versions`, `market_sources`
  - `expert_reviews`, `usability_responses`, `datasets`, `model_versions`, `evaluation_results`, `audit_logs`
- **Partner modules communicate strictly via:**
  - Direct read-only database views or scoped SQL queries.
  - REST API calls (`/api/v1/integrations/summary`).

---
*Maintained by Principal Full-Stack Migration Architect.*
