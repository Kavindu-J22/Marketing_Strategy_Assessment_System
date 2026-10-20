# Model Card Index & AI Governance

**Project:** Marketing Strategy Assessment System  
**Framework Component:** Artificial Intelligence & Machine Learning Models  

---

## 1. Registered Models in the System

### Model 1: PyTorch Multimodal Fusion Network
- **ID:** `v1.0-fusion`
- **Role:** Classifies target audience into `Low`, `Medium`, or `High` technical literacy (FR3).
- **Architecture:** NLP TF-IDF text projection + Dense Categorical One-Hot Embeddings + Normalized Numeric scores fused via multi-layer perceptron.
- **Test Performance on Held-Out Split (N=500):**
  - Accuracy: **90.60%**
  - Macro F1: **90.69%**
  - Low F1: **0.8981** | Medium F1: **0.9039** | High F1: **0.9187**
- **Full Model Card:** See [`AUDIENCE_CLASSIFIER_MODEL_CARD.md`](file:///c:/Users/DELL/Downloads/UD%20Reserch%20008%20-%202026/Marketing_Strategy_Assessment_System/ml/model_cards/AUDIENCE_CLASSIFIER_MODEL_CARD.md)

### Model 2: Classical ML TF-IDF + Logistic Regression Baseline
- **ID:** `v1.0-tfidf-lr`
- **Role:** Classical baseline comparator (Proposal Section 3.3).
- **Test Performance (N=500):** Accuracy: **91.20%**, Macro F1: **91.27%**.

### Model 3: Rule-Based Threshold Baseline
- **ID:** `v1.0-rule`
- **Role:** Heuristic baseline on sum of Q10 (comfort) and Q11 (familiarity).
- **Test Performance (N=500):** Accuracy: **72.80%**, Macro F1: **73.22%**.

### Model 4: Feature-to-Value LLM Inference Service (Google Gemini)
- **ID:** `gemini-2.5-flash` (configurable server-side)
- **Role:** Transforms engineering features into audience-appropriate customer benefit propositions (FR4).
- **Safety Guardrails:** Strict Pydantic JSON validation, zero ungrounded metric fabrication, and culturally aware Sri Lankan messaging.
- **Fallback Engine:** Deterministic rule-based template preview when external LLM credentials or quota are unavailable.

---

## 2. Ethical Constraints & Empirical Validation Status
> [!WARNING]
> All current training and evaluation benchmarks utilize synthetic research scenarios.  
> Predictions and recommendations carry the **"Not yet empirically validated"** label until prospective field trials with consented human participants are conducted.
