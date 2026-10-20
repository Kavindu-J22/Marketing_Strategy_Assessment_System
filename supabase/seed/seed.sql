-- ==============================================================================
-- Seed: seed.sql
-- Project: Marketing Strategy Assessment System
-- Description: Seed data for Channels, Criteria, Assumed Weights, Sources, Datasets
-- ==============================================================================

-- 1. CHANNEL CATALOG
INSERT INTO public.channel_catalog (id, name, category, description, sri_lanka_reach_rate, relative_cost_index, best_content_types, min_viable_monthly_budget_lkr)
VALUES
('Facebook', 'Facebook', 'Social Media', 'Widespread reach across demographics in Sri Lanka; effective for broad consumer awareness and local business discovery.', 0.8700, 0.7800, '["Short videos", "Images/graphics", "Customer testimonials"]'::jsonb, 5000),
('Instagram', 'Instagram', 'Social Media', 'High engagement among younger cohorts (18-34) and visual lifestyle brands, retail, and design.', 0.7700, 0.8200, '["Short videos", "Images/graphics", "Product demonstrations"]'::jsonb, 5000),
('LinkedIn', 'LinkedIn', 'Professional Network', 'Premier B2B channel for Sri Lankan tech companies, IT decision-makers, managers, and enterprise buyers.', 0.6300, 0.6200, '["Articles/blogs", "Case studies", "Educational videos"]'::jsonb, 10000),
('TikTok', 'TikTok', 'Video Platform', 'Fast-growing short-form video platform; high virality for Gen Z and young consumer segments.', 0.7800, 0.8200, '["Short videos", "Educational videos"]'::jsonb, 5000),
('YouTube', 'YouTube', 'Video Search', 'High credibility and deep engagement for in-depth software tutorials, demos, and thought leadership.', 0.8200, 0.6000, '["Educational videos", "Product demonstrations", "Case studies"]'::jsonb, 8000),
('Google Ads', 'Google Ads', 'Search & Intent', 'Direct capture of high-intent search queries for software solutions and commercial needs.', 0.8800, 0.5800, '["Text search ads", "Display banners", "Landing pages"]'::jsonb, 10000),
('Email Marketing', 'Email Marketing', 'Direct Communication', 'High ROI retention channel for existing prospects, trials, newsletter subscribers, and enterprise leads.', 0.4300, 0.9100, '["Articles/blogs", "Case studies", "Product demonstrations"]'::jsonb, 3000),
('Website/SEO', 'Website & Organic SEO', 'Owned Media', 'Long-term organic visibility, inbound lead capture, and authoritative domain presence in Sri Lanka.', 0.6800, 0.6800, '["Articles/blogs", "Case studies", "Product demonstrations"]'::jsonb, 10000)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sri_lanka_reach_rate = EXCLUDED.sri_lanka_reach_rate,
    relative_cost_index = EXCLUDED.relative_cost_index;

-- 2. AHP CRITERIA
INSERT INTO public.ahp_criteria (id, name, description, default_weight, display_order)
VALUES
('audience_fit', 'Target Audience Fit', 'Alignment with the specific target customer role, age group, technical comfort, and market type.', 0.3400, 1),
('objective_fit', 'Campaign Objective Fit', 'Suitability for the stated business goal (e.g., website visitors, leads, sales, awareness).', 0.2500, 2),
('cost_suitability', 'Cost & Budget Suitability', 'Cost-effectiveness and viability within the specified monthly marketing budget.', 0.1800, 3),
('reach_fit', 'Target Geography & Reach', 'Channel penetration across Sri Lankan provinces, urban hubs, and target demographics.', 0.1300, 4),
('content_fit', 'Content Format Match', 'Match between company preferred content formats (videos, blogs, demos) and native channel formats.', 0.1000, 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    default_weight = EXCLUDED.default_weight;

-- 3. AHP WEIGHT VERSIONS
INSERT INTO public.ahp_weight_versions (id, version_name, weights, expert_count, is_active, is_assumed_synthetic, consistency_ratio, notes)
VALUES
('v1-synthetic-assumed', 'Synthetic Dataset Heuristic (ASSUMED)', '{"audience_fit": 0.34, "objective_fit": 0.25, "cost_suitability": 0.18, "reach_fit": 0.13, "content_fit": 0.10}'::jsonb, 0, true, true, 0.0420, 'Assumed synthetic baseline weights from proposal dataset simulation. NOT expert elicited.')
ON CONFLICT (id) DO NOTHING;

-- 4. MARKET SOURCES & EVIDENCE REGISTRY
INSERT INTO public.market_sources (id, title, publisher, canonical_url, publication_date, accessed_date, geographic_scope, trust_tier, key_findings)
VALUES
('src_datareportal_2026', 'Digital 2026: Sri Lanka', 'DataReportal / Kepios', 'https://datareportal.com/reports/digital-2026-sri-lanka', '2026-02-01', '2026-10-20', 'Sri Lanka National', 'Tier 1 - Public Industry Benchmark', '["74.5% internet penetration in Sri Lanka", "Facebook remains dominant social network for SME business discovery", "Mobile-first browsing accounts for >80% of web traffic"]'::jsonb),
('src_icta_strategy_2030', 'National Digital Strategy 2030', 'Information and Communication Technology Agency (ICTA) Sri Lanka', 'https://www.icta.lk/icta-assets/uploads/2023/05/Annex-1-National-Digital-Strategy-2030.pdf', '2023-05-15', '2026-10-20', 'Sri Lanka National', 'Tier 1 - Government Policy Document', '["Focus on SME digitalization, digital literacy uplift, and technology export enablement", "National goal of reaching $5B ICT/BPM digital economy"]'::jsonb),
('src_edb_export_2025', 'Sri Lanka Export Performance & ICT Overview 2025', 'Sri Lanka Export Development Board (EDB)', 'https://www.srilankabusiness.com/news/sri-lankas-export-performance-exceeded-us-17.2-billion-in-2025.html', '2026-01-15', '2026-10-20', 'Sri Lanka National & Global', 'Tier 1 - Government Trade Authority', '["ICT/BPM sector is a premier foreign exchange earner", "Over 500 tech startups and scale-ups targeting regional and domestic markets"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. DATASETS
INSERT INTO public.datasets (id, name, record_count, provenance_type, checksum, metadata)
VALUES
('dataset-synthetic-5000', 'Sri Lanka Marketing Research Synthetic Dataset (N=5,000)', 5000, 'synthetic_demo', 'sha256:20261020-syn-5000', '{"fictional_companies": 1000, "scenarios_per_company": 5, "seed": 20261020, "is_simulated": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;
