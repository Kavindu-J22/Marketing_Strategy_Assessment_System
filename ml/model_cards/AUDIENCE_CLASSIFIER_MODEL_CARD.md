# Model Card: Target Audience Technical Literacy Classifier

## Model Details
- **Model Name:** PyTorch Multimodal Fusion Network for Audience Technical Literacy
- **Version:** v1.0-fusion (Seed: 20261020)
- **Model Type:** Multimodal Deep Neural Fusion Network (NLP Text TF-IDF Projection + Dense Categorical Embeddings + Normalized Numeric Scores)
- **Framework:** PyTorch 2.10+, Scikit-Learn 1.7+
- **Developer:** Research Engineering Team (SLIIT ISE Research J26-ISE-313)
- **License:** Research / Academic Use Only

---

## Intended Use
- **Primary Use Case:** Classify target customer audience descriptions and self-reported comfort scores into three technical literacy levels (`Low`, `Medium`, `High`) to inform customer-appropriate messaging and channel selection in the Sri Lankan tech consulting framework.
- **Out of Scope:** Individual psychometric or educational evaluation; employment vetting; definitive claims of true customer competence without empirical field testing.

---

## Factors & Input Schema
The model strictly consumes only pre-decision candidate predictors:
1. `customer_audience_text` (Free-text audience behavior and workflow description)
2. `industry` (8 categorical sectors: SaaS, FinTech, E-commerce, HealthTech, EduTech, AI, Cybersecurity, Other)
3. `market_type` (B2B, B2C, Both)
4. `customer_role` (Business owner, IT professional, Student, Manager, Accountant, General consumer, Operations staff, etc.)
5. `age_group` (18-24, 25-34, 35-44, 45-54, 55+, Multiple)
6. `location` (Sri Lankan province or municipal area)
7. `technology_comfort_1to5` (Standard 5-point Likert scale: 1 to 5)
8. `technical_terms_familiarity_1to5` (Standard 5-point Likert scale: 1 to 5)

**Excluded Features (Leakage Prevention):** Target label, `rule_baseline_label`, `company_profile_id`, `scenario_id`, `ml_split`, Q12 detail preference, marketing budget, generated messages, and campaign outcomes.

---

## Architecture Summary
```
[Audience Text] ----> TF-IDF (600 features) ----> Linear(256) -> BatchNorm -> ReLU -> Dropout(0.25) -> Linear(128) -> ReLU --+
                                                                                                                               |
[Categorical (OHE) + Numeric (Scaled)] ---------> Linear(64)  -> BatchNorm -> ReLU -> Dropout(0.15) -> Linear(32)  -> ReLU --+
                                                                                                                               |
                                                                                                             Concat (128 + 32)
                                                                                                                       |
                                                                                                           Linear(64) -> ReLU -> Dropout(0.2)
                                                                                                                       |
                                                                                                           Linear(3) -> Softmax (Low/Med/High)
```

---

## Training Data & Group-Aware Split
- **Dataset:** `Sri_Lanka_Marketing_Research_5000` (100% Synthetic scenarios; 1,000 fictional companies, 5 scenarios each).
- **Split Strategy:** Group-held-out by `company_profile_id` (zero company crossover between splits):
  - **Train:** 750 companies (3,750 records)
  - **Validation:** 150 companies (750 records)
  - **Test (Held-Out):** 100 companies (500 records)

---

## Quantitative Evaluation on Held-Out Test Set (N=500)

| Model Architecture | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rule-Based Baseline (Q10+Q11 Threshold)** | 72.80% | 73.65% | 73.18% | 73.22% | 72.84% |
| **Structured-Only Random Forest** | 73.20% | 73.08% | 73.11% | 73.03% | 73.17% |
| **Text-Only TF-IDF Logistic Regression** | 92.20% | 92.21% | 92.20% | 92.20% | 92.20% |
| **TF-IDF + Structured Logistic Regression** | 91.20% | 91.31% | 91.27% | 91.27% | 91.22% |
| **PyTorch Multimodal Fusion Net (Selected)** | **90.60%** | **91.18%** | **90.39%** | **90.69%** | **90.62%** |

### Per-Class Performance (Multimodal Fusion Model)
- **Low Literacy:** Precision: 0.8750 | Recall: 0.9225 | F1: **0.8981** (Support: 129)
- **Medium Literacy:** Precision: 0.8947 | Recall: 0.9132 | F1: **0.9039** (Support: 242)
- **High Literacy:** Precision: 0.9658 | Recall: 0.8760 | F1: **0.9187** (Support: 129)

### Confusion Matrix
```
Predicted:       Low   Medium   High
Actual Low       119     10        0
Actual Medium     17    221        4
Actual High        0     16      113
```

---

## Caveats, Limitations & Ethical Considerations
> [!WARNING]
> **Data Provenance Disclosure:** The 5,000 records are entirely synthetic simulations created for algorithmic benchmarking and prototyping. High test accuracy reflects alignment with the generator's latent distribution; it does **NOT** prove real-world accuracy among Sri Lankan tech buyers.
> 
> Real-world deployment requires prospective, consented field data collection with independent expert annotations. The application UI must display **"Not yet empirically validated"** on live predictions until such field data is collected.
