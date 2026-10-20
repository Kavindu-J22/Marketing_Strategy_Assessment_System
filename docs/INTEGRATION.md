# Cross-Component Integration Guide

**Parent System:** A Product and Service Management Consulting Framework for Sri Lankan Tech Companies  
**Integrated Component:** Marketing Strategy Assessment System (Smart Marketing System)  
**Interface Contract Version:** v1.0-SL-2026  

---

## 1. Overview of Framework Interoperability

The *Product and Service Management Consulting Framework* comprises multiple specialized research components (e.g., product readiness assessment, technical debt analysis, competitive positioning, and financial modeling).

The **Marketing Strategy Assessment** component exposes standardized, secure integration contracts allowing partner modules to query strategic marketing decisions without credential duplication or data leakage.

---

## 2. Standardized Integration Endpoints

### 2.1 Strategic Marketing Summary Contract
- **Endpoint:** `GET /api/v1/integrations/summary`
- **Headers:** `Authorization: Bearer <service_jwt_or_user_jwt>`
- **Query Parameters:**
  - `product_id` (UUID or String, required)
  - `organization_id` (UUID or String, optional, defaults to caller's tenant)
- **Response Schema:**
  ```json
  {
    "status": "ready",
    "integration_schema_version": "v1.0-SL-2026",
    "organization_id": "org-ceylontech-001",
    "product_id": "prod-001",
    "product_name": "Nivora StockSync Cloud",
    "latest_run_id": "run-4a92c817e012",
    "assessed_at": "2026-10-20T18:00:00Z",
    "target_audience_literacy": "Medium",
    "core_value_proposition": "Nivora StockSync Cloud helps retail merchants avoid stockouts through automated cloud inventory forecasting.",
    "recommended_channels": [
      "Facebook",
      "Google Ads",
      "Website/SEO"
    ],
    "monthly_budget_allocation_lkr": {
      "Facebook": 35000,
      "Google Ads": 25000,
      "Website/SEO": 15000
    },
    "consulting_framework_contract": "Verified"
  }
  ```

---

## 3. Asynchronous Analysis Trigger
Partner systems can initiate strategy analyses programmatically:
- **Endpoint:** `POST /api/v1/analysis/run`
- **Response:** Returns durable `run_id` immediately with execution payload.
- **Status Check:** `GET /api/v1/analysis/{run_id}/status`
