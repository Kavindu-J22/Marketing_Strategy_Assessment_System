# Manual Setup & Run Guide
**Marketing Strategy Assessment System (Smart Marketing System)**  
*Step-by-step instructions for running locally and setting up on another machine after cloning from GitHub.*

---

## 1. How to Manually Run This Project Right Now (Current Machine)

If you are currently on this machine, both servers are pre-installed and can be started immediately.

### Terminal 1: Start Backend (FastAPI)
```powershell
# Navigate to the workspace root
cd "C:\Users\DELL\Downloads\UD Reserch 008 - 2026\Marketing_Strategy_Assessment_System"

# Run FastAPI with uvicorn
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
*Backend URL:* `http://127.0.0.1:8000`  
*Interactive Swagger Documentation:* `http://127.0.0.1:8000/docs`  
*Health Check:* `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Start Frontend (React + Vite)
```powershell
# Navigate to the frontend directory
cd "C:\Users\DELL\Downloads\UD Reserch 008 - 2026\Marketing_Strategy_Assessment_System\frontend"

# Launch Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend URL:* `http://127.0.0.1:5173`

---

## 2. How to Setup and Run on Another Machine (After Cloning)

Follow these steps to set up the project on any fresh machine (Windows, macOS, or Linux).

### System Prerequisites
Ensure the following tools are installed on the new machine:
1. **Git**: [https://git-scm.com/](https://git-scm.com/)
2. **Python 3.10 or 3.11**: [https://www.python.org/](https://www.python.org/) (ensure `python` and `pip` are on PATH)
3. **Node.js 18+ (LTS) & npm**: [https://nodejs.org/](https://nodejs.org/)

---

### Step 1: Clone the GitHub Repository
```bash
git clone https://github.com/<your-username>/Marketing_Strategy_Assessment_System.git
cd Marketing_Strategy_Assessment_System
```

---

### Step 2: Configure Environment Variables (`.env`)
Create a `.env` file in the project root:
```bash
# On Linux/macOS:
cp .env.example .env

# On Windows PowerShell:
Copy-Item .env.example .env
```

Open `.env` and verify the Supabase credentials:
```ini
# Server Settings
PROJECT_NAME="Marketing Strategy Assessment System"
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
API_V1_PREFIX=/api/v1

# Supabase Production / Project Credentials
SUPABASE_URL=https://ktrjnvsmkumpdxddyxuf.supabase.co
SUPABASE_ANON_KEY=sb_publishable_ZPgMlUks45YBHdD_H294lQ_cJl15hUZ
NEXT_PUBLIC_SUPABASE_URL=https://ktrjnvsmkumpdxddyxuf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZPgMlUks45YBHdD_H294lQ_cJl15hUZ

# Frontend Vite Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://ktrjnvsmkumpdxddyxuf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZPgMlUks45YBHdD_H294lQ_cJl15hUZ

# Optional Google Gemini Key (Leave blank to use deterministic template fallback)
GEMINI_API_KEY=

# Model Artifacts & Dataset Paths
MODEL_ARTIFACT_DIR=ml/artifacts
ML_DEVICE=cpu
RANDOM_SEED=20261020
DATASET_PATH=Dataset/Marketing_Questionnaire_Synthetic_5000.csv
ML_DATASET_PATH=Dataset/Audience_Classifier_ML_5000.csv
BUDGET_DATASET_PATH=Dataset/Marketing_Channel_Budget_5000.csv
```

Also create `frontend/.env`:
```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://ktrjnvsmkumpdxddyxuf.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZPgMlUks45YBHdD_H294lQ_cJl15hUZ
NEXT_PUBLIC_SUPABASE_URL=https://ktrjnvsmkumpdxddyxuf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ZPgMlUks45YBHdD_H294lQ_cJl15hUZ
```

---

### Step 3: Setup Python Virtual Environment & Install Backend Dependencies

In the project root:
```bash
# 1. Create a Python virtual environment
python -m venv .venv

# 2. Activate virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Windows Command Prompt:
.venv\Scripts\activate.bat
# On macOS / Linux:
source .venv/bin/activate

# 3. Upgrade pip and install all backend dependencies
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

---

### Step 4: Verify Pre-Trained Model Artifacts (Offline Ready)
The repository includes the trained PyTorch weights and preprocessors in `ml/artifacts/`:
- `ml/artifacts/fusion_model.pt` (Trained PyTorch Multimodal Neural Fusion Network)
- `ml/artifacts/fusion_preprocessor.joblib` (Fitted TF-IDF Vectorizer & MinMax Scaler)
- `ml/artifacts/tfidf_logistic_regression.joblib` (Trained Logistic Regression model)

If you ever wish to retrain the models from scratch using the 5,000 synthetic dataset records:
```bash
# Retrain baselines (Rule, Random Forest, Logistic Regression)
python ml/training/train_baselines.py

# Retrain Multimodal Neural Fusion Network (20 epochs)
python ml/training/train_fusion.py
```

---

### Step 5: Supabase Database Migration & Seeding (Cloud)
To apply the 23-table schema, RLS security policies, and seed data to your Supabase project:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and navigate to your project (`ktrjnvsmkumpdxddyxuf`).
2. Go to the **SQL Editor** tab.
3. Open and run the following migration files in order:
   - `supabase/migrations/20261020000001_initial_schema.sql` (Creates all tables, enums, indexes)
   - `supabase/migrations/20261020000002_rls_policies.sql` (Enables multi-tenant Row Level Security)
   - `supabase/seed/seed.sql` (Seeds 8 Sri Lankan channels, AHP criteria, and default profiles)

*(Note: If you run offline without Supabase connected, the backend automatically uses its built-in in-memory transactional repository, so the application runs completely standalone).*

---

### Step 6: Setup Frontend Dependencies
In a second terminal:
```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies (use --legacy-peer-deps to avoid React 19 peer conflicts)
npm install --legacy-peer-deps
```

---

### Step 7: Launch Both Services

**Terminal 1 (Backend):**
```bash
# From workspace root with virtual environment activated:
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
# From frontend folder:
npm run dev -- --host 127.0.0.1 --port 5173
```

Now open **`http://127.0.0.1:5173`** in your browser!

---

## 3. How to Validate the Entire Application (Test Suite)

Run these 3 validation commands to guarantee everything is operating with 100% correctness:

### 1. Run Backend Unit Tests (12/12)
```bash
pytest backend/tests/unit -v
```
*Expected Output:*
```
12 passed in 14.05s (100% PASS)
- test_ahp_n1_special_case: PASSED
- test_ahp_n2_special_case: PASSED
- test_ahp_consistent_3x3_matrix: PASSED
- test_ahp_inconsistent_matrix_flags_cr: PASSED
- test_ahp_expert_aggregation: PASSED
- test_zero_budget_allocation: PASSED
- test_exact_sum_guarantee_with_reserve: PASSED
- test_equal_split_baseline_sums_exactly: PASSED
- test_custom_bounds_enforced: PASSED
- test_rule_baseline_thresholds: PASSED
- test_classifier_service_fusion_or_fallback: PASSED
- test_full_pipeline_orchestration_run: PASSED
```

### 2. Run Live API End-to-End Test
Ensure the backend server is running, then run:
```bash
python backend/tests/test_live_server.py
```
*Expected Output:*
```
[PASS] Health endpoint: healthy
[PASS] Channels catalog: 8 channels loaded
[PASS] FR3 Audience Predicted: Low (Confidence: 0.75, Model: Rule Baseline Fallback)
[PASS] FR4 Messages: Headline: 'Smarter Operations...', Recommended: 'Apex Cloud ERP takes...'
[PASS] FR5 AHP Channels: CR = 0.0420 (Is Consistent: True), Top channel: Facebook
[PASS] FR6 Budget Exact Sum: Channels (237,500 LKR) + Reserve (12,500 LKR) == 250,000 LKR (Target: 250,000 LKR)
[PASS] Truth Caveats: Synthetic research models and unvalidated status confirmed.
========================================================
 ALL 6 END-TO-END PIPELINE CRITERIA VERIFIED (100% PASS)
========================================================
```

### 3. Verify Frontend Production Bundle Build
```bash
cd frontend
npm run build
```
*Expected Output:*
```
✓ 3509 modules transformed.
dist/index.html
dist/assets/index-BLIjxaRm.css
dist/assets/index-C3yhgMOk.js
✓ built in 4.85s (0 errors)
```

---

## 4. Alternative: Running with Docker Compose

If you have Docker installed, you can launch the entire stack with a single command:
```bash
docker-compose up --build
```
- Frontend will be available at `http://localhost:5173`
- Backend will be available at `http://localhost:8000`

---

## 5. Troubleshooting & FAQs

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `npm install` peer dependency error | React 19 vs older plugin peer requirements | Run `npm install --legacy-peer-deps` |
| `Address already in use: 8000` | Port 8000 is occupied by another process | Stop the process or run `uvicorn app.main:app --port 8001` and update `VITE_API_BASE_URL` |
| `GEMINI_API_KEY not provided` | Google Gemini key is blank | Expected behavior. The system automatically engages the deterministic template engine fallback with zero downtime. |
| `Script execution is disabled on this system` (PowerShell) | Windows ExecutionPolicy restriction | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` before activating `.venv` |
