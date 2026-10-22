# Marketing Strategy Assessment System
### A Component of: *A Product and Service Management Consulting Framework for Sri Lankan Tech Companies*

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-red.svg)](https://pytorch.org)
[![AHP](https://img.shields.io/badge/Decision%20Engine-AHP%20(Saaty)-emerald.svg)]()
[![License: Academic](https://img.shields.io/badge/License-Academic%20Research-purple.svg)]()

---

## 1. Research Overview & Objectives

Sri Lankan technology startups and SMEs face significant challenges in converting complex, technical software features into customer-centric marketing copy, selecting effective domestic marketing channels under tight financial constraints, and allocating scarce capital without verified decision-support frameworks.

This system implements an end-to-end, runnable, research-grade decision-support solution providing:
- **FR1 Product Information Input:** Captures product name, technical features, problem solved, and industry category.
- **FR2 Target Audience Profiling:** Captures target customer characteristics, market type (B2B/B2C/Both), role, age, and Sri Lankan geography.
- **FR3 Audience Technical Literacy Classification:** A trained PyTorch Multimodal Neural Fusion classifier (90.60% test accuracy on group holdouts) categorizing audiences into Low, Medium, or High technical literacy with calibrated uncertainty.
- **FR4 AI Feature-to-Value Message Translation:** Server-side OpenAI Responses API structured message generation with strict Pydantic v2 JSON validation, Pinecone RAG market context grounding, safety guardrails preventing fabricated claims, and deterministic template fallback.
- **FR5 Analytical Hierarchy Process (AHP) Channel Recommendation:** Mathematical multi-criteria channel ranking with Saaty pairwise comparison matrices and Consistency Ratio ($CR \le 0.10$) enforcement.
- **FR6 Constraint-Aware Budget Allocation:** Mathematical optimization via `scipy.optimize` with exact integer Sri Lankan Rupee (LKR) arithmetic, floors/caps, and equal-split baseline comparison.
- **FR7 Interactive Strategy Dashboard & Export:** Clean, responsive, accessible Material UI dashboard with JSON/CSV exports and scenario comparison.
- **Vector Knowledge Base (RAG):** Pinecone vector database with 3072-dimensional embeddings via OpenAI `text-embedding-3-large`, multi-tenant namespace isolation, and canonical document tracking in PostgreSQL (Prisma Postgres).

---

## 2. Provenance & Non-Negotiable Truth Constraints
> [!IMPORTANT]
> **Data Provenance Disclosure:**
> The 5,000 scenario records in `Dataset/` are **100% synthetic simulations** (1,000 fictional companies, 5 scenarios each). They are not primary surveyed human respondents or observed commercial campaigns.
>
> All classification accuracy scores reflect alignment with synthetic simulation logic. Initial AHP weights (34%, 25%, 18%, 13%, 10%) are assumed demo heuristics. The system explicitly displays **"Not yet empirically validated"** on live predictions until prospective field trials with consented human participants are conducted.

---

## 3. Project Directory Layout

```
marketing-strategy-assessment/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/                # Modular REST Routers
│   │   ├── core/                  # Config, Auth, Logging, Database
│   │   ├── ml/                    # Classifier Inference Engine
│   │   ├── ahp/                   # Saaty Pairwise Matrix & AHP Engine
│   │   ├── budget/                # SciPy Constrained Budget Optimizer
│   │   ├── schemas/               # Pydantic v2 Input/Output Schemas
│   │   └── services/              # Orchestration & Gemini LLM Service
│   └── tests/                     # Unit, Integration & Security Tests
├── frontend/                       # React 18 + TypeScript + Vite + MUI
│   └── src/
│       ├── components/            # UI Cards, Steppers, Charts
│       ├── features/              # Wizard, Strategy Report, SUS Survey
│       └── pages/                 # Route Views
├── ml/                             # Machine Learning Training & Evaluation
│   ├── artifacts/                 # Saved PyTorch (.pt) & Scikit-Learn Models
│   ├── evaluation/                # Real Evaluated JSON Metric Reports
│   ├── model_cards/               # Academic Model Cards
│   └── training/                  # Reproducible Training CLIs
├── Dataset/                        # Raw Synthetic Research Scenarios
├── supabase/                       # SQL Migrations, Strict RLS & Seeds
└── docs/                           # Comprehensive Research Documentation
    ├── SYSTEM_IMPLEMENTATION_AND_EVALUATION.md  # Master Technical & Evaluation Document
    ├── MANUAL_SETUP_AND_RUN_GUIDE.md           # Step-by-Step Setup & Clone Run Guide
    ├── REQUIREMENTS_TRACEABILITY.md            # Mapping to Proposal FR1-FR7 & Q1-Q21
    ├── ARCHITECTURE.md                         # Mathematical & System Architecture
    ├── MODEL_CARD.md                           # Audience Classifier Model Card
    └── API.md                                  # Complete REST API Specifications
```

---

## 3.1 Key Documentation
- 📖 **[Master Technical Implementation & ML Evaluation Guide](docs/SYSTEM_IMPLEMENTATION_AND_EVALUATION.md)**: Full architecture breakdown, mathematical equations, empirical ML evaluation results (90.6% accuracy, 90.69% F1), and comprehensive file-by-file audit.
- 🚀 **[Manual Setup & Run Guide](docs/MANUAL_SETUP_AND_RUN_GUIDE.md)**: Complete step-by-step instructions for running locally and setting up on another machine after cloning from GitHub.
- 📋 **[Requirements Traceability Matrix](docs/REQUIREMENTS_TRACEABILITY.md)**: Bidirectional mapping of research proposal FR1–FR7, NFR1–NFR6, and Q1–Q21 questionnaire semantics.

---

## 4. Quickstart Guide

### 4.1 Backend Setup & Execution
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Train baseline and deep learning models (optional, pre-trained artifacts included)
python -m ml.training.train_baselines
python -m ml.training.train_fusion

# 3. Run backend unit & integration tests
pytest backend/tests/unit -v

# 4. Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
```
The interactive OpenAPI documentation will be live at: `http://localhost:8000/docs`.

### 4.2 Frontend Setup & Execution
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The React research dashboard will be live at: `http://localhost:5173`.
