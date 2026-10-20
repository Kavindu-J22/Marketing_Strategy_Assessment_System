import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  GitCompare,
  Layers,
  DollarSign,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RunData {
  id: string;
  name: string;
  product: string;
  company: string;
  audience: string;
  budget: number;
  reserve: number;
  channels: { name: string; amount: number; percentage: number }[];
  ahpWeights: { [key: string]: number };
  sampleMessage: string;
}

const PRESET_RUNS: Record<string, RunData> = {
  run1: {
    id: 'run-001',
    name: 'Apex Cloud ERP (B2B SME - Low Tech Literacy)',
    product: 'Apex Cloud ERP',
    company: 'Lanka Tech Solutions Ltd',
    audience: 'Low',
    budget: 250000,
    reserve: 25000,
    channels: [
      { name: 'Meta Ads (Facebook/Insta)', amount: 90000, percentage: 36.0 },
      { name: 'Google Search Ads', amount: 65000, percentage: 26.0 },
      { name: 'LinkedIn Sponsored', amount: 45000, percentage: 18.0 },
      { name: 'Email Marketing Direct', amount: 25000, percentage: 10.0 },
    ],
    ahpWeights: {
      'Audience Alignment': 34,
      'Campaign Objective': 25,
      'Cost Efficiency': 18,
      'Market Reach': 13,
      'Content Format': 10,
    },
    sampleMessage:
      'Simplify your business accounts and inventory in minutes—no complex IT setup or software training required.',
  },
  run2: {
    id: 'run-003',
    name: 'DevPulse CI/CD (Developer Tool - High Tech Literacy)',
    product: 'DevPulse CI/CD Pipeline',
    company: 'Kandy Software Systems',
    audience: 'High',
    budget: 300000,
    reserve: 30000,
    channels: [
      { name: 'LinkedIn Sponsored', amount: 110000, percentage: 36.7 },
      { name: 'Tech Blogs & Sponsored Articles', amount: 85000, percentage: 28.3 },
      { name: 'Google Search Ads', amount: 50000, percentage: 16.7 },
      { name: 'YouTube Tech Tutorials', amount: 25000, percentage: 8.3 },
    ],
    ahpWeights: {
      'Audience Alignment': 40,
      'Campaign Objective': 20,
      'Cost Efficiency': 15,
      'Market Reach': 10,
      'Content Format': 15,
    },
    sampleMessage:
      'Sub-2-minute container builds with native Kubernetes rollback manifests and zero-downtime canary deployment orchestration.',
  },
};

export const CampaignComparison: React.FC = () => {
  const [selectedRunA, setSelectedRunA] = useState<string>('run1');
  const [selectedRunB, setSelectedRunB] = useState<string>('run2');

  const runA = PRESET_RUNS[selectedRunA];
  const runB = PRESET_RUNS[selectedRunB];

  // Combined channels for side-by-side comparison
  const allChannelNames = Array.from(
    new Set([
      ...runA.channels.map((c) => c.name),
      ...runB.channels.map((c) => c.name),
    ])
  );

  const channelComparisonData = allChannelNames.map((chName) => {
    const chA = runA.channels.find((c) => c.name === chName);
    const chB = runB.channels.find((c) => c.name === chName);
    return {
      channel: chName.split(' ')[0], // short name
      fullName: chName,
      RunA: chA ? chA.amount : 0,
      RunB: chB ? chB.amount : 0,
    };
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <GitCompare size={28} color="#14b8a6" />
          <Typography variant="h4" fontWeight={700}>
            Side-by-Side Strategy Comparison
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 900 }}>
          Evaluate how variations in target audience technical literacy, AHP pairwise preferences, and monthly budgets
          shift marketing channel allocation and feature-to-value translation.
        </Typography>
      </Box>

      {/* Selector Controls */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(20, 184, 166, 0.4)' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#14b8a6', fontWeight: 700, textTransform: 'uppercase' }}>
                Scenario A (Baseline)
              </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Select Strategy Run</InputLabel>
                <Select
                  value={selectedRunA}
                  label="Select Strategy Run"
                  onChange={(e) => setSelectedRunA(e.target.value)}
                  sx={{ color: '#f1f5f9', bgcolor: '#0c111d' }}
                >
                  {Object.entries(PRESET_RUNS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>
                      {v.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Scenario B (Alternative)
              </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Select Strategy Run</InputLabel>
                <Select
                  value={selectedRunB}
                  label="Select Strategy Run"
                  onChange={(e) => setSelectedRunB(e.target.value)}
                  sx={{ color: '#f1f5f9', bgcolor: '#0c111d' }}
                >
                  {Object.entries(PRESET_RUNS).map(([k, v]) => (
                    <MenuItem key={k} value={k}>
                      {v.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* High Level Differences Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Users size={18} color="#14b8a6" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Audience Literacy Profile
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Scenario A</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#10b981' }}>
                    {runA.audience} Literacy
                  </Typography>
                </Box>
                <ArrowRight size={20} color="#64748b" />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Scenario B</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#c084fc' }}>
                    {runB.audience} Literacy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <DollarSign size={18} color="#f59e0b" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Total Monthly Budget
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Scenario A</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#f59e0b' }}>
                    LKR {runA.budget.toLocaleString()}
                  </Typography>
                </Box>
                <ArrowRight size={20} color="#64748b" />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Scenario B</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#f59e0b' }}>
                    LKR {runB.budget.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Layers size={18} color="#38bdf8" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Contingency Reserve
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Scenario A</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#94a3b8' }}>
                    LKR {runA.reserve.toLocaleString()}
                  </Typography>
                </Box>
                <ArrowRight size={20} color="#64748b" />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Scenario B</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#94a3b8' }}>
                    LKR {runB.reserve.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Channel Allocation Side-by-Side Bar Chart */}
      <Card sx={{ mb: 4, bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            Marketing Channel Budget Allocation (LKR)
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
            Comparative integer rupee allocations generated by SLSQP constrained optimization
          </Typography>

          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="channel" stroke="#94a3b8" />
                <YAxis stroke="#64748b" tickFormatter={(v) => `LKR ${v / 1000}k`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                  formatter={(val: number) => [`LKR ${val.toLocaleString()}`]}
                />
                <Legend />
                <Bar name={`Scenario A: ${runA.product}`} dataKey="RunA" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar name={`Scenario B: ${runB.product}`} dataKey="RunB" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Messaging Contrast */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(20, 184, 166, 0.2)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Sparkles size={18} color="#14b8a6" />
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#14b8a6' }}>
                  Scenario A Translated Value Message
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#e2e8f0', p: 2, bgcolor: '#0c111d', borderRadius: 2, fontStyle: 'italic', borderLeft: '4px solid #14b8a6' }}>
                "{runA.sampleMessage}"
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 1.5, display: 'block' }}>
                Tuned for <strong>{runA.audience} Technical Literacy</strong>: Plain business outcome, low cognitive friction.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(56, 189, 248, 0.2)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Sparkles size={18} color="#38bdf8" />
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#38bdf8' }}>
                  Scenario B Translated Value Message
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#e2e8f0', p: 2, bgcolor: '#0c111d', borderRadius: 2, fontStyle: 'italic', borderLeft: '4px solid #38bdf8' }}>
                "{runB.sampleMessage}"
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', mt: 1.5, display: 'block' }}>
                Tuned for <strong>{runB.audience} Technical Literacy</strong>: Precise architectural terminology and metrics.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
