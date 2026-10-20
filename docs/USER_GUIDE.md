# User Guide: Marketing Strategy Assessment System

**Target Audience:** Founders, Marketing Managers, Product Owners, and Academic Evaluators in Sri Lankan Technology Companies  
**System Component:** Marketing Decision-Support Platform  
**Research Context:** Proposal J26-ISE-313 | SLIIT 2026

---

## 1. Quick Start Workflow

### Step 1: Workspace Sign-In & Company Profile
1. Navigate to `http://localhost:5173`.
2. Sign in with your registered company credentials (or use the preloaded developer profile for offline testing).
3. Confirm your organization settings, sector (e.g. `Software / SaaS`), and business size.

### Step 2: Register a Product
1. Click **Products** in the sidebar navigation.
2. Click **Create New Product**.
3. Enter the product name, industry category, high-level description, main technical features (e.g., *Automated inventory alerts*, *Barcode scanning*), and the primary business problem solved.

### Step 3: Run the 5-Step Marketing Assessment Wizard
Click **New Assessment** (or navigate to `/wizard`) to begin the guided 21-question evaluation:
- **Step 1 (Product Q1–Q4):** Confirms product name, technical features, and industry category.
- **Step 2 (Audience Q5–Q9):** Defines target customer personas, market type (`B2B`, `B2C`, or `Both`), age group, roles, and target location in Sri Lanka.
- **Step 3 (Technical Literacy Q10–Q12):** Captures customer familiarity with digital tools and technical jargon. The PyTorch fusion model generates an instantaneous literacy classification (`Low`, `Medium`, or `High`).
- **Step 4 (Value & Channels Q13–Q17):** Captures the core customer benefit, pain points, current channel usage, and preferred content formats.
- **Step 5 (Budget & Goals Q18–Q21):** Enter your monthly marketing budget in Sri Lankan Rupees (LKR), expected duration, flexibility, and primary business goals.

### Step 4: Review Strategy Dashboard
Upon submission, the system generates an integrated strategy report:
1. **Audience Card:** Predicted technical literacy, confidence score, calibrated probability distribution, and explicit uncertainty caveats.
2. **Messaging Card:** Core value proposition, tailored message variations (simple, balanced, technical), short headline, social caption, and CTA.
3. **Channel Ranking Card:** Multi-criteria AHP scores for 8 Sri Lankan channels, criterion contributions, and matrix consistency verification.
4. **Budget Allocation Card:** Exact monthly and total campaign allocations in LKR, reserve allocation, proxy utility score, and comparison against an equal-split baseline.

### Step 5: Export and Scenario Comparison
- Use the **Export JSON** or **Export CSV** buttons to download your marketing strategy for offline analysis or boardroom presentation.
- Run multiple scenarios with varied budget assumptions to compare channel sensitivities side by side.

---

## 2. AHP Multi-Criteria Expert Matrix (`/expert/ahp`)

### 2.1 What Does This Page Do?
The **Analytic Hierarchy Process (AHP)** page allows marketing directors, business consultants, and founders to customize the relative importance of strategic decision criteria when ranking Sri Lankan marketing channels (Facebook, Instagram, LinkedIn, TikTok, YouTube, Google Ads, Email Marketing, Website/SEO).

Instead of relying on arbitrary subjective guesses, AHP (developed by Thomas Saaty in 1980) converts pairwise comparisons between criteria into mathematically rigorous priority weights ($w_i$) that sum to 100%.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AHP DECISION HIERARCHY                          │
├────────────────────────────────────────────────────────────────────────┤
│  GOAL: Optimal Marketing Channel Prioritization for Tech Product       │
│                                                                        │
│  CRITERIA (5 Strategic Pillars):                                       │
│  [AUD] Audience Alignment    ─► Fit for customer literacy tier         │
│  [OBJ] Campaign Objective    ─► Awareness, lead-gen, or conversion     │
│  [CST] Cost Efficiency       ─► Relative CPM / CPC in LKR              │
│  [RCH] Market Reach          ─► Active user base in Sri Lanka          │
│  [FMT] Content Format Fit    ─► Compatibility with creative format     │
│                                                                        │
│  ALTERNATIVES (8 Sri Lankan Channels):                                 │
│  Facebook | Instagram | LinkedIn | TikTok | YouTube | Google Ads | ... │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 What Do the Criteria Codes Mean?

| Code | Criterion Name | Definition & Why It Matters for Sri Lankan Tech Companies |
| :---: | :--- | :--- |
| **AUD** | **Audience Alignment** | Measures how accurately the channel connects with your specific target customer persona and their technical literacy. For example, B2B software decision-makers are concentrated on LinkedIn, whereas SME retail shop owners are more reachable on Facebook. |
| **OBJ** | **Campaign Objective** | Measures how well the channel serves your current commercial objective (Brand Awareness vs Lead Generation vs Direct Product Sales vs Customer Retention). Google Ads excels at direct conversion, whereas YouTube excels at education. |
| **CST** | **Cost Efficiency** | Reflects the cost per impression/click relative to budget constraints in Sri Lankan Rupees (LKR). Evaluates whether a channel provides viable customer acquisition costs for early-stage startups with limited runway. |
| **RCH** | **Market Reach** | Reflects the active, addressable audience size and demographic penetration in Sri Lanka, based on national digital benchmark data (e.g., DataReportal 2026: 74.5% internet penetration). |
| **FMT** | **Content Format Fit** | Evaluates the channel's suitability for the creative format required to explain your product (e.g., short 15-second product demo videos vs long-form case studies vs technical documentation). |

---

### 2.3 The Saaty 1–9 Comparison Scale
When comparing Row $i$ to Column $j$, you select a rating on the fundamental Saaty scale:

| Saaty Value | Linguistic Meaning | Real-World Marketing Example |
| :---: | :--- | :--- |
| **1** | **Equal Importance** | Audience Alignment and Campaign Objective are considered equally vital. |
| **2** | **Slightly More Important** | Slight preference of one criterion over another. |
| **3** | **Moderately More Important** | Experience or market reality moderately favors this criterion. |
| **5** | **Strongly More Important** | Firm evidence indicates one criterion dominates (e.g., Cost matters much more than Reach for bootstrapped startups). |
| **7** | **Very Strongly More Important** | High dominance demonstrated in practice. |
| **9** | **Extremely More Important** | Highest possible order of affirmation. |
| **1/2, 1/3, 1/5, ...** | **Reciprocal Values** | If Audience is 3× more important than Cost, then Cost is automatically 1/3 as important as Audience. |

---

### 2.4 Understanding the Reciprocal Matrix ($A_{ji} = 1 / A_{ij}$)
- The comparison table is a **$5 \times 5$ square matrix**.
- The main diagonal (where a criterion is compared to itself: AUD vs AUD, CST vs CST) is **always 1.00**.
- **You only need to edit the upper-right cells.** Whenever you select a value in row $i$ and column $j$, the system **automatically computes the reciprocal in row $j$ and column $i$**.
- This enforces Saaty's **Reciprocal Axiom**, ensuring mathematical symmetry.

---

### 2.5 Understanding Consistency Ratio ($CR \le 0.10$)
Human decision-makers can make contradictory judgments (for example: if you say A is better than B, and B is better than C, but then say C is better than A). AHP detects this inconsistency:

1. **Maximum Eigenvalue ($\lambda_{\max}$)**: Calculated from the matrix product $A \cdot w$. For a perfectly consistent $5 \times 5$ matrix, $\lambda_{\max} = 5.000$.
2. **Consistency Index ($CI$)**: Measures the deviation from perfect transitivity:
   $$CI = \frac{\lambda_{\max} - n}{n - 1} = \frac{\lambda_{\max} - 5}{4}$$
3. **Consistency Ratio ($CR$)**: Compares $CI$ against the expected Random Index ($RI = 1.12$ for $n=5$):
   $$CR = \frac{CI}{RI}$$

#### How to Interpret the CR Badge in the UI:
- **Green Badge: $CR \le 0.100$ (Consistent)**  
  Your pairwise judgments are mathematically harmonious. The derived criteria weights are valid and will produce reliable, defensible channel recommendations.
- **Amber/Red Badge: $CR > 0.100$ (Inconsistent)**  
  Your comparisons contain logical contradictions. Saaty's theorem advises reviewing your inputs. For example, reduce extreme ratings (such as 9s or 7s) or click one of the preset templates to re-establish consistency.

---

### 2.6 Step-by-Step: How to Use the AHP Page
1. **Choose a Decision Template** (or customize manually):
   - **Assumed Proposal Demo**: Balanced baseline hierarchy (Audience > Objective > Cost > Reach > Format).
   - **Cost-Conscious SME**: Heavily emphasizes Cost Efficiency and Campaign Objectives for bootstrapped startups.
   - **Mass Awareness**: Prioritizes Market Reach and Content Format for high-volume consumer reach.
   - **Equal Weights (20% each)**: Neutral baseline treating all 5 criteria identically.
2. **Adjust Upper-Triangular Cells**: Click any blue dropdown to adjust the pairwise weight between two criteria.
3. **Inspect the Priority Bar Chart**: The horizontal chart on the right immediately updates showing each criterion's percentage weight ($w_i$), summing to 100%.
4. **Verify Consistency**: Confirm that the CR chip at the top right displays **Consistent ($CR \le 0.10$)**.

---

## 3. System Usability Scale (SUS) Evaluation (`/usability/sus`)

### 3.1 What Does This Page Do?
The **System Usability Scale (SUS)** page allows real users—tech startup founders, product managers, marketing officers, and academic evaluators—to evaluate the usability and cognitive load of the Marketing Strategy Assessment System.

It implements the internationally recognized **10-item psychometric Likert questionnaire** created by John Brooke (1996) and standardized by Bangor et al. (2008).

---

### 3.2 Why Is This Included in Research Proposal J26-ISE-313?
In academic computer science research, decision-support tools must prove that they are not merely functional, but usable by non-technical business practitioners.
- **Non-Functional Requirement NFR1**: The system must achieve a standardized usability score of **$\text{SUS} \ge 70.0$** (representing a Grade B / "Good" rating on the industry usability curve).
- Responses submitted on this page are stored in the database (`usability_responses` table) to compile empirical evidence for the research defense and thesis evaluation.

---

### 3.3 The 10 Standardized Questions
The survey consists of 10 statements alternating between positive and negative sentiments to counteract response bias:

1. *I think that I would like to use this system frequently.* (Positive)
2. *I found the system unnecessarily complex.* (Negative)
3. *I thought the system was easy to use.* (Positive)
4. *I think that I would need the support of a technical person to be able to use this system.* (Negative)
5. *I found the various functions in this system were well integrated.* (Positive)
6. *I thought there was too much inconsistency in this system.* (Negative)
7. *I would imagine that most people would learn to use this system very quickly.* (Positive)
8. *I found the system very cumbersome to use.* (Negative)
9. *I felt very confident using the system.* (Positive)
10. *I needed to learn a lot of things before I could get going with this system.* (Negative)

---

### 3.4 How Is the SUS Score Calculated?
The raw ratings (1 = Strongly Disagree to 5 = Strongly Agree) are transformed using Brooke's standard formula:

1. **For Odd Questions ($1, 3, 5, 7, 9$ — Positive statements)**:
   $$\text{Score Contribution} = \text{Rating} - 1$$
2. **For Even Questions ($2, 4, 6, 8, 10$ — Negative statements)**:
   $$\text{Score Contribution} = 5 - \text{Rating}$$
3. **Total Composite Score**:
   $$\text{SUS Score} = 2.5 \times \sum_{i=1}^{10} \text{Score Contribution}_i$$
   This produces a normalized score ranging from **0.0 to 100.0**.

---

### 3.5 How to Interpret the SUS Score

```
 0       50        68       70        80        85       100
 ├────────┼─────────┼────────┼─────────┼─────────┼────────┤
 │   F    │    D    │   C    │    B    │    A    │   A+   │
 │  Poor  │   OK    │Average │  Target │Excellent│ Best   │
 └────────┴─────────┴────────┴─────────┴─────────┴────────┘
                             ▲
                    Proposal NFR1 Target (>= 70.0)
```

| SUS Score Range | Grade | Adjective Rating | Academic Interpretation |
| :---: | :---: | :--- | :--- |
| **85.0 – 100.0** | **A+** | Best Imaginable / Exceptional | World-class enterprise usability. User requires virtually zero onboarding. |
| **80.0 – 84.9** | **A** | Excellent | Highly intuitive interface; workflow is clear and effortless. |
| **70.0 – 79.9** | **B** | **Good (Proposal Target Met)** | **Acceptable enterprise decision support. Meets NFR1 requirement.** |
| **60.0 – 69.9** | **C** | OK / Marginal | Average usability; minor workflow friction observed. |
| **50.0 – 59.9** | **D** | Poor | Usability concerns; users require training or assistance. |
| **< 50.0** | **F** | Unacceptable | Severe cognitive friction; interface redesign required. |

---

### 3.6 Step-by-Step: How to Use the SUS Survey Page
1. **Enter Your Role**: Specify your professional background (e.g., *Marketing Manager*, *Tech Founder*, *External Evaluator*, or *Software Engineer*).
2. **Rate All 10 Questions**: Select your rating from 1 to 5 for each statement.
3. **Observe the Live Calculation**: The gauge card on the right dynamically recalculates your composite SUS score and displays whether it satisfies the **$\text{SUS} \ge 70.0$** benchmark.
4. **Add Qualitative Observations**: Optionally enter feedback regarding wizard navigation, chart readability, or channel recommendations.
5. **Click "Submit Usability Evaluation"**: Persists the evaluation to the database and logs your response into the academic research registry.
