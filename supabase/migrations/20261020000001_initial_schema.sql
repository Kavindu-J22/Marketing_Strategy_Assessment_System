-- ==============================================================================
-- Migration: 20261020000001_initial_schema.sql
-- Project: Marketing Strategy Assessment System
-- Description: Core Schema for Consulting Framework - Marketing Strategy Assessment
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE user_role_enum AS ENUM ('admin', 'researcher', 'expert', 'member');
CREATE TYPE data_provenance_enum AS ENUM ('synthetic_demo', 'real_collected', 'expert_validated');
CREATE TYPE literacy_level_enum AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE run_status_enum AS ENUM ('queued', 'running', 'completed', 'partial', 'failed');
CREATE TYPE market_type_enum AS ENUM ('B2B', 'B2C', 'Both');

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    system_role user_role_enum NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL DEFAULT 'Software / SaaS',
    company_size TEXT NOT NULL DEFAULT 'Small company',
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. ORGANIZATION MEMBERS
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- 4. PRODUCTS (FR1)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    industry TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb, -- list of strings
    problem_solved TEXT NOT NULL,
    target_customer_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. TARGET AUDIENCE PROFILES (FR2)
CREATE TABLE IF NOT EXISTS public.target_audience_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_role TEXT NOT NULL,
    market_type market_type_enum NOT NULL DEFAULT 'B2B',
    age_group TEXT NOT NULL,
    location TEXT NOT NULL,
    location_specific TEXT,
    technology_comfort_1to5 INTEGER NOT NULL CHECK (technology_comfort_1to5 BETWEEN 1 AND 5),
    technical_terms_familiarity_1to5 INTEGER NOT NULL CHECK (technical_terms_familiarity_1to5 BETWEEN 1 AND 5),
    detail_preference_1to5 INTEGER NOT NULL CHECK (detail_preference_1to5 BETWEEN 1 AND 5),
    audience_behavior_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. QUESTIONNAIRE RESPONSES (Preserving Q1-Q21)
CREATE TABLE IF NOT EXISTS public.questionnaire_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    schema_version TEXT NOT NULL DEFAULT 'v1.0-SL-2026',
    status TEXT NOT NULL DEFAULT 'completed', -- 'draft', 'completed'
    answers JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. CHANNEL CATALOG & CRITERIA (FR5)
CREATE TABLE IF NOT EXISTS public.channel_catalog (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    sri_lanka_reach_rate NUMERIC(5,4) NOT NULL,
    relative_cost_index NUMERIC(5,4) NOT NULL,
    best_content_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_viable_monthly_budget_lkr INTEGER NOT NULL DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ahp_criteria (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    default_weight NUMERIC(5,4) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.ahp_weight_versions (
    id VARCHAR(50) PRIMARY KEY,
    version_name TEXT NOT NULL,
    weights JSONB NOT NULL, -- {"audience_fit": 0.34, ...}
    expert_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT false,
    is_assumed_synthetic BOOLEAN NOT NULL DEFAULT true,
    consistency_ratio NUMERIC(6,4),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ahp_pairwise_judgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expert_user_id UUID REFERENCES public.profiles(id),
    criteria_matrix JSONB NOT NULL,
    lambda_max NUMERIC(8,4) NOT NULL,
    consistency_index NUMERIC(8,4) NOT NULL,
    consistency_ratio NUMERIC(8,4) NOT NULL,
    is_consistent BOOLEAN NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9. ANALYSIS RUNS (Orchestration Entity)
CREATE TABLE IF NOT EXISTS public.analysis_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    questionnaire_response_id UUID REFERENCES public.questionnaire_responses(id) ON DELETE SET NULL,
    status run_status_enum NOT NULL DEFAULT 'queued',
    data_provenance data_provenance_enum NOT NULL DEFAULT 'synthetic_demo',
    model_version TEXT NOT NULL,
    ahp_weight_version TEXT NOT NULL,
    input_summary JSONB NOT NULL,
    raw_results JSONB,
    error_message TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 10. AUDIENCE PREDICTIONS (FR3)
CREATE TABLE IF NOT EXISTS public.audience_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
    predicted_class literacy_level_enum NOT NULL,
    probabilities JSONB NOT NULL, -- {"Low": 0.12, "Medium": 0.74, "High": 0.14}
    confidence_score NUMERIC(5,4) NOT NULL,
    is_calibrated BOOLEAN NOT NULL DEFAULT true,
    uncertainty_caveat TEXT NOT NULL,
    model_type TEXT NOT NULL,
    model_version TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 11. GENERATED MESSAGES (FR4)
CREATE TABLE IF NOT EXISTS public.generated_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
    feature_to_benefit_map JSONB NOT NULL DEFAULT '[]'::jsonb,
    core_value_proposition TEXT NOT NULL,
    simple_message TEXT NOT NULL,
    balanced_message TEXT NOT NULL,
    technical_message TEXT NOT NULL,
    recommended_message TEXT NOT NULL,
    short_headline TEXT NOT NULL,
    social_caption TEXT NOT NULL,
    cta TEXT NOT NULL,
    rationale TEXT NOT NULL,
    claim_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    generation_model TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    edited_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 12. CHANNEL RANKINGS (FR5)
CREATE TABLE IF NOT EXISTS public.channel_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    channel_id VARCHAR(50) NOT NULL REFERENCES public.channel_catalog(id),
    channel_name TEXT NOT NULL,
    score_0to100 NUMERIC(6,2) NOT NULL,
    criterion_contributions JSONB NOT NULL,
    rationale TEXT NOT NULL,
    evidence_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 13. BUDGET ALLOCATIONS (FR6)
CREATE TABLE IF NOT EXISTS public.budget_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
    monthly_budget_lkr INTEGER NOT NULL CHECK (monthly_budget_lkr >= 0),
    campaign_months INTEGER NOT NULL CHECK (campaign_months >= 1),
    total_budget_lkr INTEGER NOT NULL CHECK (total_budget_lkr >= 0),
    reserve_lkr INTEGER NOT NULL DEFAULT 0 CHECK (reserve_lkr >= 0),
    allocations JSONB NOT NULL, -- [{"channel": "Facebook", "monthly_lkr": 40000, "total_lkr": 120000, "percentage": 50.0}]
    baseline_equal_allocations JSONB NOT NULL,
    proxy_utility_score NUMERIC(8,4) NOT NULL,
    optimization_status TEXT NOT NULL DEFAULT 'optimal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 14. MARKET SOURCES & EVIDENCE REGISTRY
CREATE TABLE IF NOT EXISTS public.market_sources (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    canonical_url TEXT NOT NULL,
    publication_date DATE NOT NULL,
    accessed_date DATE NOT NULL,
    geographic_scope TEXT NOT NULL,
    trust_tier TEXT NOT NULL,
    key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 15. EXPERT REVIEWS & EVALUATION
CREATE TABLE IF NOT EXISTS public.expert_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.analysis_runs(id) ON DELETE CASCADE,
    expert_user_id UUID REFERENCES public.profiles(id),
    clarity_1to5 INTEGER CHECK (clarity_1to5 BETWEEN 1 AND 5),
    relevance_1to5 INTEGER CHECK (relevance_1to5 BETWEEN 1 AND 5),
    accuracy_1to5 INTEGER CHECK (accuracy_1to5 BETWEEN 1 AND 5),
    customer_orientation_1to5 INTEGER CHECK (customer_orientation_1to5 BETWEEN 1 AND 5),
    detail_level_1to5 INTEGER CHECK (detail_level_1to5 BETWEEN 1 AND 5),
    channel_agreement_1to5 INTEGER CHECK (channel_agreement_1to5 BETWEEN 1 AND 5),
    budget_agreement_1to5 INTEGER CHECK (budget_agreement_1to5 BETWEEN 1 AND 5),
    qualitative_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 16. USABILITY RESPONSES (NFR1 / SUS)
CREATE TABLE IF NOT EXISTS public.usability_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    organization_id UUID REFERENCES public.organizations(id),
    q1_freq INTEGER NOT NULL CHECK (q1_freq BETWEEN 1 AND 5),
    q2_complex INTEGER NOT NULL CHECK (q2_complex BETWEEN 1 AND 5),
    q3_easy INTEGER NOT NULL CHECK (q3_easy BETWEEN 1 AND 5),
    q4_tech_support INTEGER NOT NULL CHECK (q4_tech_support BETWEEN 1 AND 5),
    q5_integrated INTEGER NOT NULL CHECK (q5_integrated BETWEEN 1 AND 5),
    q6_inconsistency INTEGER NOT NULL CHECK (q6_inconsistency BETWEEN 1 AND 5),
    q7_learn_quick INTEGER NOT NULL CHECK (q7_learn_quick BETWEEN 1 AND 5),
    q8_cumbersome INTEGER NOT NULL CHECK (q8_cumbersome BETWEEN 1 AND 5),
    q9_confident INTEGER NOT NULL CHECK (q9_confident BETWEEN 1 AND 5),
    q10_learn_lot INTEGER NOT NULL CHECK (q10_learn_lot BETWEEN 1 AND 5),
    sus_score NUMERIC(5,2) NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 17. DATASETS, MODEL REGISTRY & RESEARCH EVALUATION (NFR3)
CREATE TABLE IF NOT EXISTS public.datasets (
    id VARCHAR(100) PRIMARY KEY,
    name TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    provenance_type data_provenance_enum NOT NULL,
    checksum TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.model_versions (
    id VARCHAR(100) PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_type TEXT NOT NULL,
    training_split_info JSONB NOT NULL,
    metrics JSONB NOT NULL,
    artifact_path TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.evaluation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version_id VARCHAR(100) NOT NULL REFERENCES public.model_versions(id) ON DELETE CASCADE,
    dataset_id VARCHAR(100) NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
    split TEXT NOT NULL,
    accuracy NUMERIC(6,4) NOT NULL,
    macro_f1 NUMERIC(6,4) NOT NULL,
    weighted_f1 NUMERIC(6,4) NOT NULL,
    class_metrics JSONB NOT NULL,
    confusion_matrix JSONB NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 18. AUDIT LOGS (NFR5)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON public.campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_runs_org ON public.analysis_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_runs_product ON public.analysis_runs(product_id);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON public.analysis_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_rankings_run ON public.channel_rankings(run_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_run ON public.budget_allocations(run_id);
CREATE INDEX IF NOT EXISTS idx_generated_messages_run ON public.generated_messages(run_id);
CREATE INDEX IF NOT EXISTS idx_audience_predictions_run ON public.audience_predictions(run_id);
