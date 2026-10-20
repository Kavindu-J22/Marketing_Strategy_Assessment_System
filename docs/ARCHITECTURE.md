# System Architecture & Technical Specification

**Project:** Marketing Strategy Assessment (Individual Research Component)  
**Parent Framework:** A Product and Service Management Consulting Framework for Sri Lankan Tech Companies  
**Document Version:** 1.0.0 (October 2026)  

---

## 1. Architectural Philosophy & Design Goals

The Marketing Strategy Assessment System provides an end-to-end, reproducible, research-grade decision support platform tailored to Sri Lankan technology startups and SMEs. Rather than relying on static prototypes or superficial text completion prompts, the system integrates four independent, empirically grounded analytical engines:

1. **Audience Technical Literacy Classifier (FR3):** A PyTorch Multimodal Neural Fusion model combining free-text audience descriptions with normalized structured survey responses (technology comfort and technical terms familiarity).
2. **Feature-to-Value Message Translator (FR4):** Server-side Google Gemini inference with strict Pydantic v2 JSON schema validation, safety guardrails preventing fabricated performance claims, and deterministic non-AI template fallbacks.
3. **Analytical Hierarchy Process (AHP) Channel Engine (FR5):** A transparent multi-criteria decision engine implementing Saaty's pairwise comparison matrix mathematics, normalized geometric mean / principal eigenvector priority derivation, and strict Consistency Ratio ($CR \le 0.10$) validation.
4. **Constraint-Aware Budget Optimizer (FR6):** A mathematical optimization solver leveraging `scipy.optimize` and largest-remainder integer arithmetic in Sri Lankan Rupees (LKR) to guarantee 100% exact budget summation without floating-point currency drift.

---

## 2. High-Level Component Topology

```
+----------------------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION (FRONTEND)                                   |
|                                                                                                    |
|  - React 18 + TypeScript + Vite                                                                    |
|  - Material UI (MUI) v5 Theme: Emerald/Teal (#0d9488) & Slate (#0f172a)                           |
|  - State & Data: React Router v6, TanStack Query v5, Zustand, React Hook Form + Zod               |
|  - Visualizations: Recharts (Channel Scores, Budget Pie/Bar, Radar Charts)                         |
|  - Accessibility: WCAG 2.1 AA compliant, reduced-motion media queries                              |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  | HTTPS / REST (Bearer JWT Auth)
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                      FASTAPI BACKEND SERVICE                                        |
|                                                                                                    |
|  [Security & Auth Layer]                                                                           |
|    - Supabase Auth Bearer JWT Verification                                                         |
|    - Multi-tenant Organization Scoping & Role-Based Access Control (Admin / Researcher / Expert)   |
|                                                                                                    |
|  [Orchestration Engine]                                                                            |
|    - `AnalysisOrchestrator` Pipeline (FR1 - FR7)                                                   |
|    - Persistent Runs, Status Polling, Idempotent Operations                                        |
|                                                                                                    |
|  [Domain Services & ML Engines]                                                                    |
|    +-- AudienceClassifierService (PyTorch Multimodal Fusion & Classical TF-IDF Baselines)          |
|    +-- GeminiMessagingService (Server-Side LLM with Structured Schema & Guardrails)                 |
|    +-- AHPEngine (Saaty Pairwise Matrix, Eigenvalue Math, Consistency Ratio Verification)          |
|    +-- BudgetOptimizer (SLSQP Constrained Optimization & Largest-Remainder Integer LKR Allocation) |
|    +-- EvaluationService (System Usability Scale [SUS] Scoring & Blinded Expert Review Rubric)     |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  | PostgreSQL RLS Enforced / Storage
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                  SUPABASE MANAGED PERSISTENCE                                      |
|                                                                                                    |
|  - PostgreSQL Database: Profiles, Organizations, Products, Campaigns, Questionnaires, Runs         |
|  - Strict Row-Level Security (RLS): All tenant data isolated by `organization_members`             |
|  - Model Registry & Evaluation Tables: `model_versions`, `evaluation_results`, `datasets`         |
|  - Market Knowledge Registry: Sourced Sri Lankan Digital Market Context & Citations               |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Data Flow & Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Founder / Marketer
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant ML as Audience Classifier (PyTorch)
    participant LLM as Gemini Inference Service
    participant AHP as AHP Channel Engine
    participant OPT as Budget Optimizer (SciPy)
    participant DB as Supabase PostgreSQL

    User->>UI: Completes 21-Question Assessment (Q1 - Q21)
    UI->>API: POST /api/v1/questionnaire/validate
    API-->>UI: Validation OK
    User->>UI: Clicks "Run Strategy Assessment"
    UI->>API: POST /api/v1/analysis/run (Bearer JWT)
    API->>ML: Classify Audience Literacy (Text + Q10 + Q11)
    ML-->>API: Predicted Class (Low/Med/High), Probabilities, Caveats
    API->>LLM: Transform Features to Values (Strict JSON Schema)
    LLM-->>API: Value Proposition, Segmented Messages, CTAs
    API->>AHP: Multi-Criteria Channel Scoring (Audience, Goal, Reach, Cost, Content)
    AHP-->>API: Ranked Channels, Consistency Ratio, Evidence
    API->>OPT: Allocate Monthly Budget (LKR Constraints, Floors, Reserve)
    OPT-->>API: Integer LKR Allocations, Equal-Split Baseline, Utility Score
    API->>DB: Persist Run, Prediction, Messages, Channels, Allocations
    API-->>UI: Complete ComprehensiveStrategyReport JSON
    UI-->>User: Renders Interactive Multi-Card Strategy Dashboard
```

---

## 4. Modular Separation & Maintainability (NFR6)

Each analytical component resides in its own isolated sub-package with zero circular dependencies:
- `app/ml/`: PyTorch network definition, training script, preprocessing pipeline, and inference service.
- `app/ahp/`: Pure mathematical pairwise matrix solver, consistency calculator, and channel scoring rules.
- `app/budget/`: Numerical optimization problem formulation and integer rounding algorithms.
- `app/services/`: High-level business logic orchestration and LLM client management.
- `app/schemas/`: Strictly validated Pydantic v2 data contracts.
