# Data Dictionary & Schema Governance

**Project:** Marketing Strategy Assessment System  
**Dataset Reference:** `Sri_Lanka_Marketing_Research_5000` (Synthetic Research Scenarios)  
**Schema Version:** v1.0-SL-2026  

---

## 1. Provenance & Research Governance Notice
> [!IMPORTANT]
> **Data Provenance Disclosure:**  
> All 5,000 records in `Marketing_Questionnaire_Synthetic_5000.csv`, `Audience_Classifier_ML_5000.csv`, and `Marketing_Channel_Budget_5000.csv` are **100% synthetic scenarios** generated for software development, algorithmic benchmarking, and UI prototyping.  
> They do **not** represent primary surveyed human respondents, verified Sri Lankan tech companies, or measured campaign performance.

---

## 2. Table-by-Table Field Specification

### 2.1 Audience Classifier Features (`Audience_Classifier_ML_5000.csv`)

| Field Name | Type | Allowed Values / Range | Role in Machine Learning | Provenance / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `scenario_id` | String | `SYN-0001-C1` .. `SYN-1000-C5` | **EXCLUDED (Target Leakage)** | Unique identifier for scenario. |
| `company_profile_id` | String | `SYNCO-0001` .. `SYNCO-1000` | **GROUPING ONLY** | Used strictly for Group-K-Fold / split isolation. Must never cross train/val/test splits. |
| `ml_split` | String | `train` (3,750), `validation` (750), `test` (500) | **SPLIT IDENTIFIER** | Fixed holdout partition. |
| `industry` | Categorical | 8 sectors (SaaS, FinTech, E-commerce, Health, Edu, AI, Cyber, Other) | **PREDICTOR (Categorical)** | Candidate feature. One-hot encoded. |
| `market_type` | Categorical | `B2B`, `B2C`, `Both` | **PREDICTOR (Categorical)** | Candidate feature. One-hot encoded. |
| `customer_role` | Categorical | 10 roles (Business owner, IT pro, Student, Manager, etc.) | **PREDICTOR (Categorical)** | Candidate feature. One-hot encoded. |
| `age_group` | Categorical | `18-24`, `25-34`, `35-44`, `45-54`, `55+`, `Multiple` | **PREDICTOR (Categorical)** | Candidate feature. One-hot encoded. |
| `location` | Categorical | Sri Lankan Provinces & Municipalities | **PREDICTOR (Categorical)** | Candidate feature. One-hot encoded. |
| `customer_audience_text`| Text | English text (5–200 words) | **PREDICTOR (NLP Text)** | Free-text audience description. TF-IDF vectorizer (max 600 features). |
| `technology_comfort_1to5`| Integer | 1, 2, 3, 4, 5 | **PREDICTOR (Numeric)** | Self-reported customer tech comfort. Standard-scaled. |
| `technical_terms_familiarity_1to5` | Integer | 1, 2, 3, 4, 5 | **PREDICTOR (Numeric)** | Self-reported terminology familiarity. Standard-scaled. |
| `technical_literacy_reference_label_SIMULATED` | Categorical | `Low`, `Medium`, `High` | **TARGET (Supervised Training)** | Derived from latent synthetic aptitude. For prototype experiments only. |
| `rule_baseline_label` | Categorical | `Low`, `Medium`, `High` | **EXCLUDED (Target Leakage)** | Threshold heuristic on Q10 + Q11. Baseline comparison only. |
| `label_origin` | String | `synthetic_simulation` | **METADATA** | Provenance tag. |
| `forbidden_training_fields_note` | String | Text note | **METADATA** | Explicit exclusion marker. |

---

### 2.2 Marketing Channel & Budget Schema (`Marketing_Channel_Budget_5000.csv`)

| Field Name | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `monthly_budget_LKR` | Integer | LKR | Stated monthly budget in Sri Lankan Rupees ($\ge 0$). |
| `campaign_months` | Integer | Months | Campaign duration (1, 3, 6, or explicit months). |
| `total_campaign_budget_LKR` | Integer | LKR | Total budget = `monthly_budget_LKR * campaign_months`. |
| `channel_1`, `channel_2`, `channel_3` | String | Name | Top recommended marketing channels. |
| `channel_1_score_0to100` | Float | Score (0-100) | Multi-criteria alignment score. |
| `channel_1_monthly_LKR` | Integer | LKR | Monthly allocation for channel 1. |
| `channel_2_monthly_LKR` | Integer | LKR | Monthly allocation for channel 2. |
| `channel_3_monthly_LKR` | Integer | LKR | Monthly allocation for channel 3. |
| `unallocated_monthly_LKR` | Integer | LKR | Contingency reserve or unallocated residue. |
| `is_real_observed_outcome` | Boolean | Flag | Always `false` in synthetic dataset. |
