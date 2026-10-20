# User Guide: Marketing Strategy Assessment System

**Target Audience:** Founders, Marketing Managers, and Consultants in Sri Lankan Technology Companies  
**System Component:** Marketing Decision-Support Platform  

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
Click **New Assessment** to begin the guided 21-question evaluation:
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
