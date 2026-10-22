import axios from 'axios';
import type {
  Product,
  FullQuestionnaireSubmission,
  AudiencePrediction,
  GeneratedMessages,
  ChannelRankingResult,
  BudgetAllocationResult,
  ComprehensiveStrategyReport,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Supabase / Auth token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase_auth_token') || 'dev-demo-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analysisApi = {
  listRuns: () => apiClient.get('/analysis/runs'),
  getReport: (runId: string) => apiClient.get(`/analysis/${runId}/report`),
  run: (submission: any) => apiClient.post('/analysis/run', submission),
};

export const researchApi = {
  getMetrics: () => apiClient.get('/research/evaluation'),
  submitSus: (payload: any) => apiClient.post('/research/sus', payload),
  getSusSummary: () => apiClient.get('/research/sus'),
};

export const api = {
  // Health & Config
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },
  getPublicConfig: async () => {
    const res = await apiClient.get('/config/public');
    return res.data;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const res = await apiClient.get('/products');
    return res.data;
  },
  getProduct: async (id: string): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (product: Omit<Product, 'id' | 'organization_id'>): Promise<Product> => {
    const res = await apiClient.post('/products', product);
    return res.data;
  },
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.put(`/products/${id}`, product);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Questionnaire
  getQuestionnaireSchema: async () => {
    const res = await apiClient.get('/questionnaire/schema');
    return res.data;
  },
  validateQuestionnaire: async (submission: FullQuestionnaireSubmission) => {
    const res = await apiClient.post('/questionnaire/validate', submission);
    return res.data;
  },
  saveDraft: async (draftData: any) => {
    const res = await apiClient.post('/questionnaire/draft', draftData);
    return res.data;
  },
  getDraft: async (draftId: string) => {
    const res = await apiClient.get(`/questionnaire/draft/${draftId}`);
    return res.data;
  },

  // ML Audience Classification (FR3)
  predictAudience: async (payload: any): Promise<AudiencePrediction> => {
    const res = await apiClient.post('/audience/predict', payload);
    return res.data;
  },

  // Gemini Feature-to-Value Messaging (FR4)
  generateMessages: async (payload: any): Promise<GeneratedMessages> => {
    const res = await apiClient.post('/messages/generate', payload);
    return res.data;
  },

  // AHP Channel Recommendation (FR5)
  rankChannels: async (payload: any): Promise<ChannelRankingResult> => {
    const res = await apiClient.post('/channels/rank', payload);
    return res.data;
  },
  getChannelCatalog: async () => {
    const res = await apiClient.get('/channels/catalog');
    return res.data;
  },
  getAhpCriteria: async () => {
    const res = await apiClient.get('/channels/criteria');
    return res.data;
  },

  // Budget Optimizer (FR6)
  allocateBudget: async (payload: any): Promise<BudgetAllocationResult> => {
    const res = await apiClient.post('/budget/allocate', payload);
    return res.data;
  },

  // Analysis Runs (FR7)
  runAnalysis: async (submission: FullQuestionnaireSubmission, provenance = 'synthetic_demo'): Promise<ComprehensiveStrategyReport> => {
    const res = await apiClient.post(`/analysis/run?provenance=${provenance}`, submission);
    return res.data;
  },
  getAnalysisRuns: async () => {
    const res = await apiClient.get('/analysis/runs');
    return res.data;
  },
  getAnalysisStatus: async (runId: string) => {
    const res = await apiClient.get(`/analysis/${runId}/status`);
    return res.data;
  },
  getAnalysisReport: async (runId: string): Promise<ComprehensiveStrategyReport> => {
    const res = await apiClient.get(`/analysis/${runId}/report`);
    return res.data;
  },

  // Research Evaluation & SUS (NFR1, NFR3)
  getEvaluationOverview: async () => {
    const res = await apiClient.get('/research/evaluation');
    return res.data;
  },
  submitSUS: async (payload: any) => {
    const res = await apiClient.post('/research/sus', payload);
    return res.data;
  },
  getSUSSummary: async () => {
    const res = await apiClient.get('/research/sus');
    return res.data;
  },
  submitExpertReview: async (payload: any) => {
    const res = await apiClient.post('/research/expert-review', payload);
    return res.data;
  },
  getMarketSources: async () => {
    const res = await apiClient.get('/research/sources');
    return res.data;
  },

  // Consulting Framework Summary & Integration Health
  getFrameworkSummary: async (productId: string, organizationId?: string) => {
    const res = await apiClient.get('/integrations/summary', {
      params: { product_id: productId, organization_id: organizationId },
    });
    return res.data;
  },
  getIntegrationsHealth: async () => {
    const res = await apiClient.get('/integrations/health');
    return res.data;
  },

  // Knowledge Base & RAG Retrieval
  searchKnowledge: async (query: string, top_k = 4) => {
    const res = await apiClient.post('/knowledge/search', { query, top_k });
    return res.data;
  },
  getKnowledgeSources: async () => {
    const res = await apiClient.get('/knowledge/sources');
    return res.data;
  },
};
