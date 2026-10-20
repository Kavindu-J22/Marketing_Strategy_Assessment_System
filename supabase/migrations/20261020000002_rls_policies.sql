-- ==============================================================================
-- Migration: 20261020000002_rls_policies.sql
-- Project: Marketing Strategy Assessment System
-- Description: Strict Row-Level Security (RLS) Policies and Tenant Isolation
-- ==============================================================================

-- Enable RLS on all tenant data tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_audience_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usability_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Catalog tables have public read access for authenticated users
ALTER TABLE public.channel_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ahp_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ahp_weight_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Helper Functions for RLS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = p_org_id
          AND user_id = auth.uid()
          AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_system_researcher_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND system_role IN ('admin', 'researcher')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- Profiles Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid() OR public.is_system_researcher_or_admin());

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- Organization Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Org members can view their organization"
    ON public.organizations FOR SELECT
    USING (public.is_org_member(id) OR public.is_system_researcher_or_admin());

CREATE POLICY "Org admins can update their organization"
    ON public.organizations FOR UPDATE
    USING (public.is_org_admin(id));

CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- -----------------------------------------------------------------------------
-- Organization Members Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Members can view other members in same org"
    ON public.organization_members FOR SELECT
    USING (public.is_org_member(organization_id) OR public.is_system_researcher_or_admin());

CREATE POLICY "Org admins can manage membership"
    ON public.organization_members FOR ALL
    USING (public.is_org_admin(organization_id));

-- -----------------------------------------------------------------------------
-- Products Policies (FR1)
-- -----------------------------------------------------------------------------
CREATE POLICY "Org members can view products"
    ON public.products FOR SELECT
    USING (public.is_org_member(organization_id) OR public.is_system_researcher_or_admin());

CREATE POLICY "Org members can create products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "Org members can update their products"
    ON public.products FOR UPDATE
    USING (public.is_org_member(organization_id));

CREATE POLICY "Org admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_org_admin(organization_id));

-- -----------------------------------------------------------------------------
-- Target Audience Profiles (FR2)
-- -----------------------------------------------------------------------------
CREATE POLICY "Org members can view target audience profiles"
    ON public.target_audience_profiles FOR SELECT
    USING (public.is_org_member(organization_id) OR public.is_system_researcher_or_admin());

CREATE POLICY "Org members can create/edit audience profiles"
    ON public.target_audience_profiles FOR ALL
    USING (public.is_org_member(organization_id));

-- -----------------------------------------------------------------------------
-- Campaigns & Questionnaire Responses (FR1, FR2)
-- -----------------------------------------------------------------------------
CREATE POLICY "Org members can view campaigns"
    ON public.campaigns FOR SELECT
    USING (public.is_org_member(organization_id) OR public.is_system_researcher_or_admin());

CREATE POLICY "Org members can manage campaigns"
    ON public.campaigns FOR ALL
    USING (public.is_org_member(organization_id));

CREATE POLICY "Org members can view questionnaire responses"
    ON public.questionnaire_responses FOR SELECT
    USING (public.is_org_member(organization_id) OR public.is_system_researcher_or_admin());

CREATE POLICY "Org members can insert/update questionnaire responses"
    ON public.questionnaire_responses FOR ALL
    USING (public.is_org_member(organization_id));

-- -----------------------------------------------------------------------------
-- Analysis Runs, Predictions, Messages, Rankings, Budget (FR3 - FR7)
-- -----------------------------------------------------------------------------
CREATE POLICY "Org members can view their analysis runs"
    ON public.analysis_runs FOR SELECT
    USING (public.is_org_member(organization_id) OR public.is_system_researcher_or_admin());

CREATE POLICY "Org members can create analysis runs"
    ON public.analysis_runs FOR INSERT
    WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "Org members can view audience predictions"
    ON public.audience_predictions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.analysis_runs r
        WHERE r.id = audience_predictions.run_id
          AND (public.is_org_member(r.organization_id) OR public.is_system_researcher_or_admin())
    ));

CREATE POLICY "Org members can view generated messages"
    ON public.generated_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.analysis_runs r
        WHERE r.id = generated_messages.run_id
          AND (public.is_org_member(r.organization_id) OR public.is_system_researcher_or_admin())
    ));

CREATE POLICY "Org members can edit/approve generated messages"
    ON public.generated_messages FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.analysis_runs r
        WHERE r.id = generated_messages.run_id
          AND public.is_org_member(r.organization_id)
    ));

CREATE POLICY "Org members can view channel rankings"
    ON public.channel_rankings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.analysis_runs r
        WHERE r.id = channel_rankings.run_id
          AND (public.is_org_member(r.organization_id) OR public.is_system_researcher_or_admin())
    ));

CREATE POLICY "Org members can view budget allocations"
    ON public.budget_allocations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.analysis_runs r
        WHERE r.id = budget_allocations.run_id
          AND (public.is_org_member(r.organization_id) OR public.is_system_researcher_or_admin())
    ));

-- -----------------------------------------------------------------------------
-- Catalog & Reference Data (Read-only for all authenticated users)
-- -----------------------------------------------------------------------------
CREATE POLICY "Public read for channel catalog"
    ON public.channel_catalog FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public read for AHP criteria"
    ON public.ahp_criteria FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public read for AHP weight versions"
    ON public.ahp_weight_versions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public read for market sources"
    ON public.market_sources FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public read for datasets"
    ON public.datasets FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public read for model versions"
    ON public.model_versions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public read for evaluation results"
    ON public.evaluation_results FOR SELECT
    TO authenticated
    USING (true);

-- -----------------------------------------------------------------------------
-- Usability Responses & Expert Reviews (SUS & Evaluation)
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can submit usability responses"
    ON public.usability_responses FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Researchers and admins can view usability responses"
    ON public.usability_responses FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_system_researcher_or_admin());

CREATE POLICY "Qualified experts can submit reviews"
    ON public.expert_reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = expert_user_id);

CREATE POLICY "Users can view expert reviews on their runs"
    ON public.expert_reviews FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.analysis_runs r
        WHERE r.id = expert_reviews.run_id
          AND (public.is_org_member(r.organization_id) OR public.is_system_researcher_or_admin())
    ));
