"""
Unified Database and Persistence Layer
Supports Supabase PostgREST client and in-memory transactional repository.
"""
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime, timezone
from app.core.config import settings
from app.core.logging import logger

# In-memory persistent datastore for local dev/testing
_DATA_STORE: Dict[str, Dict[str, Any]] = {
    "organizations": {
        "org-ceylontech-001": {
            "id": "org-ceylontech-001",
            "name": "CeylonTech Solutions (Pvt) Ltd",
            "industry": "Software / SaaS",
            "company_size": "Small company",
            "website": "https://ceylontech.lk",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    },
    "organization_members": {
        "mem-001": {
            "id": "mem-001",
            "organization_id": "org-ceylontech-001",
            "user_id": "dev-user-001",
            "role": "admin"
        }
    },
    "products": {
        "prod-001": {
            "id": "prod-001",
            "organization_id": "org-ceylontech-001",
            "name": "Nivora StockSync Cloud",
            "description": "Multi-outlet cloud inventory management and automated stock forecasting suite for Sri Lankan retail and wholesale merchants.",
            "industry": "Software / SaaS",
            "features": [
                "Real-time barcode inventory scanning",
                "Automated purchase order reordering",
                "Multi-branch stock transfer ledger",
                "Sinhala and English receipt printing",
                "Offline sync with cloud reconciliation"
            ],
            "problem_solved": "Manual inventory ledger errors and stockouts across retail branch outlets in Sri Lanka.",
            "target_customer_summary": "Retail shop owners, supermarket managers, and wholesale distributors.",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    },
    "campaigns": {
        "camp-001": {
            "id": "camp-001",
            "organization_id": "org-ceylontech-001",
            "product_id": "prod-001",
            "title": "Q4 Commercial Launch - Western & Central Province Retailers",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    },
    "questionnaire_responses": {},
    "analysis_runs": {},
    "audience_predictions": {},
    "generated_messages": {},
    "channel_rankings": {},
    "budget_allocations": {},
    "expert_reviews": {},
    "usability_responses": {},
    "ahp_weight_versions": {
        "v1-synthetic-assumed": {
            "id": "v1-synthetic-assumed",
            "version_name": "Synthetic Dataset Heuristic (ASSUMED)",
            "weights": {
                "audience_fit": 0.34,
                "objective_fit": 0.25,
                "cost_suitability": 0.18,
                "reach_fit": 0.13,
                "content_fit": 0.10
            },
            "expert_count": 0,
            "is_active": True,
            "is_assumed_synthetic": True,
            "consistency_ratio": 0.042,
            "notes": "Assumed synthetic weights from proposal dataset simulation. NOT expert elicited."
        }
    },
    "market_sources": {
        "src_datareportal_2026": {
            "id": "src_datareportal_2026",
            "title": "Digital 2026: Sri Lanka",
            "publisher": "DataReportal / Kepios",
            "canonical_url": "https://datareportal.com/reports/digital-2026-sri-lanka",
            "publication_date": "2026-02-01",
            "accessed_date": "2026-10-20",
            "geographic_scope": "Sri Lanka National",
            "trust_tier": "Tier 1 - Public Industry Benchmark",
            "key_findings": [
                "74.5% internet penetration in Sri Lanka",
                "Facebook remains dominant social network for SME business discovery",
                "Mobile-first browsing accounts for >80% of web traffic"
            ]
        },
        "src_icta_strategy_2030": {
            "id": "src_icta_strategy_2030",
            "title": "National Digital Strategy 2030",
            "publisher": "Information and Communication Technology Agency (ICTA) Sri Lanka",
            "canonical_url": "https://www.icta.lk/icta-assets/uploads/2023/05/Annex-1-National-Digital-Strategy-2030.pdf",
            "publication_date": "2023-05-15",
            "accessed_date": "2026-10-20",
            "geographic_scope": "Sri Lanka National",
            "trust_tier": "Tier 1 - Government Policy Document",
            "key_findings": [
                "Focus on SME digitalization, digital literacy uplift, and technology export enablement",
                "National goal of reaching $5B ICT/BPM digital economy"
            ]
        },
        "src_edb_export_2025": {
            "id": "src_edb_export_2025",
            "title": "Sri Lanka Export Performance & ICT Overview 2025",
            "publisher": "Sri Lanka Export Development Board (EDB)",
            "canonical_url": "https://www.srilankabusiness.com/news/sri-lankas-export-performance-exceeded-us-17.2-billion-in-2025.html",
            "publication_date": "2026-01-15",
            "accessed_date": "2026-10-20",
            "geographic_scope": "Sri Lanka National & Global",
            "trust_tier": "Tier 1 - Government Trade Authority",
            "key_findings": [
                "ICT/BPM sector is a premier foreign exchange earner",
                "Over 500 tech startups and scale-ups targeting regional and domestic markets"
            ]
        }
    },
    "channel_catalog": {
        "Facebook": {
            "id": "Facebook",
            "name": "Facebook",
            "category": "Social Media",
            "description": "Widespread reach across demographics in Sri Lanka; effective for broad consumer awareness and local business discovery.",
            "sri_lanka_reach_rate": 0.87,
            "relative_cost_index": 0.78,
            "best_content_types": ["Short videos", "Images/graphics", "Customer testimonials"],
            "min_viable_monthly_budget_lkr": 5000
        },
        "Instagram": {
            "id": "Instagram",
            "name": "Instagram",
            "category": "Social Media",
            "description": "High engagement among younger cohorts (18-34) and visual lifestyle brands, retail, and design.",
            "sri_lanka_reach_rate": 0.77,
            "relative_cost_index": 0.82,
            "best_content_types": ["Short videos", "Images/graphics", "Product demonstrations"],
            "min_viable_monthly_budget_lkr": 5000
        },
        "LinkedIn": {
            "id": "LinkedIn",
            "name": "LinkedIn",
            "category": "Professional Network",
            "description": "Premier B2B channel for Sri Lankan tech companies, IT decision-makers, managers, and enterprise buyers.",
            "sri_lanka_reach_rate": 0.63,
            "relative_cost_index": 0.62,
            "best_content_types": ["Articles/blogs", "Case studies", "Educational videos"],
            "min_viable_monthly_budget_lkr": 10000
        },
        "TikTok": {
            "id": "TikTok",
            "name": "TikTok",
            "category": "Video Platform",
            "description": "Fast-growing short-form video platform; high virality for Gen Z and young consumer segments.",
            "sri_lanka_reach_rate": 0.78,
            "relative_cost_index": 0.82,
            "best_content_types": ["Short videos", "Educational videos"],
            "min_viable_monthly_budget_lkr": 5000
        },
        "YouTube": {
            "id": "YouTube",
            "name": "YouTube",
            "category": "Video Search",
            "description": "High credibility and deep engagement for in-depth software tutorials, demos, and thought leadership.",
            "sri_lanka_reach_rate": 0.82,
            "relative_cost_index": 0.60,
            "best_content_types": ["Educational videos", "Product demonstrations", "Case studies"],
            "min_viable_monthly_budget_lkr": 8000
        },
        "Google Ads": {
            "id": "Google Ads",
            "name": "Google Ads",
            "category": "Search & Intent",
            "description": "Direct capture of high-intent search queries for software solutions and commercial needs.",
            "sri_lanka_reach_rate": 0.88,
            "relative_cost_index": 0.58,
            "best_content_types": ["Text search ads", "Display banners", "Landing pages"],
            "min_viable_monthly_budget_lkr": 10000
        },
        "Email Marketing": {
            "id": "Email Marketing",
            "name": "Email Marketing",
            "category": "Direct Communication",
            "description": "High ROI retention channel for existing prospects, trials, newsletter subscribers, and enterprise leads.",
            "sri_lanka_reach_rate": 0.43,
            "relative_cost_index": 0.91,
            "best_content_types": ["Articles/blogs", "Case studies", "Product demonstrations"],
            "min_viable_monthly_budget_lkr": 3000
        },
        "Website/SEO": {
            "id": "Website/SEO",
            "name": "Website & Organic SEO",
            "category": "Owned Media",
            "description": "Long-term organic visibility, inbound lead capture, and authoritative domain presence in Sri Lanka.",
            "sri_lanka_reach_rate": 0.68,
            "relative_cost_index": 0.68,
            "best_content_types": ["Articles/blogs", "Case studies", "Product demonstrations"],
            "min_viable_monthly_budget_lkr": 10000
        }
    }
}


class Repository:
    """Thread-safe transactional repository accessor."""

    @staticmethod
    def get_table(table_name: str) -> Dict[str, Any]:
        if table_name not in _DATA_STORE:
            _DATA_STORE[table_name] = {}
        return _DATA_STORE[table_name]

    @staticmethod
    def insert(table_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
        table = Repository.get_table(table_name)
        item_id = item.get("id") or str(uuid.uuid4())
        item["id"] = item_id
        if "created_at" not in item:
            item["created_at"] = datetime.now(timezone.utc).isoformat()
        table[item_id] = item
        return item

    @staticmethod
    def get(table_name: str, item_id: str) -> Optional[Dict[str, Any]]:
        table = Repository.get_table(table_name)
        return table.get(item_id)

    @staticmethod
    def update(table_name: str, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        table = Repository.get_table(table_name)
        if item_id in table:
            table[item_id].update(updates)
            table[item_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
            return table[item_id]
        return None

    @staticmethod
    def delete(table_name: str, item_id: str) -> bool:
        table = Repository.get_table(table_name)
        if item_id in table:
            del table[item_id]
            return True
        return False

    @staticmethod
    def list(table_name: str, filter_fn=None) -> List[Dict[str, Any]]:
        table = Repository.get_table(table_name)
        items = list(table.values())
        if filter_fn:
            items = [item for item in items if filter_fn(item)]
        return items


db = Repository()
