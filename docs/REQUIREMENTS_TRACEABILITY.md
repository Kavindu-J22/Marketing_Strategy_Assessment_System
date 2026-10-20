# Requirements Traceability Matrix & Source Audit

**Project Title:** A Product and Service Management Consulting Framework for Sri Lankan Tech Companies  
**Individual Component:** Marketing Strategy Assessment (Smart Marketing System)  
**Research Proposal Reference:** `J26-ISE-313 IT23221796 Proposal.pdf` (SLIIT, 2026)  
**Stakeholder Questionnaire Reference:** `Questionary Final.docx`  
**Dataset Reference:** `Sri_Lanka_Marketing_Research_5000` (Synthetic scenarios, N=5,000, 1,000 fictional company profiles)  

---

## 1. Functional Requirements Traceability Matrix (FR1 – FR7)

Citations refer to Proposal Section 5.1 (Table 5, p. 23), Section 2.2 (p. 17), and Section 3.4 (Table 2.1, p. 20).

| Req ID | Proposal Name & Citation | Proposal Specification | Routes & UI Endpoints | Backend Services & Handlers | Database Entities & Tables | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FR1** | **Product Information Input**<br>(Proposal Table 5, p. 23) | System shall allow users to enter product/service descriptions, technical features, and problem solved. | `/products/new`<br>`/products/:id/edit`<br>Wizard Step 1 (`Q1`–`Q4`) | `ProductService`<br>`POST /api/v1/products`<br>`POST /api/v1/questionnaire/validate` | `products`<br>`organizations` | `backend/tests/unit/test_products.py`<br>`frontend/src/tests/wizard_step1.test.tsx` |
| **FR2** | **Audience Information Input**<br>(Proposal Table 5, p. 23) | System shall allow users to provide target-audience characteristics: customer type, role, age, tech familiarity, Sri Lankan geography. | Wizard Step 2 (`Q5`–`Q9`)<br>Wizard Step 3 (`Q10`–`Q12`) | `AudienceInputSchema`<br>`target_audience_profiles`<br>`POST /api/v1/questionnaire/validate` | `target_audience_profiles`<br>`questionnaire_responses` | `backend/tests/unit/test_questionnaire.py`<br>`frontend/src/tests/wizard_step2.test.tsx` |
| **FR3** | **Technical Literacy Analysis**<br>(Proposal Table 5, p. 23; Sec 3.3–3.4, pp. 19–20) | System shall analyze structured responses and textual audience information to classify target audience into defined literacy categories (`Low`, `Medium`, `High`) with uncertainty calibration. | Wizard Step 3 Preview<br>Strategy Report Audience Card<br>`/research/models` | `AudienceClassifierService`<br>`ml.inference.classifier`<br>`POST /api/v1/audience/predict` | `audience_predictions`<br>`model_versions`<br>`evaluation_results` | `backend/tests/unit/test_classifier.py`<br>`ml/tests/test_model_leakage.py`<br>`backend/tests/unit/test_baselines.py` |
| **FR4** | **Feature-to-Value Translation**<br>(Proposal Table 5, p. 23; Sec 3.4, pp. 19–20) | System shall generate customer-oriented marketing messages from technical product features according to audience literacy and preference. | Wizard Step 4 (`Q13`–`Q14`)<br>Strategy Report Messaging Card<br>Review & Edit Modal | `MessagingService`<br>`services.gemini_service`<br>`POST /api/v1/messages/generate` | `generated_messages`<br>`expert_reviews` (rubric) | `backend/tests/unit/test_messaging.py`<br>`backend/tests/unit/test_guardrails.py` |
| **FR5** | **Marketing Channel Recommendation**<br>(Proposal Table 5, p. 23; Sec 3.3–3.4, pp. 19–20) | System shall rank suitable marketing channels based on audience, objectives, and criteria using Analytical Hierarchy Process (AHP). | Wizard Step 4 (`Q15`–`Q17`)<br>Strategy Report Channels Card<br>AHP Matrix Expert UI | `AHPService`<br>`app.ahp.engine`<br>`POST /api/v1/channels/rank` | `channel_catalog`<br>`ahp_criteria`<br>`ahp_pairwise_judgments`<br>`channel_rankings` | `backend/tests/unit/test_ahp.py`<br>`backend/tests/unit/test_ahp_math.py` |
| **FR6** | **Budget Allocation**<br>(Proposal Table 5, p. 23; Sec 3.3–3.4, pp. 19–20) | System shall generate a constraint-aware recommended allocation of user-defined marketing budget (LKR) among selected channels with exact sum. | Wizard Step 5 (`Q18`–`Q21`)<br>Strategy Report Budget Card<br>Scenario Sensitivity Simulator | `BudgetAllocationService`<br>`app.budget.optimizer`<br>`POST /api/v1/budget/allocate` | `budget_allocations`<br>`analysis_runs` | `backend/tests/unit/test_budget.py`<br>`backend/tests/unit/test_budget_edges.py` |
| **FR7** | **Marketing Strategy Output**<br>(Proposal Table 5, p. 23; Sec 3.6, p. 21) | System shall present audience profile, generated messages, channel rankings, and budget allocation in an understandable, exportable dashboard. | `/campaigns/:id/report`<br>`/campaigns/compare`<br>Export (PDF / CSV / JSON) | `AnalysisOrchestrationService`<br>`GET /api/v1/analysis/:run_id/report`<br>`GET /api/v1/analysis/:run_id/export` | `analysis_runs`<br>`audit_logs` | `backend/tests/integration/test_pipeline.py`<br>`frontend/src/tests/report_view.test.tsx` |

---

## 2. Non-Functional Requirements Traceability Matrix (NFR1 – NFR6)

Citations refer to Proposal Section 5.2 (Table 6, p. 24).

| NFR ID | Requirement Name | Proposal Measurable Criterion | Architectural Strategy & Implementation | Engineering Target (Proposed Acceptance Criteria) | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NFR1** | **Usability** | Users complete main workflow without technical assistance; assessed using structured questionnaire such as System Usability Scale (SUS). | Intuitive 5-step wizard, contextual help, tooltips explaining AHP and uncertainty, inline validation, responsive layout, dedicated SUS survey page (`/usability/sus`). | Mean SUS score $\ge 70/100$ in user evaluations; zero blocking accessibility errors. | In-app 10-item standard SUS survey component, automated scoring, CSV export. |
| **NFR2** | **Performance** | Return recommendations and generated outputs within acceptable response time; recorded during evaluation. | Async backend execution, cached static computations, lightweight transformer/tabular inference, streaming/background analysis orchestration. | P50 response $< 1.5$s for ML + AHP + Budget; P95 $< 4.0$s (excluding external Gemini API network roundtrip). | Latency benchmarking suite in `backend/tests/performance/`, logged in run metadata. |
| **NFR3** | **Accuracy** | Technical-literacy classification evaluated using accuracy, precision, recall, and F1-score against reference classifications. | Multi-model evaluation: Rule baseline, TF-IDF + Logistic Regression/Linear SVM, Multimodal Fusion Transformer. Strict group holdout (no profile leakage). | Documented test macro-F1 on synthetic holdout; explicit disclaimer that synthetic label match does NOT equal field accuracy. | Automated test run on held-out split (`ml_split == 'test'`); metrics exported to `docs/MODEL_CARD.md`. |
| **NFR4** | **Reliability** | Consistent outputs when same valid input is processed repeatedly under identical conditions. | Deterministic seed option, zero floating-point drift in budget arithmetic (integer LKR), idempotent analysis endpoints, stateful run recovery. | 100% deterministic repeatability for AHP and Budget allocation given identical inputs. | Repeated execution unit tests with diff checks (`backend/tests/unit/test_reliability.py`). |
| **NFR5** | **Security & Privacy** | Stored and processed with appropriate access controls; no PII required; tenant isolation. | Supabase PostgreSQL Row Level Security (RLS) on all tenant tables; FastAPI JWT validation; no secrets in browser; parameterized SQL. | 100% tenant data isolation; unauthorized read/write attempts rejected with 401/403. | Security penetration and cross-tenant leakage test suite (`backend/tests/security/test_rls.py`). |
| **NFR6** | **Maintainability** | Modular components so classification, messaging, channels, and budget can be updated independently. | Clear hexagonal/service architecture: `ml/`, `ahp/`, `budget/`, `services/gemini_service.py` with standalone interfaces and schemas. | Individual module test suites run in isolation; versions tracked in `model_versions` and `ahp_weight_versions`. | Independent unit test suites per module; clean OpenAPI contract specification. |

---

## 3. Questionnaire Mapping & Dataset Column Inventory

### 3.1 Mapping Questionnaire (`Questionary Final.docx`) to Application Schema and CSV Columns

| Questionnaire Item | Original DOCX Prompt & Options | Revised Field ID & Type | CSV Column in `Marketing_Questionnaire_Synthetic_5000.csv` | Design Rationale & Gap Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **Q1** | Product/Service Name (Short text) | `q1_product_name` (Text, 2–100 chars) | `Q1_product_service_name` | Direct 1:1 mapping. Required. |
| **Q2** | Description (Long text: features, tech used) | `q2_product_description` (Text, 10–2000 chars) | `Q2_product_description` | Direct 1:1 mapping. Required. |
| **Q3** | Main features ("Multiple Choice" in DOCX) | `q3_main_features` (`List[str]`, repeatable text items) | `Q3_main_features` (Semicolon-separated) | **Resolved Gap:** DOCX stated "Multiple Choice" but actual tech features require custom repeatable text tags, not a fixed radio button list. |
| **Q4** | Industry (8 options: SaaS, FinTech, E-com, Health, Edu, AI, Cyber, Other) | `q4_industry` (Enum, 8 choices) | `Q4_industry` | Exact 8 industry categories matched. |
| **Q5** | Primary target customer (Open text) | `q5_primary_target_customer` (Text, 5–500 chars) | `Q5_primary_target_customer` | Explicit audience description preserved. |
| **Q6** | Target market (`B2B`, `B2C`, `Both`) | `q6_market_type` (Enum: B2B, B2C, Both) | `Q6_market_type` | Direct 1:1 mapping. |
| **Q7** | Target age group (`18-24`, `25-34`, `35-44`, `45-54`, `55+`, `Multiple`) | `q7_age_group` (Enum, 6 choices) | `Q7_target_age_group` | Direct 1:1 mapping. |
| **Q8** | Typical occupation/role (Multi-select) | `q8_customer_roles` (`List[Enum]`) | `Q8_customer_occupation` | Preserved roles: Business owner, IT pro, Student, Manager, Accountant, Consumer, Ops, Educator, Health admin, Marketing exec. |
| **Q9** | Target location (All Sri Lanka, Western, Other, Specific city) | `q9_location` (Selection + optional city text) | `Q9_target_location` | Preserved Sri Lankan geographic granularity. |
| **Q10** | Technology comfort (5-point scale: Very low to Very high) | `q10_tech_comfort` (Enum + numeric 1–5) | `Q10_technology_comfort` + `technical_comfort_score_1to5` | Preserved full 5-point text scale and numeric conversion. |
| **Q11** | Familiarity with technical terms (5-point scale: Not familiar to Highly) | `q11_terms_familiarity` (Enum + numeric 1–5) | `Q11_technical_terms_familiarity` + `technical_terms_score_1to5` | Preserved full 5-point text scale and numeric conversion. |
| **Q12** | Marketing communication detail preference (5-point scale) | `q12_detail_preference` (Enum, 5 choices) | `Q12_message_detail_preference` | **Critical Distinction:** Kept as user *preference*, excluded from ML training features to prevent target leakage. |
| **Q13** | Main benefit customers should understand (Long text) | `q13_main_benefit` (Text, 10–1000 chars) | `Q13_main_customer_benefit` | Preserved. Used in LLM feature-to-value prompt. |
| **Q14** | Customer pain points ("Saves time", "Reduces costs", etc.) | `q14_pain_points` (`List[str]`, multi-select + custom) | `Q14_actual_customer_pain_points` | **Resolved Gap:** DOCX listed benefits (e.g. "Saves time") under pain points. System separates actual pains ("Manual stock tracking") from benefits. |
| **Q15** | Current marketing channels used (Multi-select, 8 channels + "None currently") | `q15_current_channels` (`List[str]`) | `Q15_current_marketing_channels` | Channels: Facebook, Instagram, LinkedIn, TikTok, YouTube, Google Ads, Email, Website/SEO, None currently. |
| **Q16** | Best channels so far (Multi-select) | `q16_prior_best_channels` (`List[str]`) | `Q16_prior_best_channels` | **Resolved Gap:** UI dynamically presents only channels chosen in Q15, or "No performance data" / "None currently". |
| **Q17** | Content format audience engages with most (7 options) | `q17_preferred_content` (`List[str]`) | `Q17_preferred_content` | Options: Short videos, Educational videos, Images, Articles, Case studies, Product demos, Testimonials. |
| **Q18** | Monthly marketing budget (Number in LKR) | `q18_monthly_budget_lkr` (Integer LKR, $\ge 0$) | `Q18_monthly_marketing_budget_LKR` | Validates non-negative integer rupees; handles zero-budget gracefully. |
| **Q19** | Budget flexibility (Fixed, Slightly, Moderately, Highly) | `q19_budget_flexibility` (Enum, 4 choices) | `Q19_budget_flexibility` | Feeds into budget optimizer slack bounds. |
| **Q20** | Campaign duration (`1 month`, `3 months`, `6 months`, `More than 6 months`) | `q20_duration_months` (Enum + explicit number if $>6$) | `Q20_campaign_duration` + `campaign_months` | Avoids assuming $>6$ equals 7; allows explicit integer input. |
| **Q21** | Success definition / Campaign goals (Multi-select + target) | `q21_goals` (`List[str]` + optional KPI target) | `Q21_success_definition` + `campaign_primary_goal` + `goal_KPI_unit` | Captures primary goal and optional measurable KPI target (e.g., leads/month). |

---

## 4. Source-vs-Design Decisions & Missing Empirical Evidence Disclosures

```
+----------------------------------------------------------------------------------------------------+
|                                    NON-NEGOTIABLE TRUTH CONSTRAINTS                                |
+----------------------------------------------------------------------------------------------------+
| 1. DATASET PROVENANCE: 100% Synthetic scenarios (N=5,000; 1,000 fictional companies).             |
|    - NOT actual surveyed respondents, verified companies, or measured campaign outcomes.           |
|    - UI and API must explicitly display: "Synthetic / Prototype Data" vs "Expert Validated".       |
|                                                                                                    |
| 2. AHP WEIGHTS: The synthetic weights (34%, 25%, 18%, 13%, 10%) are an ASSUMED DEMO FALLBACK.     |
|    - NOT expert-elicited weights. System provides pairwise matrix elicitation UI for real experts. |
|    - Consistency Ratio (CR) must be calculated; CR > 0.10 flags inconsistency.                     |
|                                                                                                    |
| 3. BUDGET ALLOCATION: Constrained optimization of a PROXY UTILITY score.                           |
|    - Never assert or claim predicted real-world ROI or financial return.                           |
|    - Integer LKR arithmetic guarantees exact sums (allocations + reserve == monthly budget).       |
|                                                                                                    |
| 4. EMPIRICAL VALIDATION STATUS: If no verified field data or human expert review is recorded,     |
|    the system must display: "Not yet empirically validated".                                       |
+----------------------------------------------------------------------------------------------------+
```

---

## 5. High-Level Architecture & Component Integration Contract

```
+----------------------------------------------------------------------------------------------------+
|                                  REACT (VITE) + TYPESCRIPT FRONTEND                                 |
|                                                                                                    |
|  [Auth / Workspace]  [Company & Products]  [Q1-Q21 Wizard]  [Strategy Report]  [Research Evaluation]|
|          |                   |                     |                |                    |         |
|          +-------------------+---------------------+----------------+--------------------+         |
|                                                    | (Bearer JWT)                                  |
+----------------------------------------------------v-----------------------------------------------+
                                             HTTPS / JSON REST API
+----------------------------------------------------v-----------------------------------------------+
|                                     FASTAPI PYTHON BACKEND SERVICE                                 |
|                                                                                                    |
|  [Auth Middleware & Tenant Scoping] <---> [Supabase Auth (JWKS Verification)]                      |
|                                                                                                    |
|  [Core Pipeline Orchestration Engine]                                                              |
|        |                                                                                           |
|        +---> [1. ML Audience Classifier] (TF-IDF Baseline, PyTorch Deep Fusion / Transformer)     |
|        |                                                                                           |
|        +---> [2. Gemini Feature-to-Value Translator] (Structured JSON, Guardrails, Culturally Aware)|
|        |                                                                                           |
|        +---> [3. AHP Channel Ranking Engine] (Saaty Matrix, Eigenvector / GeoMean, CI/CR Check)    |
|        |                                                                                           |
|        +---> [4. Budget Optimizer] (scipy.optimize / Integer LKR exact summation)                 |
|        |                                                                                           |
|        +---> [5. Evidence & Knowledge Registry] (Sri Lankan Market Context, Sourced Citations)     |
|        |                                                                                           |
|        +---> [6. Research Evaluation & SUS Module] (Metrics, Human Rubrics, Standard 10-Item SUS)  |
+----------------------------------------------------v-----------------------------------------------+
                                             SQL / RLS Enforced
+----------------------------------------------------v-----------------------------------------------+
|                                      SUPABASE POSTGRESQL DATABASE                                   |
|                                                                                                    |
|  - profiles, organizations, organization_members (Tenant Isolation)                                |
|  - products, target_audience_profiles, campaigns, questionnaire_responses                          |
|  - analysis_runs, audience_predictions, generated_messages, channel_rankings, budget_allocations     |
|  - ahp_criteria, ahp_pairwise_judgments, ahp_weight_versions, market_sources                        |
|  - expert_reviews, usability_responses (SUS), model_versions, evaluation_results, audit_logs       |
+----------------------------------------------------------------------------------------------------+
```

### Component Integration Contract (Consulting Framework Integration)
Other components of the overarching *Product and Service Management Consulting Framework* interact via versioned REST endpoints:
- **`GET /api/v1/integrations/summary?organization_id=...&product_id=...`** (Bearer Auth required, tenant scoped)
  - Returns canonical audience literacy level, key value proposition, top 3 recommended marketing channels, and monthly budget allocation.
- **`POST /api/v1/analysis/run`**
  - Accepts validated questionnaire payload or references existing product run; returns durable `run_id` for asynchronous status polling.

---

## 6. Delivery Milestones & Acceptance Criteria

- **Milestone 1:** Monorepo scaffolding, environment configuration, Supabase SQL migrations with strict RLS, authentication, and core application shell.
- **Milestone 2:** Product & Organization CRUD, 21-question assessment wizard with draft autosave, step validation, and schema tests.
- **Milestone 3:** Offline dataset audit pipeline, baseline and neural classifier training CLIs, group-held-out evaluation reports, and production inference artifacts.
- **Milestone 4:** Server-side Gemini feature-to-value translation with structured schema validation, guardrails, fallback templates, and human reviewer rubric.
- **Milestone 5:** Explainable AHP engine with Saaty reciprocal matrix, eigenvalue/consistency calculations, expert elicitation UI, and Sri Lankan market knowledge registry.
- **Milestone 6:** Constraint-aware budget optimizer with integer LKR arithmetic, baseline comparison, sensitivity analysis, and zero/edge-case handling.
- **Milestone 7:** End-to-end analysis orchestration, scenario comparison, and multi-format report exports (PDF/CSV/JSON).
- **Milestone 8:** Research evaluation dashboard with separated synthetic vs real metrics, expert review interface, and standard 10-item SUS survey.
- **Milestone 9:** Comprehensive test suites (unit, integration, security/RLS), containerization (`docker-compose.yml`), and academic documentation bundle.
