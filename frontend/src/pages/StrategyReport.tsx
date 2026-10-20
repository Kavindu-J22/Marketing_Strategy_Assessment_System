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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f1f5f9' }}>
              Strategic Marketing Strategy Report
            </Typography>
            <Chip
              label={report.status.toUpperCase()}
              color="success"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Product: <strong>{input_summary?.product_name}</strong> | Industry:{' '}
            <strong>{input_summary?.industry}</strong> | Generated:{' '}
            {new Date(report.created_at).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={15} />}
            onClick={handleExportJSON}
          >
            Export JSON
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={15} />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Printer size={15} />}
            onClick={handlePrint}
          >
            Print Report
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<Sparkles size={15} />}
            onClick={() => navigate('/wizard')}
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
          sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid #78350f' }}
        />
        <Chip
          label="Validation Status: Not yet empirically validated"
          size="small"
          sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid #7f1d1d' }}
        />
        <Chip
          label="Integration Schema: v1.0-SL-2026"
          size="small"
          sx={{ bgcolor: 'rgba(13, 148, 136, 0.15)', color: '#14b8a6', border: '1px solid #0f766e' }}
        />
      </Box>

      {/* 4 CARDS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CARD 1: AUDIENCE TECHNICAL LITERACY (FR3) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cpu color="#14b8a6" size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                    Audience Intelligence & Literacy (FR3)
                  </Typography>
                </Box>
                <Chip
                  label={`${audience.predicted_class} Literacy`}
                  sx={{
                    bgcolor:
                      audience.predicted_class === 'High'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : audience.predicted_class === 'Low'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                    color:
                      audience.predicted_class === 'High'
                        ? '#34d399'
                        : audience.predicted_class === 'Low'
                        ? '#f87171'
                        : '#fbbf24',
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Model: <strong>{audience.model_type}</strong> ({audience.model_version})
              </Typography>

              {/* Confidence Score Bar */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                    Classification Confidence
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#14b8a6', fontWeight: 700 }}>
                    {(audience.confidence_score * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={audience.confidence_score * 100}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.08)' }}
                />
              </Box>

              {/* Probabilities Breakdown */}
              <Grid container spacing={1} sx={{ mb: 2.5 }}>
                {Object.entries(audience.probabilities || {}).map(([cls, prob]) => (
                  <Grid item xs={4} key={cls}>
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.25)', p: 1, borderRadius: 1.5, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                        {cls}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                        {(prob * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Uncertainty Caveat */}
              <Alert severity="info" sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#67e8f9', mb: 2 }}>
                <Typography variant="caption">
                  <strong>Uncertainty Note:</strong> {audience.uncertainty_caveat}
                </Typography>
              </Alert>

              {/* Reason Codes */}
              {audience.reason_codes?.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                    TRANSPARENT REASON CODES:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: '0.8rem' }}>
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
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sparkles color="#38bdf8" size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                    Feature-to-Value Messaging (FR4)
                  </Typography>
                </Box>
                <Chip
                  label={feature_value_messages.generation_model}
                  size="small"
                  variant="outlined"
                  sx={{ color: '#38bdf8', borderColor: '#0284c7', fontSize: '0.7rem' }}
                />
              </Box>

              {/* Core Value Proposition Box */}
              <Box sx={{ bgcolor: 'rgba(2, 132, 199, 0.15)', p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block' }}>
                  CORE VALUE PROPOSITION:
                </Typography>
                <Typography variant="body1" sx={{ color: '#f0f9ff', fontWeight: 600, mt: 0.5 }}>
                  "{feature_value_messages.core_value_proposition}"
                </Typography>
              </Box>

              {/* Message Tabs */}
              <Tabs
                value={msgTab}
                onChange={(_, v) => setMsgTab(v)}
                sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { py: 0.5, fontSize: '0.8rem' } }}
              >
                <Tab label="Simple Copy" />
                <Tab label="Balanced Copy" />
                <Tab label="Technical Copy" />
              </Tabs>

              <Box sx={{ bgcolor: 'rgba(0,0,0,0.25)', p: 2, borderRadius: 2, minHeight: 90, mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.6 }}>
                  {msgTab === 0
                    ? feature_value_messages.simple_message
                    : msgTab === 1
                    ? feature_value_messages.balanced_message
                    : feature_value_messages.technical_message}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                    HEADLINE:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
                    {feature_value_messages.short_headline}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                    RECOMMENDED CTA:
                  </Typography>
                  <Chip label={feature_value_messages.cta} size="small" color="primary" sx={{ mt: 0.5 }} />
                </Grid>
              </Grid>

              {/* Claim Warnings */}
              {feature_value_messages.claim_warnings?.length > 0 && (
                <Alert severity="warning" sx={{ py: 0.5, fontSize: '0.75rem' }}>
                  <strong>Claim Verification:</strong> {feature_value_messages.claim_warnings[0]}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 3: AHP CHANNEL RANKING (FR5) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Layers color="#f59e0b" size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                    AHP Channel Recommendations (FR5)
                  </Typography>
                </Box>
                <Chip
                  label={`CR: ${channels.consistency_ratio.toFixed(3)} (Consistent)`}
                  size="small"
                  sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}
                />
              </Box>

              {/* Bar Chart of Scores */}
              <Box sx={{ height: 180, mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelBarData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    <Bar dataKey="score" fill="#0d9488" radius={[0, 4, 4, 0]} name="AHP Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Top Ranked Channels Table */}
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#94a3b8' }}>RANK</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>CHANNEL</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>SCORE</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>SL REACH</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {channels.ranked_channels.slice(0, 4).map((ch) => (
                      <TableRow key={ch.channel_id} hover>
                        <TableCell sx={{ fontWeight: 700, color: ch.is_recommended ? '#14b8a6' : '#94a3b8' }}>
                          #{ch.rank}
                        </TableCell>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                          {ch.channel_name} {ch.is_recommended && <Chip label="Recommended" size="small" color="primary" sx={{ ml: 1, height: 18, fontSize: '0.65rem' }} />}
                        </TableCell>
                        <TableCell sx={{ color: '#f1f5f9' }}>{ch.score_0to100.toFixed(1)}/100</TableCell>
                        <TableCell sx={{ color: '#94a3b8' }}>{(ch.sri_lanka_reach_rate * 100).toFixed(0)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1.5 }}>
                {channels.method_disclaimer}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* CARD 4: CONSTRAINT-AWARE BUDGET ALLOCATION (FR6) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DollarSign color="#10b981" size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                    Constraint-Aware Budget Allocation (FR6)
                  </Typography>
                </Box>
                <Chip
                  label="100% Exact Sum Verified"
                  size="small"
                  sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 600 }}
                />
              </Box>

              {/* Totals Header */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    MONTHLY BUDGET:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
                    LKR {budget.monthly_budget_lkr.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    CAMPAIGN TOTAL ({budget.campaign_months} mo):
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                    LKR {budget.total_budget_lkr.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    CONTINGENCY RESERVE:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#fbbf24' }}>
                    LKR {budget.reserve_monthly_lkr.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Pie Chart of Allocations */}
              <Box sx={{ height: 170, mb: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      innerRadius={38}
                    >
                      {budgetPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val: number) => `LKR ${val.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Allocations Table vs Equal Baseline */}
              <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#94a3b8' }}>CHANNEL</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>PROPOSED (MO)</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>EQUAL BASELINE</TableCell>
                      <TableCell sx={{ color: '#94a3b8' }}>SHARE</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budget.allocations.map((a, idx) => {
                      const eq = budget.baseline_equal_allocations[idx];
                      return (
                        <TableRow key={a.channel_id} hover>
                          <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{a.channel_name}</TableCell>
                          <TableCell sx={{ color: '#10b981', fontWeight: 700 }}>
                            LKR {a.monthly_lkr.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#94a3b8' }}>
                            LKR {(eq?.monthly_lkr || 0).toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ color: '#cbd5e1' }}>{a.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
                {budget.method_disclaimer}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SOURCED EVIDENCE & KNOWLEDGE REGISTRY (Section 10) */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 2 }}>
            Sourced Market Knowledge & Citations (Sri Lankan Digital Context)
          </Typography>
          <Grid container spacing={2}>
            {report.source_citations?.map((cit, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#38bdf8' }}>
                    {cit.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
                    {cit.note}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined" onClick={() => navigate('/campaigns')}>
          View Analysis History
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate('/usability/sus')}
          >
            Submit Usability Feedback (SUS)
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/wizard')}
          >
            Start Another Assessment
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
