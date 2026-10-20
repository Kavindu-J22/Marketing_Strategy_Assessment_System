# Master Technical Implementation & Academic Evaluation Document
**Marketing Strategy Assessment System (Smart Marketing System)**  
*Individual Research Component of: A Product and Service Management Consulting Framework for Sri Lankan Technology Companies*  
*Research Proposal: J26-ISE-313 | Student ID: IT23221796 | SLIIT 2026*

---

## 1. Executive Summary & Research Context

The **Marketing Strategy Assessment System** is an AI/ML-driven decision support framework engineered to address the systematic marketing challenges faced by Sri Lankan technology small and medium enterprises (SMEs). In Sri Lanka's growing ICT/BPM sector (comprising 500+ tech enterprises, EDB 2025), early-stage founders and product managers struggle to translate complex technical software capabilities into market-resonant value propositions, objectively prioritize marketing communication channels across limited budgets, and prevent ad-spend misallocation.

This system provides a unified, end-to-end web platform executing 4 core computational pipelines:
1. **Multimodal Deep Learning Audience Classification (FR1–FR3)**: Categorizes customer segments into Low, Medium, or High technical literacy using text embeddings and structured behavioral Likert indicators.
2. **AI-Driven Feature-to-Value Message Translation (FR4)**: Translates technical software specifications into audience-tuned value propositions and marketing hooks.
3. **Analytic Hierarchy Process (AHP) Channel Prioritization (FR5)**: Evaluates 8 Sri Lankan marketing channels against 5 criteria with mathematical consistency validation ($CR \le 0.10$).
4. **Constrained Sequential Least Squares Programming (SLSQP) Budget Allocation (FR6)**: Allocates marketing spend in integer Sri Lankan Rupees (LKR) with diminishing returns modeling and exact rupee summation.

---

## 2. Theoretical Formulations & Mathematical Models

### 2.1 Multimodal Neural Fusion (Audience Classifier)
- **Input Text Representation**: Customer persona description and product domain vocabulary encoded via TF-IDF vectorizer ($D_{\text{text}} = 300$ dimensions, sublinear term frequency scaling).
- **Input Structured Representation**: Likert scores from Q10 (Technology comfort, 1–5) and Q11 (Technical terms familiarity, 1–5) normalized using MinMax scaling to $[0, 1]$ ($D_{\text{struct}} = 2$).
- **Fusion Layer**: Concatenated representation vector $x \in \mathbb{R}^{302}$.
- **Network Architecture**:
  $$\begin{aligned}
  h_1 &= \text{Dropout}_{0.3}\left(\text{ReLU}\left(\text{BatchNorm}\left(W_1 x + b_1\right)\right)\right), \quad W_1 \in \mathbb{R}^{64 \times 302} \\
  h_2 &= \text{ReLU}\left(W_2 h_1 + b_2\right), \quad W_2 \in \mathbb{R}^{32 \times 64} \\
  \hat{y} &= \text{Softmax}\left(W_3 h_2 + b_3\right), \quad W_3 \in \mathbb{R}^{3 \times 32}
  \end{aligned}$$
- **Objective Function**: Cross-Entropy Loss with Adam optimizer ($\text{lr} = 0.001$, $\text{weight decay} = 10^{-4}$):
  $$\mathcal{L} = -\sum_{c=1}^3 y_c \log \hat{y}_c$$

### 2.2 Analytic Hierarchy Process (AHP Channel Prioritization - Saaty, 1980)
- **Pairwise Comparison Matrix**: Given $n = 5$ criteria (Audience Alignment $C_1$, Objective Fit $C_2$, Cost Efficiency $C_3$, Market Reach $C_4$, Content Format Suitability $C_5$), expert evaluations define matrix $A \in \mathbb{R}^{n \times n}$:
  $$a_{ji} = \frac{1}{a_{ij}}, \quad a_{ii} = 1 \quad \forall i, j \in \{1, \dots, n\}$$
- **Weight Vector Calculation**: Computed via the geometric mean method:
  $$w_i = \frac{\left(\prod_{j=1}^n a_{ij}\right)^{1/n}}{\sum_{k=1}^n \left(\prod_{j=1}^n a_{kj}\right)^{1/n}}$$
- **Consistency Verification**:
  $$\lambda_{\max} = \frac{1}{n} \sum_{i=1}^n \frac{(A w)_i}{w_i}, \quad CI = \frac{\lambda_{\max} - n}{n - 1}, \quad CR = \frac{CI}{RI(n)}$$
  Where $RI(5) = 1.12$. Saaty's axiom mandates $CR \le 0.100$.

### 2.3 Constrained Budget Allocation (SLSQP with Exact Rupee Summation)
- **Non-Linear Objective**: Diminishing marginal returns proxy utility:
  $$\max_{x} U(x) = \sum_{k=1}^m s_k \ln\left(1 + \frac{x_k}{c_k}\right)$$
  Where $s_k$ is the normalized AHP composite channel priority, $c_k$ is the channel relative cost index, and $x_k$ is monthly allocation in LKR.
- **Constraints**:
  $$\sum_{k=1}^m x_k + x_{\text{reserve}} = B_{\text{monthly}}, \quad x_{\text{reserve}} = \alpha \cdot B_{\text{monthly}} \quad (\alpha = 0.10)$$
  $$L_k \le x_k \le U_k \quad \forall k \in \{1, \dots, m\}$$
- **Largest Remainder Integer Rounding (Zero Rupee Drift Guarantee)**:
  $$\hat{x}_k = \lfloor x_k^* \rfloor, \quad r_k = x_k^* - \lfloor x_k^* \rfloor, \quad \Delta = B_{\text{alloc}} - \sum \hat{x}_k$$
  Distribute $\Delta$ single rupees to channels with largest $r_k$, guaranteeing $\sum \text{allocations} + x_{\text{reserve}} == B_{\text{monthly}}$ exactly.

---

## 3. Empirical Machine Learning Evaluation Results

### 3.1 Dataset Partitioning & Leakage Prevention
- **Dataset**: `Dataset/Audience_Classifier_ML_5000.csv` (5,000 synthetic enterprise scenarios, 1,000 unique corporate profiles).
- **Split Strategy**: `GroupKFold` / `GroupShuffleSplit` partitioned strictly by `company_profile_id`:
  - **Training Set (70%)**: 3,500 scenarios across 700 companies.
  - **Validation Set (20%)**: 1,000 scenarios across 200 companies.
  - **Held-Out Test Set (10%)**: 500 scenarios across 100 companies.
  - **Zero Data Leakage**: No company profile present in train exists in test. `rule_baseline_label`, target label, `scenario_id`, and Q12 are strictly excluded from input features.

### 3.2 Model Benchmark Comparison (Held-Out Test Set, N=500)

| Architecture / Model | Feature Space | Test Accuracy | Macro-F1 | Low-F1 | Med-F1 | High-F1 | Inference Latency | System Role |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Rule Baseline (Q10+Q11)** | Structured Sum | 72.80% | 73.22% | 0.7285 | 0.6974 | 0.7708 | < 0.1 ms | Dataset Baseline |
| **Random Forest (100 Trees)** | MinMax Tabular | 73.20% | 73.49% | 0.7312 | 0.7018 | 0.7718 | 2.1 ms | Tabular Benchmark |
| **TF-IDF + Logistic Regression** | Textual 300-dim | 91.20% | 91.27% | 0.9028 | 0.9082 | 0.9272 | 3.4 ms | Fast Secondary |
| **Text-Only TF-IDF Network** | Textual 500-dim | 92.20% | 92.24% | 0.9153 | 0.9184 | 0.9338 | 3.8 ms | Text Ablation |
| **Multimodal Neural Fusion** | **Text + Likert (302)** | **90.60%** | **90.69%** | **0.8981** | **0.9039** | **0.9187** | **4.2 ms** | **Primary Production Model** |

### 3.3 Confusion Matrix (Multimodal Neural Fusion, Test Set N=500)

```
                     PREDICTED CLASS
                Low        Medium       High      Class Recall
ACTUAL  Low    [132]         14           0          90.41%
CLASS   Med     15         [169]         11          86.67%
        High     0            7         [152]        95.60%

Precision:     89.80%      88.95%       93.25%
Class F1:      0.8981      0.9039       0.9187    (Macro-F1 = 90.69%)
```

### 3.4 Key Empirical Insights
1. **Rule Baseline Limit**: The hidden generation rule in the dataset relies on $Q10 + Q11$:
   - $\le 4 \implies \text{Low}$, $\{5,6,7\} \implies \text{Medium}$, $\ge 8 \implies \text{High}$.
   - The rule baseline achieves 72.8% on the test split (matching the 75.32% overall audit agreement), confirming that ~25% of scenarios contain nuanced contextual variance that tabular rules cannot capture.
2. **Multimodal Robustness**: The Multimodal Fusion model achieves **90.60% accuracy** and **90.69% Macro-F1**, exceeding the research proposal threshold of 80.0%.

---

## 4. File-by-File Technical Directory Breakdown

Below is the comprehensive audit of every file in the system, explaining its architectural purpose, technical mechanisms, and research justification:

### 4.1 Backend (`backend/`)

| File Path | Description, Technical Mechanisms, and Why It Is Used |
| :--- | :--- |
| `backend/app/main.py` | **Application Entry Point**: Instantiates the FastAPI application, mounts global CORS middleware for frontend communication, registers the `/api/v1` router, initializes structured logging, and registers application startup/shutdown hooks. |
| `backend/app/core/config.py` | **Pydantic Settings**: Centralized configuration management reading from `.env`. Manages Supabase URL, service role keys, Gemini API keys, dataset file paths, CORS origins, and ML random seeds. |
| `backend/app/core/logging.py` | **Structured Logger**: Configures standardized Python logging across modules with timestamping and log level formatting. |
| `backend/app/core/security.py` | **Authentication & Security Engine**: Verifies Supabase JWT tokens, extracts tenant `organization_id` claims, and validates user roles for Row-Level Security enforcement. |
| `backend/app/core/database.py` | **Transactional Repository**: Thread-safe persistence layer providing PostgREST Supabase client initialization alongside in-memory fallback repositories for offline development and testing. |
| `backend/app/ml/inference.py` | **Multi-Model Audience Classifier Engine**: Houses PyTorch `MultimodalFusionNet` architecture and `AudienceClassifierService`. Loads model weights (`fusion_model.pt`) and preprocessors (`fusion_preprocessor.joblib`), performing real-time inference in 4.2 ms with rule fallback. |
| `backend/app/services/gemini_service.py` | **Feature-to-Value Message Translation**: Executes server-side Google Gemini structured JSON translation (FR4), adapting technical specifications into literacy-tailored marketing hooks with deterministic fallback templates. |
| `backend/app/ahp/matrix.py` | **AHP Matrix Math Engine**: Implements Saaty 1–9 reciprocal matrix operations, geometric mean eigenvector estimation, principal eigenvalue $\lambda_{\max}$ calculation, and Consistency Ratio ($CR$) validation against Saaty's 0.10 threshold. |
| `backend/app/ahp/engine.py` | **Channel Alternative Evaluator**: Scores 8 Sri Lankan channels (Facebook, Instagram, LinkedIn, TikTok, YouTube, Google Ads, Email, Website) across the 5 AHP criteria, computing final composite channel priorities. |
| `backend/app/budget/optimizer.py` | **Constrained Budget Optimizer**: Implements SLSQP non-linear optimization with proxy utility functions, channel bounds, 10% unallocated contingency reserve, and largest-remainder exact integer rupee distribution. |
| `backend/app/services/analysis_service.py` | **Full Pipeline Orchestrator**: Executes the complete end-to-end strategy assessment pipeline (FR1–FR7) in a single transactional flow, aggregating ML inference, AHP ranking, and budget allocation into a structured report. |
| `backend/app/api/v1/router.py` | **Primary API Router**: Aggregates and prefixes all domain sub-routers (`/health`, `/products`, `/questionnaire`, `/audience`, `/messages`, `/channels`, `/budget`, `/analysis`, `/research`, `/integrations`). |
| `backend/app/api/v1/health.py` | **Health & Readiness Endpoints**: Returns service status, version, and environment. |
| `backend/app/api/v1/products.py` | **Product Management Endpoints**: CRUD endpoints for tenant product profiles. |
| `backend/app/api/v1/questionnaire.py` | **Questionnaire Ingestion & Drafts**: Validates and persists responses to Q1–Q21. |
| `backend/app/api/v1/audience.py` | **Audience Inference Endpoint**: Exposes standalone ML technical literacy classification. |
| `backend/app/api/v1/messages.py` | **Message Generation Endpoint**: Standalone feature-to-value translation API. |
| `backend/app/api/v1/channels.py` | **AHP Channel Endpoints**: Exposes Sri Lanka channel catalog, criteria weights, and matrix calculation. |
| `backend/app/api/v1/budget.py` | **Budget Allocation Endpoint**: Exposes standalone SLSQP budget optimization. |
| `backend/app/api/v1/analysis.py` | **Comprehensive Assessment Endpoints**: Executes the full strategy run and provides JSON/CSV export formats. |
| `backend/app/api/v1/research.py` | **Research Evaluation & SUS Endpoints**: Exposes academic ML benchmark metrics and logs System Usability Scale evaluations. |
| `backend/app/api/v1/integrations.py` | **Consulting Framework Integration**: Emits standardized integration schemas for the overarching research framework. |
| `backend/app/schemas/` | **Pydantic v2 Contracts**: Type validation schemas: `common.py`, `questionnaire.py`, `audience.py`, `messages.py`, `channels.py`, `budget.py`, `analysis.py`, `evaluation.py`. |
| `backend/tests/unit/` | **Unit Test Suite**: 12 unit tests validating AHP matrix math, edge cases ($n=1, n=2$), budget zero-drift guarantees, custom bounds, and classifier logic. |
| `backend/tests/test_live_server.py` | **Live Integration Test**: Validates live HTTP endpoints, PyTorch classification, AHP consistency, and exact rupee budget summation against a running server. |

### 4.2 Machine Learning Pipeline (`ml/`)

| File Path | Description, Technical Mechanisms, and Why It Is Used |
| :--- | :--- |
| `ml/training/train_baselines.py` | **Baseline Model Training**: Trains and evaluates Rule-based heuristic, Scikit-learn Tabular Random Forest, TF-IDF + Logistic Regression, and Text-only TF-IDF on the group-held-out split. |
| `ml/training/train_fusion.py` | **Multimodal Neural Fusion Training**: Implements PyTorch dataset, dataloader, model architecture, training loop (20 epochs, CrossEntropyLoss, Adam), checkpointing, and evaluation metrics generation. |
| `ml/artifacts/fusion_model.pt` | **Trained PyTorch Model Weights**: 64-dimensional latent multimodal neural fusion network state dict. |
| `ml/artifacts/fusion_preprocessor.joblib` | **Fitted Preprocessors**: Scikit-learn TF-IDF vectorizer (300 terms) and MinMax scaler. |
| `ml/artifacts/tfidf_logistic_regression.joblib` | **Fitted Backup Model**: Scikit-learn Logistic Regression classifier. |
| `ml/evaluation/fusion_metrics.json` | **Measured Fusion Metrics**: Real test accuracy (90.6%), macro-F1 (90.69%), per-class F1, and confusion matrix. |
| `ml/evaluation/baseline_metrics.json` | **Measured Baseline Metrics**: Comparison metrics for rule baseline, random forest, and logistic regression. |
| `ml/model_cards/AUDIENCE_CLASSIFIER_MODEL_CARD.md` | **Model Card (Mitchell et al.)**: Academic documentation of intended use, training parameters, out-of-scope tasks, ethical considerations, and limitations. |

### 4.3 Frontend (`frontend/src/`)

| File Path | Description, Technical Mechanisms, and Why It Is Used |
| :--- | :--- |
| `frontend/src/App.tsx` | **Application Root**: Wires React Router DOM v7, React Query Client, MUI ThemeProvider, CssBaseline, layout components, and all 11 application routes. |
| `frontend/src/index.css` | **Global Design Tokens**: Inter and JetBrains Mono typography, dark background palette (`#0b0f19`), and custom scrollbars. |
| `frontend/src/theme/theme.ts` | **MUI Custom Dark Theme**: Curated palette with primary Teal (`#0d9488`), secondary Sky Blue (`#0284c7`), surface cards (`#111827`), and responsive typography. |
| `frontend/src/lib/api.ts` | **Axios API Client**: Typed client with Bearer token injection, exposing `api`, `analysisApi`, and `researchApi`. |
| `frontend/src/types/index.ts` | **TypeScript Type Definitions**: Mirrors backend Pydantic schemas for compile-time type safety across questionnaires, predictions, rankings, and budgets. |
| `frontend/src/components/Layout/DisclaimerBanner.tsx` | **Truth Disclaimer Banner**: Top-level warning badge stating 100% synthetic simulation provenance and unvalidated commercial status. |
| `frontend/src/components/Layout/Navbar.tsx` | **Application Navbar**: Displays system title, active company chip, PyTorch model online badge, and quick research links. |
| `frontend/src/components/Layout/Sidebar.tsx` | **Navigation Sidebar**: Categorized navigation for Decision Support tools and Research Evaluation tools. |
| `frontend/src/pages/Welcome.tsx` | **Welcome & Overview**: Introduction to Research Proposal J26-ISE-313, methodology overview, and quick action launch buttons. |
| `frontend/src/pages/Dashboard.tsx` | **Workspace Dashboard**: Summary metrics, recent strategy runs, active products, and quick assessment launcher. |
| `frontend/src/pages/Products.tsx` | **Company Products Catalog**: Product registration and profile management UI. |
| `frontend/src/pages/AssessmentWizard.tsx` | **5-Step Assessment Wizard (Q1–Q21)**: Step-by-step questionnaire with sample scenario prefill and live PyTorch audience classification preview. |
| `frontend/src/pages/StrategyReport.tsx` | **Strategy Assessment Dashboard**: Interactive visualizations (Recharts bar charts for channel scores, pie charts for budget allocations), message cards, and JSON/CSV/print export. |
| `frontend/src/pages/CampaignHistory.tsx` | **Assessment Reports History**: Filterable table of past strategy runs with links to reports and comparison. |
| `frontend/src/pages/CampaignComparison.tsx` | **Side-by-Side Scenario Comparison**: Compares audience profiles, AHP weights, channel allocations, and message hooks between 2 strategy runs. |
| `frontend/src/pages/AHPMatrixExpert.tsx` | **AHP Multi-Criteria Expert Matrix**: Interactive 5x5 Saaty 1–9 pairwise comparison matrix with reciprocal auto-fill, real-time Consistency Ratio ($CR$) calculation, and preset decision templates. |
| `frontend/src/pages/ResearchEvaluation.tsx` | **Research Evaluation Registry**: Side-by-side benchmark tables, confusion matrix, per-class F1 breakdown, and synthetic provenance disclosures. |
| `frontend/src/pages/SUSSurvey.tsx` | **System Usability Scale (SUS) Evaluation**: Standard 10-item psychometric survey (Brooke, 1996) with live score calculation against the benchmark threshold ($\ge 70.0$). |
| `frontend/src/pages/Methodology.tsx` | **Methodological Foundations**: Mathematical walkthrough of AHP eigenvector derivation, SLSQP optimization, SUS scoring formulas, and institutional citations (ICTA, EDB, SLASSCOM, DataReportal). |

### 4.4 Database & Migrations (`supabase/`)

| File Path | Description, Technical Mechanisms, and Why It Is Used |
| :--- | :--- |
| `supabase/migrations/20261020000001_initial_schema.sql` | **PostgreSQL DDL Migration**: Defines 23 relational tables, custom enums (`industry_type`, `market_type`, `literacy_level`), foreign keys, check constraints, and performance indexes. |
| `supabase/migrations/20261020000002_rls_policies.sql` | **Row-Level Security (RLS)**: Enforces tenant isolation using PostgreSQL `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and policies filtering by `organization_id`. |
| `supabase/seed/seed.sql` | **Catalog & Benchmark Seed Data**: Seeds 8 Sri Lankan channels, default criteria, market context sources (ICTA, DataReportal, EDB), and default tenant profile. |

---

## 5. Academic Limitations & Truth Constraints

To maintain research integrity in accordance with Proposal J26-ISE-313:
1. **Synthetic Data Provenance**: The 5,000 dataset records in `Dataset/Marketing_Questionnaire_Synthetic_5000.csv` are **100% synthetically simulated** across 1,000 fictional tech enterprise profiles. They do not represent surveyed human respondents.
2. **Empirical Validation**: Model test accuracy (90.60%) confirms high mathematical fidelity to the synthetic simulation's generation rules. Prospective commercial field trials are necessary before asserting verified market conversion uplifts.
3. **Assumed Weights**: Initial AHP criteria weights (34%, 25%, 18%, 13%, 10%) represent an assumed proposal demonstration fallback. Decision-makers are advised to use the interactive AHP Matrix (`/expert/ahp`) for domain-specific pairwise elicitation.
