# Academic Research Evaluation & Usability Protocol

**Project:** Marketing Strategy Assessment System  
**Research Reference:** `J26-ISE-313 IT23221796 Proposal.pdf` (SLIIT, 2026)  
**Evaluation Lead:** Principal Research Engineer  

---

## 1. Multi-Module Evaluation Strategy

In accordance with Section 3.3, 3.4, and Table 2.1 (pp. 19–21) of the research proposal, every component in the decision-support system is benchmarked against established baselines:

```
+------------------------------------+---------------------------------------+---------------------------------------+
| System Component                   | Proposed Approach                     | Baseline / Benchmark                  |
+------------------------------------+---------------------------------------+---------------------------------------+
| 1. Audience Technical Literacy     | PyTorch Multimodal Fusion Network     | Rule-Based Heuristic (Q10+Q11)        |
|                                    | (Text TF-IDF + OneHot Cat + Scaled)   | Classical ML (TF-IDF + Logistic Reg)  |
|                                    |                                       | Text-Only & Structured-Only Ablations |
+------------------------------------+---------------------------------------+---------------------------------------+
| 2. Feature-to-Value Translation    | Google Gemini Structured Generation   | Manually Developed Baseline Messages  |
|                                    | (JSON Schema + Safety Guardrails)     | Blinded 5-Dimension Expert Rubric     |
+------------------------------------+---------------------------------------+---------------------------------------+
| 3. Channel Recommendation          | Multi-Criteria AHP Ranking            | Rule-Based Channel Filter Baseline    |
|                                    | (Saaty Eigenvector & CR Validation)   | Assumed Heuristics vs Expert Weights  |
+------------------------------------+---------------------------------------+---------------------------------------+
| 4. Budget Allocation               | Constraint-Aware Optimization         | Equal-Split Baseline Benchmark        |
|                                    | (Proxy Utility & Integer LKR Sum)     | Expert-Recommended Allocation         |
+------------------------------------+---------------------------------------+---------------------------------------+
| 5. Overall System Usability        | Integrated Research Dashboard & Flow  | System Usability Scale (SUS) >= 70    |
+------------------------------------+---------------------------------------+---------------------------------------+
```

---

## 2. Audience Classifier Benchmark Results (Held-Out Test Set N=500)

Evaluated on 100 held-out company profiles ($5 \times 100 = 500$ records) with zero train/test contamination:

| Model Architecture | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rule-Based Baseline (Q10+Q11)** | 72.80% | 73.65% | 73.18% | 73.22% | 72.84% |
| **Structured-Only Random Forest** | 73.20% | 73.08% | 73.11% | 73.03% | 73.17% |
| **Text-Only TF-IDF Logistic Reg** | 92.20% | 92.21% | 92.20% | 92.20% | 92.20% |
| **TF-IDF + Structured Logistic Reg** | 91.20% | 91.31% | 91.27% | 91.27% | 91.22% |
| **PyTorch Multimodal Fusion (Selected)**| **90.60%** | **91.18%** | **90.39%** | **90.69%** | **90.62%** |

---

## 3. Blinded Human Expert Review Rubric (FR4)

AI-generated marketing messages are evaluated blindly against manually prepared marketing statements across five 5-point Likert criteria:
1. **Factual Faithfulness (1-5):** Does the message accurately reflect the product's actual technical capability without exaggeration?
2. **Clarity (1-5):** Is the language plain, articulate, and free of unnecessary technical obfuscation?
3. **Relevance (1-5):** Does the message address the customer's specific operational pain points?
4. **Customer Orientation (1-5):** Does the copy emphasize user benefits over dry engineering specifications?
5. **Appropriate Technical Detail (1-5):** Does the depth of technical terminology match the target audience's assessed literacy level?

---

## 4. System Usability Scale (SUS) Protocol (NFR1)

The System Usability Scale (Brooke, 1996) is administered directly in-app via `/usability/sus`.
- **Target Acceptance Benchmark:** Mean SUS score $\ge 70.0$ (above the standard average cutoff of 68.0).
- **Automated Calculation:**
  $$SUS = 2.5 \times \left[ \sum_{i \in \{1,3,5,7,9\}} (R_i - 1) + \sum_{j \in \{2,4,6,8,10\}} (5 - R_j) \right]$$
