# Secret Rotation & Security Configuration Checklist
**Project:** Marketing Strategy Assessment System  
**Framework:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Document ID:** `SEC-ROT-2026-001`  
**Date:** October 2026  
**Status:** Mandatory Operational Security Protocol  

---

## 1. Context & Exposure Notice

Per section A.5 of the team standardization specification, any credential strings previously shared across project chat histories, meeting notes, code repositories, or informal configuration files must be treated as **publicly exposed** and **compromised**.

Under zero-trust principles:
1. **Never attempt connection using exposed legacy tokens.**
2. **Owners of the respective services must generate freshly rotated keys** in their administrative consoles prior to production cutover.
3. **Application code must read credentials strictly through server-side environment variables.**
4. **Never expose server credentials via `VITE_`, `NEXT_PUBLIC_`, frontend bundles, or browser storage.**

---

## 2. Service-by-Service Rotation Checklist

### 2.1 OpenAI API Credentials
- [ ] Log in to the [OpenAI Platform Dashboard](https://platform.openai.com/api-keys).
- [ ] Revoke any previously generated API keys associated with this research project.
- [ ] Create a new restricted API key with permissions for:
  - Model inference (`chat.completions`, Responses API)
  - Model embeddings (`embeddings.create`)
- [ ] Set spending limits and quota alerts in OpenAI Billing.
- [ ] Add the newly generated key to the deployment server's secure store as `OPENAI_API_KEY`.
- [ ] Confirm `OPENAI_EMBEDDING_MODEL=text-embedding-3-large` and `OPENAI_GENERATION_MODEL=gpt-4o-mini` (or approved team model).

### 2.2 Pinecone Vector Database Credentials
- [ ] Log in to the [Pinecone Console](https://app.pinecone.io).
- [ ] Revoke any existing API keys that were previously circulated.
- [ ] Generate a new API key with access to the designated vector project.
- [ ] Confirm index configuration:
  - **Index Name:** Team designated index
  - **Host URL:** Configured via `PINECONE_INDEX_HOST`
  - **Dimensions:** Exactly `3072` (matching `text-embedding-3-large`)
  - **Metric:** `cosine` (or configured dense metric)
  - **Pod/Serverless Type:** Serverless (dense vector compatible)
- [ ] Set `PINECONE_NAMESPACE_PREFIX=staging-marketing` for initial validation.
- [ ] Verify that no tenant data from other research groups will be overwritten by enforcing organization-scoped namespaces.

### 2.3 PostgreSQL (Prisma Postgres Hosting)
- [ ] In the [Prisma Data Platform Console](https://cloud.prisma.io), locate the shared team database instance.
- [ ] Rotate database credentials to produce a new connection secret.
- [ ] Obtain both:
  - **Pooled Connection String (`DATABASE_URL`):** For application queries with PgBouncer/connection pooling (port 5432 or 6543, `?sslmode=require`).
  - **Direct Connection String (`DIRECT_URL`):** For schema DDL migrations and admin operations that require direct access.
- [ ] Confirm SSL mode is enforced (`sslmode=require`).
- [ ] Verify database user permissions are scoped to prevent unauthorized table dropping across the shared database.

### 2.4 Better Auth Infrastructure
- [ ] In the central team auth service environment, generate a fresh cryptographically random secret:
  ```bash
  openssl rand -base64 32
  ```
- [ ] Update `BETTER_AUTH_SECRET` on the auth service and on this backend.
- [ ] Confirm `BETTER_AUTH_URL` points to the internal or verified auth service URL (e.g., `http://localhost:3000` in dev).
- [ ] Verify trusted origins and CORS configuration prevent unauthorized cross-origin credential forwarding.

### 2.5 Vercel Blob (Optional Document Storage)
- [ ] In the Vercel Project Dashboard (Storage > Blob), generate a fresh `BLOB_READ_WRITE_TOKEN`.
- [ ] Ensure the token is stored only in backend environment variables.
- [ ] Never supply this token to the React frontend.

---

## 3. Environment File Configuration Protocol

1. **Development Environment:**
   - Copy `.env.example` to `.env`.
   - Populate `.env` with developer/staging keys provided by the credential owners.
   - Confirm `.env` is listed in `.gitignore` (verified).
   - If keys are omitted or blank, the backend automatically engages deterministic fallback routines (in-memory repository, deterministic message template generator, local semantic baseline).

2. **Continuous Integration (CI):**
   - Inject secrets via GitHub Actions Secrets or GitLab CI Variables.
   - Run automated secret scanner (`gitleaks`, `trufflehog`, or equivalent) on all pull requests.

3. **Staging / Production Deployment:**
   - Inject environment variables via server-side container orchestration (Docker Compose secrets, Kubernetes Secrets, or AWS Parameter Store).
   - Verify that no secret values appear in build logs or container images.

---
*Verified and enforced by Principal Full-Stack Migration Architect.*
