# API Specification: Marketing Strategy Assessment

**Base URL:** `http://localhost:8000/api/v1`  
**Authentication:** `Authorization: Bearer <supabase_jwt_token>`  
**Specification Standard:** OpenAPI 3.1 / JSON REST  

---

## 1. Authentication & Scoping Policy
- All tenant endpoints require a valid Supabase Auth Bearer JWT token.
- Multi-tenancy is strictly enforced server-side. Users can only access products, campaigns, and runs belonging to their verified `organization_id`.
- Roles: `admin`, `researcher`, `expert`, `member`.

---

## 2. Endpoint Catalog

### 2.1 System & Configuration
- **`GET /health`**
  - Response: `{"status": "healthy", "service": "Marketing Strategy Assessment System", "version": "1.0.0"}`
- **`GET /config/public`**
  - Response: Public environment parameters, supported channels, currency (LKR), and Gemini configuration status.

### 2.2 Product & Organization Management (FR1)
- **`GET /organizations/current`**
  - Returns authenticated user's organization profile.
- **`GET /products`**
  - Returns list of technology products for the current organization.
- **`POST /products`**
  - Body: `name`, `description`, `industry`, `features`, `problem_solved`, `target_customer_summary`.
  - Response: `201 Created` with persistent product entity.
- **`GET /products/{product_id}`**
  - Returns product details.
- **`PUT /products/{product_id}`**
  - Updates product attributes.
- **`DELETE /products/{product_id}`**
  - Deletes product and associated records (Admin role required).

### 2.3 Questionnaire & Validation (FR1, FR2)
- **`GET /questionnaire/schema`**
  - Returns metadata for all 21 questions (Q1 - Q21), input types, options, and validations.
- **`POST /questionnaire/validate`**
  - Validates full 5-step questionnaire payload; returns step validation checks without launching execution.
- **`POST /questionnaire/draft`**
  - Saves in-progress questionnaire draft for autosave recovery.
- **`GET /questionnaire/draft/{draft_id}`**
  - Retrieves saved draft.

### 2.4 Audience Technical Literacy Classifier (FR3)
- **`POST /audience/predict`**
  - Request:
    ```json
    {
      "industry": "Software / SaaS",
      "market_type": "B2B",
      "customer_role": "IT professional",
      "age_group": "25-34",
      "location": "Colombo",
      "customer_audience_text": "Software architects building cloud platforms",
      "technology_comfort_1to5": 4,
      "technical_terms_familiarity_1to5": 4,
      "model_preference": "auto"
    }
    ```
  - Response:
    ```json
    {
      "predicted_class": "High",
      "probabilities": {"Low": 0.05, "Medium": 0.15, "High": 0.80},
      "confidence_score": 0.80,
      "uncertainty_caveat": "Trained on synthetic research data. Reflects simulation priors, not field-verified customer proficiency.",
      "is_abstain_recommended": false,
      "model_type": "PyTorch Multimodal Fusion Network",
      "model_version": "v1.0-fusion",
      "dataset_provenance": "synthetic_demo",
      "is_empirically_validated": false,
      "reason_codes": ["High digital tool comfort increases likelihood of Medium or High literacy."]
    }
    ```

### 2.5 Feature-to-Value Message Generation (FR4)
- **`POST /messages/generate`**
  - Request: `product_name`, `product_description`, `main_features`, `industry`, `market_type`, `primary_benefit`, `customer_pain_points`, `audience_description`, `literacy_level`, `campaign_goal`, `target_language`.
  - Response: `feature_to_benefit_map`, `core_value_proposition`, `simple_message`, `balanced_message`, `technical_message`, `recommended_message`, `short_headline`, `social_caption`, `cta`, `rationale`, `claim_warnings`.

### 2.6 AHP Marketing Channel Recommendation (FR5)
- **`GET /channels/catalog`**
  - Returns the 8 supported marketing channels with Sri Lanka reach rates and relative cost indices.
- **`GET /channels/criteria`**
  - Returns AHP criteria: `audience_fit`, `objective_fit`, `cost_suitability`, `reach_fit`, `content_fit`.
- **`POST /channels/rank`**
  - Calculates multi-criteria alignment scores (0-100), criterion contributions, and Consistency Ratio ($CR$).

### 2.7 Constraint-Aware Budget Allocation (FR6)
- **`POST /budget/allocate`**
  - Optimizes monthly budget across recommended channels. Guarantees 100% exact integer sum in LKR. Includes equal-split baseline comparison and proxy utility score.

### 2.8 Analysis Run Orchestration (FR7)
- **`POST /analysis/run`**
  - Executes end-to-end strategy pipeline. Returns durable `run_id` and complete `ComprehensiveStrategyReport`.
- **`GET /analysis/runs`**
  - Lists historical strategy runs for current organization.
- **`GET /analysis/{run_id}/report`**
  - Retrieves full report JSON.
- **`GET /analysis/{run_id}/export?format=json|csv`**
  - Downloads structured report file.

### 2.9 Usability & Research Evaluation (NFR1, NFR3)
- **`POST /research/sus`**
  - Submits 10-item System Usability Scale (SUS) survey; computes standard Brooke (1996) score.
- **`GET /research/sus`**
  - Retrieves aggregate SUS statistics, sample size, and target benchmark comparison ($\ge 70$).
- **`POST /research/expert-review`**
  - Records blinded expert review rubric ratings (1-5 Likert).
- **`GET /research/evaluation`**
  - Returns multi-model baseline comparison table, confusion matrix, limitations, and empirical status.

### 2.10 Cross-Component Integration Contract
- **`GET /integrations/summary?product_id=...&organization_id=...`**
  - Provides lightweight, high-level strategy summary for external components of the *Product and Service Management Consulting Framework*.
