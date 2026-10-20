export type LiteracyLevel = 'Low' | 'Medium' | 'High';
export type MarketType = 'B2B' | 'B2C' | 'Both';
export type DataProvenance = 'synthetic_demo' | 'real_collected' | 'expert_validated';

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  industry: string;
  features: string[];
  problem_solved: string;
  target_customer_summary: string;
  created_at?: string;
}

export interface QuestionnaireStep1 {
  q1_product_name: string;
  q2_product_description: string;
  q3_main_features: string[];
  q4_industry: string;
}

export interface QuestionnaireStep2 {
  q5_primary_target_customer: string;
  q6_market_type: MarketType;
  q7_target_age_group: string;
  q8_customer_occupation: string[];
  q9_target_location: string;
  q9_specific_city?: string;
}

export interface QuestionnaireStep3 {
  q10_technology_comfort: string;
  q10_score: number;
  q11_technical_terms_familiarity: string;
  q11_score: number;
  q12_message_detail_preference: string;
  q12_score: number;
}

export interface QuestionnaireStep4 {
  q13_main_customer_benefit: string;
  q14_actual_customer_pain_points: string[];
  q15_current_marketing_channels: string[];
  q16_prior_best_channels: string[];
  q17_preferred_content: string[];
}

export interface QuestionnaireStep5 {
  q18_monthly_marketing_budget_LKR: number;
  q19_budget_flexibility: string;
  q20_campaign_duration: string;
  q20_explicit_months?: number;
  q21_success_definition: string[];
  optional_kpi_target?: number;
  optional_kpi_unit?: string;
}

export interface FullQuestionnaireSubmission {
  step1: QuestionnaireStep1;
  step2: QuestionnaireStep2;
  step3: QuestionnaireStep3;
  step4: QuestionnaireStep4;
  step5: QuestionnaireStep5;
  organization_id?: string;
  product_id?: string;
  campaign_id?: string;
}

export interface AudiencePrediction {
  predicted_class: LiteracyLevel;
  probabilities: Record<string, number>;
  confidence_score: number;
  uncertainty_caveat: string;
  is_abstain_recommended: boolean;
  model_type: string;
  model_version: string;
  dataset_provenance: DataProvenance;
  is_empirically_validated: boolean;
  reason_codes: string[];
}

export interface FeatureBenefitPair {
  feature: string;
  benefit_statement: string;
  target_concern_addressed: string;
}

export interface GeneratedMessages {
  feature_to_benefit_map: FeatureBenefitPair[];
  core_value_proposition: string;
  simple_message: string;
  balanced_message: string;
  technical_message: string;
  recommended_message: string;
  short_headline: string;
  social_caption: string;
  cta: string;
  rationale: string;
  audience_fit: string;
  claim_warnings: string[];
  source_feature_ids: string[];
  generation_model: string;
  is_ai_generated: boolean;
  rubric_evaluation_status: string;
}

export interface ChannelRankItem {
  rank: number;
  channel_id: string;
  channel_name: string;
  score_0to100: number;
  criterion_contributions: Record<string, number>;
  rationale: string;
  evidence_notes: string[];
  is_recommended: boolean;
  sri_lanka_reach_rate: number;
  relative_cost_index: number;
}

export interface ChannelRankingResult {
  ranked_channels: ChannelRankItem[];
  ahp_weight_version: string;
  weights_used: Record<string, number>;
  is_assumed_synthetic_weights: boolean;
  consistency_ratio: number;
  is_matrix_consistent: boolean;
  evidence_citations: string[];
  method_disclaimer: string;
}

export interface ChannelAllocationDetail {
  channel_id: string;
  channel_name: string;
  monthly_lkr: number;
  total_campaign_lkr: number;
  percentage: number;
  floor_lkr: number;
  cap_lkr: number;
  channel_score: number;
  rationale: string;
}

export interface BudgetAllocationResult {
  monthly_budget_lkr: number;
  campaign_months: number;
  total_budget_lkr: number;
  reserve_monthly_lkr: number;
  reserve_total_lkr: number;
  allocations: ChannelAllocationDetail[];
  baseline_equal_allocations: ChannelAllocationDetail[];
  proxy_utility_score: number;
  exact_sum_verified: boolean;
  optimization_status: string;
  method_disclaimer: string;
}

export interface ComprehensiveStrategyReport {
  run_id: string;
  organization_id: string;
  product_id: string;
  campaign_id?: string;
  created_at: string;
  completed_at?: string;
  status: string;
  data_provenance: DataProvenance;
  input_summary: Record<string, any>;
  audience: AudiencePrediction;
  feature_value_messages: GeneratedMessages;
  channels: ChannelRankingResult;
  budget: BudgetAllocationResult;
  caveats: string[];
  source_citations: Array<{ id: string; title: string; note: string }>;
  evaluation_status: string;
  integration_schema_version: string;
}
