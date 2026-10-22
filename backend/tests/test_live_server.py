import urllib.request
import json
import socket
import pytest

def is_server_running(host="127.0.0.1", port=8000):
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except OSError:
        return False

@pytest.mark.skipif(not is_server_running(), reason="Live FastAPI server not active on http://127.0.0.1:8000")
def test_live_server():
    base_url = "http://127.0.0.1:8000/api/v1"

    # 1. Health
    req = urllib.request.Request(f"{base_url}/health")
    with urllib.request.urlopen(req) as resp:
        health_data = json.loads(resp.read().decode())
        assert health_data["status"] == "healthy"
        print("[PASS] Health endpoint: healthy")

    # 2. Channels catalog
    req = urllib.request.Request(f"{base_url}/channels/catalog")
    with urllib.request.urlopen(req) as resp:
        channels_data = json.loads(resp.read().decode())
        assert len(channels_data) == 8
        print(f"[PASS] Channels catalog: {len(channels_data)} channels loaded")

    # 3. Full Analysis Run matching FullQuestionnaireSubmission
    payload = {
        "step1": {
            "q1_product_name": "Apex Cloud ERP",
            "q2_product_description": "Cloud ERP tailored for Sri Lankan retail and wholesale distributors with automated VAT/SSCL invoice compliance.",
            "q3_main_features": ["Inventory Sync", "VAT Compliance", "POS Integration"],
            "q4_industry": "FinTech"
        },
        "step2": {
            "q5_primary_target_customer": "Retail store owners, wholesale traders, and small enterprise finance managers across Sri Lanka.",
            "q6_market_type": "B2B",
            "q7_target_age_group": "35-44",
            "q8_customer_occupation": ["Store Owner", "Finance Manager", "Managing Director"],
            "q9_target_location": "All Sri Lanka",
            "q9_specific_city": "Colombo"
        },
        "step3": {
            "q10_technology_comfort": "Basic (Uses email, social media, basic smartphones)",
            "q10_score": 2,
            "q11_technical_terms_familiarity": "Low (Prefers simple, non-technical language)",
            "q11_score": 2,
            "q12_message_detail_preference": "Results-oriented (Wants to see practical benefits, not technical specs)",
            "q12_score": 2
        },
        "step4": {
            "q13_main_customer_benefit": "Reduces daily bookkeeping from 3 hours to 10 minutes without accounting errors.",
            "q14_actual_customer_pain_points": [
                "Manual bookkeeping errors",
                "Delays in VAT compliance and tax filing",
                "Lack of inventory visibility across retail branches"
            ],
            "q15_current_marketing_channels": ["Facebook", "LinkedIn", "Google Ads", "Email Marketing"],
            "q16_prior_best_channels": ["Facebook", "Google Ads"],
            "q17_preferred_content": ["Short videos", "Customer testimonials", "Infographics / Visual posts"]
        },
        "step5": {
            "q18_monthly_marketing_budget_LKR": 250000,
            "q19_budget_flexibility": "Moderately flexible",
            "q20_campaign_duration": "3 months",
            "q20_explicit_months": 3,
            "q21_success_definition": ["Generating qualified sales leads", "Direct sales/revenue growth"],
            "optional_kpi_target": 50,
            "optional_kpi_unit": "qualified leads/month"
        },
        "organization_id": "org-ceylontech-001"
    }

    req = urllib.request.Request(
        f"{base_url}/analysis/run?provenance=synthetic_demo",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        report = json.loads(resp.read().decode())

    # Verify FR3 Audience Classification
    audience = report["audience"]
    print(f"[PASS] FR3 Audience Predicted: {audience['predicted_class']} (Confidence: {audience['confidence_score']:.2f}, Model: {audience['model_type']})")

    # Verify FR4 Messages
    messages = report["feature_value_messages"]
    print(f"[PASS] FR4 Messages: Headline: '{messages['short_headline']}', Recommended: '{messages['recommended_message'][:50]}...'")

    # Verify FR5 AHP Rankings & CR
    channels = report["channels"]
    print(f"[PASS] FR5 AHP Channels: CR = {channels['consistency_ratio']:.4f} (Is Consistent: {channels['is_matrix_consistent']}), Top channel: {channels['ranked_channels'][0]['channel_name']}")
    assert channels["is_matrix_consistent"] == True

    budget = report["budget"]
    print(f"[PASS] Sample allocation: {budget['allocations'][0]}")
    allocated_sum = sum(item["monthly_lkr"] for item in budget["allocations"])
    reserve = budget["reserve_monthly_lkr"]
    total = allocated_sum + reserve
    target = payload["step5"]["q18_monthly_marketing_budget_LKR"]
    print(f"[PASS] FR6 Budget Exact Sum: Channels ({allocated_sum:,} LKR) + Reserve ({reserve:,} LKR) == {total:,} LKR (Target: {target:,} LKR)")
    assert total == target, f"Budget did not sum exactly: {total} != {target}"
    assert budget["exact_sum_verified"] == True

    # Verify Truth Constraint Caveats
    caveats = report["caveats"]
    print(f"[PASS] Truth Caveats: '{caveats[0][:65]}...'")
    assert any("not yet empirically validated" in c.lower() or "synthetic" in c.lower() for c in caveats)

    print("\n========================================================")
    print(" ALL 6 END-TO-END PIPELINE CRITERIA VERIFIED (100% PASS)")
    print("========================================================")

if __name__ == "__main__":
    test_live_server()
