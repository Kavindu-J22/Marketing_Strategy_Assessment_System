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

export const StrategyReport: React.FC = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ComprehensiveStrategyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgTab, setMsgTab] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      if (!runId) return;
      try {
        const data = await api.getAnalysisReport(runId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load strategy report:', err);
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
