# Security, Privacy & Multi-Tenant Compliance Architecture (NFR5)
**Project:** Marketing Strategy Assessment System  
**Framework:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Document Version:** 1.1.0 - Standardized Team Stack (October 2026)  
**Compliance Standard:** ISO/IEC 27001, OWASP Top 10, and Zero-Trust Principles  

---

## 1. Threat Modeling & Core Defense Principles

### 1.1 Multi-Tenant Data Isolation
- **Application Layer Enforcement:** Every tenant endpoint validates that the caller's session `organization_id` strictly matches the requested resource. Cross-tenant reads, updates, or deletions are rejected with `HTTP 403 Forbidden` (`backend/app/core/security.py`).
- **Database Layer Isolation:** PostgreSQL tables (`products`, `campaigns`, `questionnaire_responses`, `analysis_runs`, `audience_predictions`, `generated_messages`, `channel_rankings`, `budget_allocations`) maintain foreign-key constraints linking directly to `organizations(id)` with Row Level Security (RLS) policies and tenant-filtered indexes.
- **Header Forgery Resistance:** Forwarded headers (`X-User-Id`, `X-Org-Id`) from reverse proxies or untrusted clients are explicitly ignored. Identity claims are extracted solely from cryptographically signed session tokens or server-to-server introspection.

### 1.2 Zero-Trust Server Secret Management
- **Strict Server-Side Key Containment:** `OPENAI_API_KEY`, `PINECONE_API_KEY`, `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, and `BLOB_READ_WRITE_TOKEN` are stored exclusively in server environment variables.
- **Frontend Bundle Immunity:** No secret tokens are ever prefixed with `VITE_` or `NEXT_PUBLIC_`, committed to git, or exposed in client bundles.
- **Credential Rotation:** Legacy tokens previously shared across chat or documentation are treated as permanently compromised and rotated per `docs/ROTATION_CHECKLIST.md`.

### 1.3 Vector Database & RAG Multi-Tenant Isolation
- **Pinecone Namespace Scoping:**
  - Public market benchmarks are stored under `{prefix}-public`.
  - Organization-specific product knowledge is strictly isolated under `{prefix}-{organization_id}`.
- **Metadata Filtering:** Query filters prevent vector hits from cross-contaminating across organization boundaries.
- **Relational Integrity:** PostgreSQL remains the canonical authority for document ownership, chunks, and content hashes.

### 1.4 Untrusted Data Sanitization & Prompt Injection Defense
- **Passive Data Principle:** Product descriptions and questionnaire responses are treated as raw passive data, never as executable instructions.
- **System Prompt Guardrails:** System prompts instruct OpenAI generation models to reject role reversal, jailbreak attempts, or instructions embedded within user product descriptions.
- **Claim Integrity:** Models are prohibited from hallucinating ISO certifications, unearned awards, or fake statistical metrics. Unverified claims are flagged in `claim_warnings`.

### 1.5 Zero Customer PII Policy
- The application does not collect or process individual consumers' personally identifiable information (PII), national identity card numbers (NIC), or credit card details.
- Data collection is restricted to organizational profile attributes, target customer archetypes, and marketing parameters.

### 1.6 Financial Precision & Integer Arithmetic
- All marketing budgets and channel allocations are computed in exact integer Sri Lankan Rupees (LKR).
- Floating-point currency drift is mathematically prevented via largest-remainder integer distribution algorithms.

---
*Certified by Principal Full-Stack Migration Architect & Security Reviewer.*
