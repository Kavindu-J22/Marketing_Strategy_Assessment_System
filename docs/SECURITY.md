# Security, Privacy & Compliance Architecture (NFR5)

**Project:** Marketing Strategy Assessment System  
**Framework Component:** Security & Tenant Isolation  
**Compliance Standard:** ISO/IEC 27001 & OWASP Top 10 Guidelines  

---

## 1. Threat Modeling & Core Defense Principles

1. **Strict Multi-Tenant Isolation:**
   - Database level: Supabase PostgreSQL Row Level Security (RLS) policies are active on every tenant data table (`products`, `campaigns`, `questionnaire_responses`, `analysis_runs`, `audience_predictions`, `generated_messages`, `budget_allocations`).
   - RLS verifies membership via `public.is_org_member(organization_id)`.
   - Backend API level: FastAPI dependencies explicitly cross-reference the user's verified token claims against the requested resource.

2. **Server-Side LLM Execution & Key Protection:**
   - The Google Gemini API key is stored exclusively in server environment variables (`GEMINI_API_KEY`) and is **never** transmitted to the browser or embedded in frontend bundles.
   - All feature-to-value generations are dispatched through the backend service with token budgets, timeouts, and rate limits.

3. **Untrusted Data Sanitization & Prompt Injection Defense:**
   - User inputs in questionnaire fields (e.g. `q1_product_name`, `q2_product_description`, `q13_main_customer_benefit`) are treated strictly as unparsed data payloads.
   - System prompts explicitly direct Gemini to reject command injections or instruction overrides embedded inside user-supplied texts.

4. **Zero Personally Identifiable Customer Data (PII):**
   - The application does not collect, store, or require individual customer identities, personal phone numbers, or credit card details.
   - Data collection is restricted to organizational operational context, customer archetypes, and marketing parameters.

5. **Monetary Precision & Integer Arithmetic:**
   - Marketing budgets and channel allocations are computed in integer Sri Lankan Rupees (LKR).
   - Zero floating-point rounding errors or currency drift are permitted.
