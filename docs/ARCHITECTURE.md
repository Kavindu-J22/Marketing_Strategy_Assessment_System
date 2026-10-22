# System Architecture & Technical Specification
**Project:** Marketing Strategy Assessment (Individual Research Component)  
**Parent Framework:** A Product and Service Management Consulting Framework for Sri Lankan Technology Companies  
**Document Version:** 1.1.0 - Standardized Team Stack (October 2026)  

---

## 1. Architectural Philosophy & Design Goals

The Marketing Strategy Assessment System provides an end-to-end, reproducible, research-grade decision support platform tailored to Sri Lankan technology startups and SMEs. Rather than relying on superficial text prompts, the system integrates four independent, empirically grounded analytical engines with standardized team infrastructure:

1. **Audience Technical Literacy Classifier (FR3):** A PyTorch Multimodal Neural Fusion model combining 600-feature TF-IDF free-text audience representations with normalized structured survey responses (technology comfort and technical terms familiarity).
2. **Feature-to-Value Message Translator (FR4):** Server-side OpenAI Responses API inference with strict Pydantic v2 JSON schema validation, safety guardrails preventing fabricated performance claims, RAG market context grounding, and deterministic non-AI template fallbacks.
3. **Analytical Hierarchy Process (AHP) Channel Engine (FR5):** A transparent multi-criteria decision engine implementing Saaty's pairwise comparison matrix mathematics, normalized geometric mean / principal eigenvector priority derivation, and strict Consistency Ratio ($CR \le 0.10$) validation across 8 Sri Lankan channels.
4. **Constraint-Aware Budget Optimizer (FR6):** A mathematical optimization solver leveraging `scipy.optimize` (SLSQP) and largest-remainder integer arithmetic in Sri Lankan Rupees (LKR) to guarantee 100% exact budget summation without floating-point currency drift.
5. **Knowledge Base & Vector Retrieval (RAG):** Pinecone vector database with 3072-dimensional embeddings generated via OpenAI `text-embedding-3-large`, multi-tenant namespace isolation, and canonical document tracking in PostgreSQL.

---

## 2. High-Level Component Topology

```text
+----------------------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION (FRONTEND)                                   |
|                                                                                                    |
|  - React 19 + TypeScript + Vite                                                                    |
|  - Material UI (MUI v9 syntax): Emerald/Teal (#0d9488) & Slate (#0f172a)                           |
|  - State & Data: React Router v6, Axios with Better Auth / Bearer Interceptors                     |
|  - Visualizations: Recharts (Channel Scores, Budget Pie/Bar, Radar Charts)                         |
|  - Accessibility: WCAG 2.1 AA compliant, reduced-motion media queries                              |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  | HTTPS / REST (Session Cookie or Bearer Token)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                      FASTAPI BACKEND SERVICE                                        |
|                                                                                                    |
|  [Security & Auth Layer]                                                                           |
|    - Better Auth Session Interoperability & Signed Token Verification                              |
|    - Multi-tenant Organization Scoping & Role-Based Access Control (Admin / Researcher / Expert)   |
|    - Defense against forged headers (X-User-Id, X-Org-Id)                                          |
|                                                                                                    |
|  [Orchestration Engine]                                                                            |
|    - `AnalysisOrchestrator` Pipeline (FR1 - FR7)                                                   |
|    - Persistent Runs, Status Polling, Idempotent Operations                                        |
|                                                                                                    |
|  [Domain Services, ML & Optimization Engines]                                                      |
|    +-- AudienceClassifierService (PyTorch Multimodal Fusion & Classical TF-IDF Baselines)          |
|    +-- MarketingMessageService (OpenAI Structured Schema, Guardrails & Deterministic Fallback)      |
|    +-- AHPEngine (Saaty Pairwise Matrix, Eigenvalue Math, Consistency Ratio Verification)          |
|    +-- BudgetOptimizer (SLSQP Constrained Optimization & Largest-Remainder Integer LKR Allocation) |
|    +-- KnowledgeRetriever (Pinecone 3072d Dense Vector Search & Relational Fallback)               |
|    +-- EmbeddingService (OpenAI text-embedding-3-large 3072-Dimensional Dense Vectors)             |
|    +-- KnowledgeIngestionService (Deterministic Chunking, SHA-256 Hashing, Idempotent Indexing)    |
+----------------------------------------------------------------------------------------------------+
                        |                                                |
                        | SQLAlchemy (Pooled & Direct)                   | BYO-Vectors (3072d)
                        v                                                v
+---------------------------------------------+  +---------------------------------------------------+
|      POSTGRESQL (PRISMA POSTGRES HOSTING)   |  |            PINECONE VECTOR DATABASE               |
|                                             |  |                                                   |
| - Profiles & Better Auth Identity Links     |  | - BYO-Vectors Index (3072 Dimensions, Cosine)     |
| - Organizations, Products, Campaigns        |  | - Multi-Tenant Namespaces:                        |
| - 21-Questionnaire Responses                |  |   * staging-marketing-public (Public Benchmarks)  |
| - Analysis Runs, Predictions, Messages      |  |   * staging-marketing-{org_id} (Private Tenant)   |
| - Knowledge Documents & Chunks Metadata     |  | - Metadata Filters: doc_id, source_type, tier    |
| - Retrieval Audit Events & Ingestion Jobs   |  +---------------------------------------------------+
+---------------------------------------------+
```

---

## 3. Data Flow & Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Founder / Consultant
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant ML as PyTorch Classifier (FR3)
    participant RAG as Pinecone Knowledge Retriever
    participant LLM as OpenAI Message Service (FR4)
    participant AHP as AHP Channel Engine (FR5)
    participant OPT as Budget Optimizer (FR6)
    participant DB as Prisma Postgres Database

    User->>UI: Completes 21-Question Assessment (Q1 - Q21)
    UI->>API: POST /api/v1/questionnaire/validate
    API-->>UI: Validation OK
    User->>UI: Clicks "Run Strategy Assessment"
    UI->>API: POST /api/v1/analysis/run (Session Token)
    API->>ML: Classify Audience Literacy (TF-IDF Text + Q10 + Q11)
    ML-->>API: Predicted Class (Low/Med/High), Class Probabilities
    API->>RAG: Query Sri Lankan Market Evidence (Pinecone 3072d)
    RAG-->>API: Grounded Context Passages & Citations
    API->>LLM: Generate Structured Value Messages (OpenAI Responses API)
    LLM-->>API: Value Proposition, Segmented Messages, CTAs, Guardrail Warnings
    API->>AHP: Multi-Criteria Channel Scoring (Audience, Goal, Reach, Cost, Content)
    AHP-->>API: Ranked Channels, Consistency Ratio, Evidence Notes
    API->>OPT: Allocate Monthly Budget (LKR Constraints, Floors, Reserve)
    OPT-->>API: Integer LKR Allocations, Equal-Split Baseline, Utility Score
    API->>DB: Persist Run, Prediction, Messages, Channels, Allocations, Audit Log
    API-->>UI: Complete ComprehensiveStrategyReport JSON
    UI-->>User: Renders Interactive Multi-Card Strategy Dashboard
```

---

## 4. Academic Integrity & Research Provenance

- **Audience Classifier (FR3):** Pre-trained on a synthetic simulation dataset of 5,000 Sri Lankan enterprise scenarios. PyTorch weights (`fusion_model.pt`) and preprocessing artifacts are verified and frozen.
- **Message Generator (FR4):** Employs strict prompt injection guardrails, refuses unverified performance claims, and cites authenticated public sources (DataReportal, ICTA, EDB).
- **AHP Engine (FR5):** Mathematical Saaty prioritization ($CR \le 0.10$); expert-confirmed weights are explicitly distinguished from assumed synthetic defaults.
- **Budget Optimizer (FR6):** Uses proxy utility scores; allocations do not guarantee commercial financial ROI or conversion numbers.

---
*Maintained by Principal Full-Stack Migration Architect & System Lead.*
