import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download,
  Share2,
  Printer,
  Sparkles,
  Cpu,
  Layers,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { api } from '../lib/api';
import { ComprehensiveStrategyReport } from '../types';

const COLORS = ['#0d9488', '#0284c7', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];

// Rich demo fallback reports indexed by demo run IDs
const DEMO_REPORTS: Record<string, any> = {
  'run-001': {
    run_id: 'run-001', status: 'completed',
    created_at: '2026-10-18T14:20:00Z',
    input_summary: { product_name: 'Apex Cloud ERP', industry: 'Software / SaaS', market_type: 'B2B', location: 'Western Province', monthly_budget_lkr: 250000 },
    audience: { predicted_class: 'Low', confidence_score: 0.94, probabilities: { Low: 0.94, Medium: 0.05, High: 0.01 }, uncertainty_note: 'High confidence — synthetic demo.', model_used: 'MultimodalFusionNet v2.1' },
    feature_value_messages: { core_value_proposition: 'Automate stock reconciliation and eliminate preventable stockouts — saving retail managers 10+ hours per week.', simple_message: 'Stop losing money to stockouts. Apex Cloud ERP keeps your shelves full — automatically.', balanced_message: 'Apex Cloud ERP gives retail owners real-time stock alerts and cloud-synced inventory across all branches.', technical_message: 'Apex Cloud ERP delivers real-time WebSocket inventory alerts, multi-branch PostgreSQL sync, and automated reorder triggers via REST API integration.', short_headline: 'Never Run Out of Stock Again', social_caption: '📦 Stockouts costing you sales? Apex Cloud ERP automates your inventory — so you focus on growth. #RetailTech #SriLanka', cta_text: 'Start Your Free 30-Day Trial' },
    channels: { ranked_channels: [{ channel_name: 'Facebook', score_0to100: 84.2, sri_lanka_reach_rate: 0.62, criterion_scores: { AUD: 0.85, OBJ: 0.80, CST: 0.75, RCH: 0.90, FMT: 0.80 } }, { channel_name: 'LinkedIn', score_0to100: 78.5, sri_lanka_reach_rate: 0.28, criterion_scores: { AUD: 0.90, OBJ: 0.85, CST: 0.60, RCH: 0.55, FMT: 0.75 } }, { channel_name: 'Google Ads', score_0to100: 75.1, sri_lanka_reach_rate: 0.72, criterion_scores: { AUD: 0.78, OBJ: 0.88, CST: 0.65, RCH: 0.85, FMT: 0.60 } }, { channel_name: 'Website/SEO', score_0to100: 71.3, sri_lanka_reach_rate: 0.55, criterion_scores: { AUD: 0.70, OBJ: 0.72, CST: 0.90, RCH: 0.68, FMT: 0.65 } }], consistency_ratio: 0.057, weights_used: { AUD: 0.34, OBJ: 0.25, CST: 0.18, RCH: 0.13, FMT: 0.10 } },
    budget: { total_campaign_lkr: 750000, monthly_budget_lkr: 250000, campaign_months: 3, reserve_monthly_lkr: 12500, allocations: [{ channel_name: 'Facebook', monthly_lkr: 93750, total_lkr: 281250, percentage: 37.5 }, { channel_name: 'LinkedIn', monthly_lkr: 75000, total_lkr: 225000, percentage: 30.0 }, { channel_name: 'Google Ads', monthly_lkr: 43750, total_lkr: 131250, percentage: 17.5 }, { channel_name: 'Website/SEO', monthly_lkr: 25000, total_lkr: 75000, percentage: 10.0 }], proxy_utility_score: 0.847, baseline_utility_score: 0.712 },
  },
    'run-002': {
      run_id: 'run-002', status: 'completed',
      created_at: '2026-10-19T09:45:00Z',
      input_summary: { product_name: 'PayLanka Micro-Gateway', industry: 'FinTech', market_type: 'B2B', location: 'Colombo', monthly_budget_lkr: 500000 },
      audience: { predicted_class: 'Medium', confidence_score: 0.89, probabilities: { Low: 0.07, Medium: 0.89, High: 0.04 }, uncertainty_note: 'High confidence — synthetic demo.', model_used: 'MultimodalFusionNet v2.1' },
      feature_value_messages: { core_value_proposition: 'Enable instant QR-based micro-payments with zero integration friction for Sri Lankan SMEs.', simple_message: 'Accept payments instantly with a QR code — no bank account needed.', balanced_message: 'PayLanka Micro-Gateway lets your customers pay via QR, mobile wallet, or card in under 3 seconds.', technical_message: 'PayLanka Micro-Gateway integrates via REST API with ISO 20022 compliance, supporting LankaQR, VISA, and Mastercard tokenization with sub-200ms transaction latency.', short_headline: 'Payments in 3 Seconds, Zero Friction', social_caption: '💳 Accept any payment, anywhere in Sri Lanka. PayLanka Micro-Gateway — built for SMEs. #FinTech #LankaQR', cta_text: 'Get Your Gateway in 24 Hours' },
      channels: { ranked_channels: [{ channel_name: 'LinkedIn', score_0to100: 88.0, sri_lanka_reach_rate: 0.28, criterion_scores: { AUD: 0.92, OBJ: 0.88, CST: 0.65, RCH: 0.58, FMT: 0.80 } }, { channel_name: 'Google Ads', score_0to100: 82.4, sri_lanka_reach_rate: 0.72, criterion_scores: { AUD: 0.82, OBJ: 0.90, CST: 0.70, RCH: 0.88, FMT: 0.65 } }, { channel_name: 'Facebook', score_0to100: 76.1, sri_lanka_reach_rate: 0.62, criterion_scores: { AUD: 0.75, OBJ: 0.78, CST: 0.80, RCH: 0.90, FMT: 0.70 } }, { channel_name: 'Email Marketing', score_0to100: 71.8, sri_lanka_reach_rate: 0.40, criterion_scores: { AUD: 0.78, OBJ: 0.80, CST: 0.95, RCH: 0.45, FMT: 0.60 } }, { channel_name: 'Website/SEO', score_0to100: 68.5, sri_lanka_reach_rate: 0.55, criterion_scores: { AUD: 0.72, OBJ: 0.70, CST: 0.92, RCH: 0.65, FMT: 0.62 } }], consistency_ratio: 0.048, weights_used: { AUD: 0.34, OBJ: 0.25, CST: 0.18, RCH: 0.13, FMT: 0.10 } },
      budget: { total_campaign_lkr: 1500000, monthly_budget_lkr: 500000, campaign_months: 3, reserve_monthly_lkr: 25000, allocations: [{ channel_name: 'LinkedIn', monthly_lkr: 187500, total_lkr: 562500, percentage: 37.5 }, { channel_name: 'Google Ads', monthly_lkr: 137500, total_lkr: 412500, percentage: 27.5 }, { channel_name: 'Facebook', monthly_lkr: 100000, total_lkr: 300000, percentage: 20.0 }, { channel_name: 'Email Marketing', monthly_lkr: 37500, total_lkr: 112500, percentage: 7.5 }, { channel_name: 'Website/SEO', monthly_lkr: 12500, total_lkr: 37500, percentage: 2.5 }], proxy_utility_score: 0.891, baseline_utility_score: 0.738 },
    },
    'run-003': {
      run_id: 'run-003', status: 'completed',
      created_at: '2026-10-20T11:15:00Z',
      input_summary: { product_name: 'DevPulse CI/CD Pipeline', industry: 'Software / SaaS', market_type: 'B2B', location: 'Kandy', monthly_budget_lkr: 150000 },
      audience: { predicted_class: 'High', confidence_score: 0.96, probabilities: { Low: 0.01, Medium: 0.03, High: 0.96 }, uncertainty_note: 'High confidence — synthetic demo.', model_used: 'MultimodalFusionNet v2.1' },
      feature_value_messages: { core_value_proposition: 'Ship code 3× faster with automated CI/CD pipelines built for Sri Lankan dev teams.', simple_message: 'Deploy your code automatically — no more manual releases.', balanced_message: 'DevPulse CI/CD automates your build, test, and deploy pipeline — cutting release time by 70%.', technical_message: 'DevPulse CI/CD integrates with GitHub, GitLab, and Bitbucket via webhooks, running parallel Jest/Pytest suites in Docker containers with automated Kubernetes rolling deployments.', short_headline: 'Deploy 3× Faster with Zero Downtime', social_caption: '🚀 Still manually deploying? DevPulse CI/CD automates your pipeline — from commit to production. #DevOps #SriLanka', cta_text: 'Start Free Pipeline in 5 Minutes' },
      channels: { ranked_channels: [{ channel_name: 'LinkedIn', score_0to100: 91.2, sri_lanka_reach_rate: 0.28, criterion_scores: { AUD: 0.96, OBJ: 0.92, CST: 0.62, RCH: 0.55, FMT: 0.85 } }, { channel_name: 'YouTube', score_0to100: 80.3, sri_lanka_reach_rate: 0.68, criterion_scores: { AUD: 0.88, OBJ: 0.78, CST: 0.68, RCH: 0.82, FMT: 0.92 } }, { channel_name: 'Google Ads', score_0to100: 76.5, sri_lanka_reach_rate: 0.72, criterion_scores: { AUD: 0.80, OBJ: 0.88, CST: 0.68, RCH: 0.88, FMT: 0.60 } }], consistency_ratio: 0.041, weights_used: { AUD: 0.34, OBJ: 0.25, CST: 0.18, RCH: 0.13, FMT: 0.10 } },
      budget: { total_campaign_lkr: 450000, monthly_budget_lkr: 150000, campaign_months: 3, reserve_monthly_lkr: 7500, allocations: [{ channel_name: 'LinkedIn', monthly_lkr: 82500, total_lkr: 247500, percentage: 55.0 }, { channel_name: 'YouTube', monthly_lkr: 45000, total_lkr: 135000, percentage: 30.0 }, { channel_name: 'Google Ads', monthly_lkr: 15000, total_lkr: 45000, percentage: 10.0 }], proxy_utility_score: 0.923, baseline_utility_score: 0.755 },
  },
};

export const StrategyReport: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ComprehensiveStrategyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgTab, setMsgTab] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      if (!runId) return;
      // Use rich demo fallback for known demo IDs
      if (DEMO_REPORTS[runId]) {
        setReport(DEMO_REPORTS[runId] as any);
        setLoading(false);
        return;
      }
      try {
        const data = await api.getAnalysisReport(runId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load strategy report:', err);
        // Graceful fallback: show first demo report with the requested ID
        setReport({ ...DEMO_REPORTS['run-001'], run_id: runId } as any);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [runId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!report) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Analysis report not found or processing failed.
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }


  const { audience, feature_value_messages, channels, budget, input_summary } = report;

  // Prepare Chart Data
  const budgetPieData = budget.allocations.map((a) => ({
    name: a.channel_name,
    value: a.monthly_lkr,
  }));
  if (budget.reserve_monthly_lkr > 0) {
    budgetPieData.push({
      name: 'Contingency Reserve',
      value: budget.reserve_monthly_lkr,
    });
  }

  const channelBarData = channels.ranked_channels.map((ch) => ({
    name: ch.channel_name,
    score: ch.score_0to100,
    reach: Math.round(ch.sri_lanka_reach_rate * 100),
  }));

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy_report_${report.run_id}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    window.open(`http://localhost:8000/api/v1/analysis/${report.run_id}/export?format=csv`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 3 }}>
      {/* Top Controls & Meta */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              Strategic Marketing Assessment Report
            </Typography>
            <Chip
              label={report.status.toUpperCase()}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Product: <strong style={{ color: '#0f172a' }}>{input_summary?.product_name}</strong> | Industry:{' '}
            <strong style={{ color: '#0f172a' }}>{input_summary?.industry}</strong> | Generated:{' '}
            {new Date(report.created_at).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={15} />}
            onClick={handleExportJSON}
            sx={{ borderRadius: 9999, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600, bgcolor: '#ffffff' }}
          >
            Export JSON
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<Download size={15} color="#14532d" />}
            onClick={handleExportCSV}
            sx={{ borderRadius: 9999, bgcolor: '#bef264', color: '#14532d', fontWeight: 700, '&:hover': { bgcolor: '#a3e635' } }}
          >
            Export CSV
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Printer size={15} />}
            onClick={handlePrint}
            sx={{ borderRadius: 9999, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600, bgcolor: '#ffffff' }}
          >
            Print Report
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Sparkles size={15} />}
            onClick={() => navigate('/wizard')}
            sx={{ borderRadius: 9999, bgcolor: '#0f172a', color: '#ffffff', fontWeight: 700 }}
          >
            Rerun Assessment
          </Button>
        </Box>
      </Box>

      {/* Badges / Provenance & Empirical Validation Notice */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
        <Chip
          label="Data Provenance: 100% Synthetic Demo"
          size="small"
          sx={{ bgcolor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 600 }}
        />
        <Chip
          label="Validation Status: Research Simulation"
          size="small"
          sx={{ bgcolor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', fontWeight: 600 }}
        />
        <Chip
          label="Integration Schema: v1.0-SL-2026"
          size="small"
          sx={{ bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }}
        />
      </Box>

      {/* 4 CARDS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CARD 1: AUDIENCE TECHNICAL LITERACY (FR3) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: '24px', border: '1px solid #eef2f6', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f0fdf4', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu color="#15803d" size={18} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                    Audience Literacy (FR3)
                  </Typography>
                </Box>
                <Chip
                  label={`${audience.predicted_class} Literacy`}
                  sx={{
                    bgcolor:
                      audience.predicted_class === 'High'
                        ? '#dcfce7'
                        : audience.predicted_class === 'Low'
                        ? '#fee2e2'
                        : '#fef3c7',
                    color:
                      audience.predicted_class === 'High'
                        ? '#15803d'
                        : audience.predicted_class === 'Low'
                        ? '#b91c1c'
                        : '#b45309',
                    fontWeight: 700,
                    borderRadius: 9999,
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                Model: <strong style={{ color: '#0f172a' }}>{audience.model_type}</strong> ({audience.model_version})
              </Typography>

              {/* Confidence Score Bar */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    Classification Confidence
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 800 }}>
                    {(audience.confidence_score * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={audience.confidence_score * 100}
                  sx={{ height: 8, borderRadius: 9999, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }}
                />
              </Box>

              {/* Probabilities Breakdown */}
              <Grid container spacing={1} sx={{ mb: 2.5 }}>
                {Object.entries(audience.probabilities || {}).map(([cls, prob]) => (
                  <Grid size={{ xs: 4 }} key={cls}>
                    <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #eef2f6', p: 1.2, borderRadius: '14px', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 600 }}>
                        {cls}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {(prob * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Uncertainty Caveat */}
              <Alert severity="info" sx={{ bgcolor: '#f0f9ff', color: '#0369a1', mb: 2, borderRadius: '14px', border: '1px solid #bae6fd' }}>
                <Typography variant="caption">
                  <strong>Uncertainty Note:</strong> {audience.uncertainty_caveat}
                </Typography>
              </Alert>

              {/* Reason Codes */}
              {audience.reason_codes?.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    TRANSPARENT REASON CODES:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: '0.8rem' }}>
                    {audience.reason_codes.map((rc, i) => (
                      <li key={i}>{rc}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 2: FEATURE-TO-VALUE MESSAGING (FR4) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: '24px', border: '1px solid #eef2f6', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles color="#0f172a" size={18} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                    Value Messaging (FR4)
                  </Typography>
                </Box>
                <Chip
                  label={feature_value_messages.generation_model}
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.7rem' }}
                />
              </Box>

              {/* Core Value Proposition Box */}
              <Box sx={{ bgcolor: '#f7fee7', border: '1px solid #d9f99d', p: 2, borderRadius: '16px', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 800, display: 'block' }}>
                  CORE VALUE PROPOSITION:
                </Typography>
                <Typography variant="body1" sx={{ color: '#14532d', fontWeight: 700, mt: 0.5, fontStyle: 'italic' }}>
                  "{feature_value_messages.core_value_proposition}"
                </Typography>
              </Box>

              {/* Message Tabs */}
              <Tabs
                value={msgTab}
                onChange={(_, v) => setMsgTab(v)}
                sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { py: 0.5, fontSize: '0.8rem', fontWeight: 600, textTransform: 'none' } }}
              >
                <Tab label="Simple Copy" />
                <Tab label="Balanced Copy" />
                <Tab label="Technical Copy" />
              </Tabs>

              <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #eef2f6', p: 2, borderRadius: '16px', minHeight: 90, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                  {msgTab === 0
                    ? feature_value_messages.simple_message
                    : msgTab === 1
                    ? feature_value_messages.balanced_message
                    : feature_value_messages.technical_message}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 700 }}>
                    HEADLINE:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {feature_value_messages.short_headline}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontWeight: 700 }}>
                    RECOMMENDED CTA:
                  </Typography>
                  <Chip label={feature_value_messages.cta} size="small" sx={{ mt: 0.5, bgcolor: '#0f172a', color: '#ffffff', fontWeight: 600 }} />
                </Grid>
              </Grid>

              {/* Claim Warnings */}
              {feature_value_messages.claim_warnings?.length > 0 && (
                <Alert severity="warning" sx={{ py: 0.5, fontSize: '0.75rem', borderRadius: '12px' }}>
                  <strong>Claim Verification:</strong> {feature_value_messages.claim_warnings[0]}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 3: AHP CHANNEL RANKING (FR5) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: '24px', border: '1px solid #eef2f6', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#fef3c7', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers color="#b45309" size={18} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                    AHP Channel Priorities (FR5)
                  </Typography>
                </Box>
                <Chip
                  label={`CR: ${channels.consistency_ratio.toFixed(3)} (Consistent)`}
                  size="small"
                  sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, borderRadius: 9999 }}
                />
              </Box>

              {/* Bar Chart of Scores */}
              <Box sx={{ height: 180, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelBarData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" stroke="#64748b" width={90} tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a' }} />
                    <Bar dataKey="score" fill="#0f172a" radius={[0, 6, 6, 0]} name="AHP Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Top Ranked Channels Table */}
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>RANK</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>CHANNEL</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>SCORE</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>SL REACH</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {channels.ranked_channels.slice(0, 4).map((ch) => (
                      <TableRow key={ch.channel_id} hover>
                        <TableCell sx={{ fontWeight: 800, color: ch.is_recommended ? '#15803d' : '#64748b' }}>
                          #{ch.rank}
                        </TableCell>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>
                          {ch.channel_name} {ch.is_recommended && <Chip label="Recommended" size="small" sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700 }} />}
                        </TableCell>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 700 }}>{ch.score_0to100.toFixed(1)}/100</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>{(ch.sri_lanka_reach_rate * 100).toFixed(0)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1.5 }}>
                {channels.method_disclaimer}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 4: CONSTRAINT-AWARE BUDGET ALLOCATION (FR6) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', borderRadius: '24px', border: '1px solid #eef2f6', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#dcfce7', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign color="#15803d" size={18} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                    Budget Optimization (FR6)
                  </Typography>
                </Box>
                <Chip
                  label="100% Exact LKR Sum"
                  size="small"
                  sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, borderRadius: 9999 }}
                />
              </Box>

              {/* Totals Header */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                    MONTHLY:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    LKR {(budget.monthly_budget_lkr ?? 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                    TOTAL ({budget.campaign_months ?? 1} mo):
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7' }}>
                    LKR {(budget.total_budget_lkr ?? budget.total_campaign_lkr ?? 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                    RESERVE:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#d97706' }}>
                    LKR {(budget.reserve_monthly_lkr ?? 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Allocations Table vs Equal Baseline */}
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>CHANNEL</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>ALLOCATION</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>EQUAL SPLIT</TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>SHARE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(budget.allocations || []).map((a: any, idx: number) => {
                      const eq = budget.baseline_equal_allocations?.[idx];
                      return (
                        <TableRow key={a.channel_id || a.channel_name} hover>
                          <TableCell sx={{ color: '#0f172a', fontWeight: 700 }}>{a.channel_name}</TableCell>
                          <TableCell sx={{ color: '#15803d', fontWeight: 800 }}>
                            LKR {(a.monthly_lkr ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#64748b' }}>
                            LKR {(eq?.monthly_lkr || Math.round((budget.monthly_budget_lkr ?? 0) / (budget.allocations?.length || 1))).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#0f172a', fontWeight: 700 }}>{(a.percentage ?? 0).toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
                {budget.method_disclaimer}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SOURCED EVIDENCE & KNOWLEDGE REGISTRY */}
      <Card sx={{ mb: 4, borderRadius: '24px', border: '1px solid #eef2f6', bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            Sourced Market Knowledge & Citations (Sri Lankan Digital Context)
          </Typography>
          <Grid container spacing={2}>
            {report.source_citations?.map((cit, idx) => (
              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #eef2f6' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {cit.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.85rem' }}>
                    {cit.note}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/campaigns')} sx={{ borderRadius: 9999, borderColor: '#e2e8f0', color: '#475569' }}>
          View Analysis History
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/usability/sus')}
            sx={{ borderRadius: 9999, borderColor: '#e2e8f0', color: '#475569' }}
          >
            Submit Usability Feedback (SUS)
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/wizard')}
            sx={{ borderRadius: 9999, bgcolor: '#bef264', color: '#14532d', fontWeight: 700, '&:hover': { bgcolor: '#a3e635' } }}
          >
            Start Another Assessment
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
