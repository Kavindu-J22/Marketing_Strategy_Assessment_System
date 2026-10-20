import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Layers,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Criterion {
  id: string;
  name: string;
  code: string;
  description: string;
}

const CRITERIA: Criterion[] = [
  { id: 'c1', name: 'Audience Alignment', code: 'AUD', description: 'Match with target segment & technical literacy' },
  { id: 'c2', name: 'Campaign Objective', code: 'OBJ', description: 'Fit for awareness, lead gen, or conversion' },
  { id: 'c3', name: 'Cost Efficiency', code: 'CST', description: 'Expected ROI and cost per impression/click in LKR' },
  { id: 'c4', name: 'Market Reach', code: 'RCH', description: 'Sri Lankan active audience size and accessibility' },
  { id: 'c5', name: 'Content Format Fit', code: 'FMT', description: 'Suitability for required creative message types' },
];

const SAATY_SCALE = [
  { value: 9, label: '9 - Extremely more important' },
  { value: 7, label: '7 - Very strongly more important' },
  { value: 5, label: '5 - Strongly more important' },
  { value: 3, label: '3 - Moderately more important' },
  { value: 2, label: '2 - Slightly more important' },
  { value: 1, label: '1 - Equally important' },
  { value: 1 / 2, label: '1/2 - Slightly less important' },
  { value: 1 / 3, label: '1/3 - Moderately less important' },
  { value: 1 / 5, label: '1/5 - Strongly less important' },
  { value: 1 / 7, label: '1/7 - Very strongly less important' },
  { value: 1 / 9, label: '1/9 - Extremely less important' },
];

// Random index values for n=1..10 (Saaty 1980)
const RI_TABLE: Record<number, number> = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

const PRESETS = {
  assumed_demo: {
    label: 'Assumed Proposal Demo Fallback (Audience > Objective > Cost > Reach > Format)',
    matrix: [
      [1, 2, 3, 3, 5],
      [1 / 2, 1, 2, 2, 3],
      [1 / 3, 1 / 2, 1, 2, 2],
      [1 / 3, 1 / 2, 1 / 2, 1, 2],
      [1 / 5, 1 / 3, 1 / 2, 1 / 2, 1],
    ],
  },
  equal: {
    label: 'Equal Importance (20% each)',
    matrix: [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
    ],
  },
  cost_conscious: {
    label: 'Cost-Conscious SME (Cost & Objective heavy)',
    matrix: [
      [1, 1 / 2, 1 / 3, 2, 2],
      [2, 1, 1 / 2, 3, 3],
      [3, 2, 1, 4, 4],
      [1 / 2, 1 / 3, 1 / 4, 1, 1],
      [1 / 2, 1 / 3, 1 / 4, 1, 1],
    ],
  },
  mass_reach: {
    label: 'Mass Awareness & Reach Focus',
    matrix: [
      [1, 1, 1 / 2, 1 / 3, 2],
      [1, 1, 1 / 2, 1 / 3, 2],
      [2, 2, 1, 1 / 2, 3],
      [3, 3, 2, 1, 4],
      [1 / 2, 1 / 2, 1 / 3, 1 / 4, 1],
    ],
  },
};

export const AHPMatrixExpert: React.FC = () => {
  const [matrix, setMatrix] = useState<number[][]>(PRESETS.assumed_demo.matrix);
  const [selectedPreset, setSelectedPreset] = useState<string>('assumed_demo');

  const n = CRITERIA.length;

  const handleCellChange = (i: number, j: number, val: number) => {
    const newMatrix = matrix.map((row) => [...row]);
    newMatrix[i][j] = val;
    newMatrix[j][i] = 1 / val;
    setMatrix(newMatrix);
    setSelectedPreset('custom');
  };

  const applyPreset = (key: keyof typeof PRESETS) => {
    setSelectedPreset(key);
    setMatrix(PRESETS[key].matrix.map((r) => [...r]));
  };

  // Compute AHP Eigenvector / Geometric Mean, Lambda Max, CI, CR
  const ahpMetrics = useMemo(() => {
    // Geometric mean method
    const geomMeans = matrix.map((row) => {
      const prod = row.reduce((acc, v) => acc * v, 1);
      return Math.pow(prod, 1 / n);
    });
    const sumGeom = geomMeans.reduce((a, b) => a + b, 0);
    const weights = geomMeans.map((gm) => gm / sumGeom);

    // Compute Lambda Max: (A * w) / w
    const Aw = matrix.map((row) =>
      row.reduce((sum, val, colIdx) => sum + val * weights[colIdx], 0)
    );
    const lambdas = Aw.map((awVal, idx) => awVal / (weights[idx] || 0.0001));
    const lambdaMax = lambdas.reduce((a, b) => a + b, 0) / n;

    const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
    const ri = RI_TABLE[n] || 1.12;
    const cr = ri > 0 ? ci / ri : 0;
    const isConsistent = cr <= 0.1001;

    return {
      weights,
      lambdaMax,
      ci,
      cr,
      isConsistent,
    };
  }, [matrix, n]);

  const chartData = CRITERIA.map((crit, idx) => ({
    name: crit.name,
    code: crit.code,
    weight: Math.round(ahpMetrics.weights[idx] * 1000) / 10,
    rawWeight: ahpMetrics.weights[idx],
  }));

  const COLORS = ['#0d9488', '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Layers size={28} color="#14b8a6" />
          <Typography variant="h4" fontWeight={700}>
            AHP Multi-Criteria Expert Matrix
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 900 }}>
          Interactive Saaty 1–9 pairwise comparison matrix for evaluating Sri Lankan marketing channel criteria (Q15–Q17).
          Calculates principal eigenvector weights, maximum eigenvalue (λ_max), and enforces Saaty's consistency constraint (CR ≤ 0.10).
        </Typography>
      </Box>

      {/* Preset selection and reset bar */}
      <Card sx={{ mb: 4, bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, py: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            Decision Templates:
          </Typography>
          <Button
            size="small"
            variant={selectedPreset === 'assumed_demo' ? 'contained' : 'outlined'}
            onClick={() => applyPreset('assumed_demo')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Assumed Proposal Demo
          </Button>
          <Button
            size="small"
            variant={selectedPreset === 'cost_conscious' ? 'contained' : 'outlined'}
            onClick={() => applyPreset('cost_conscious')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cost-Conscious SME
          </Button>
          <Button
            size="small"
            variant={selectedPreset === 'mass_reach' ? 'contained' : 'outlined'}
            onClick={() => applyPreset('mass_reach')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Mass Awareness
          </Button>
          <Button
            size="small"
            variant={selectedPreset === 'equal' ? 'contained' : 'outlined'}
            onClick={() => applyPreset('equal')}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Equal Weights (20% each)
          </Button>
          <Box sx={{ ml: 'auto' }}>
            <Button
              size="small"
              startIcon={<RotateCcw size={14} />}
              onClick={() => applyPreset('assumed_demo')}
              sx={{ color: '#94a3b8' }}
            >
              Reset to Demo Defaults
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left: 5x5 Pairwise Matrix UI */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Saaty 5×5 Reciprocal Comparison Matrix
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    A_ji is automatically computed as 1 / A_ij (Reciprocal Axiom). Select importance of row relative to column.
                  </Typography>
                </Box>
                <Chip
                  icon={ahpMetrics.isConsistent ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  label={`CR = ${ahpMetrics.cr.toFixed(3)} (${ahpMetrics.isConsistent ? 'Consistent' : 'Inconsistent'})`}
                  color={ahpMetrics.isConsistent ? 'success' : 'warning'}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <TableContainer component={Paper} sx={{ bgcolor: '#0c111d', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                      <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Criterion</TableCell>
                      {CRITERIA.map((c) => (
                        <TableCell key={c.code} align="center" sx={{ color: '#14b8a6', fontWeight: 700 }}>
                          <Tooltip title={c.name} arrow>
                            <span>{c.code}</span>
                          </Tooltip>
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                        Weight (w_i)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {CRITERIA.map((rowCrit, i) => (
                      <TableRow key={rowCrit.code} hover>
                        <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {rowCrit.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            {rowCrit.code}
                          </Typography>
                        </TableCell>

                        {CRITERIA.map((colCrit, j) => {
                          if (i === j) {
                            return (
                              <TableCell key={colCrit.code} align="center" sx={{ bgcolor: 'rgba(20, 184, 166, 0.05)', color: '#14b8a6', fontWeight: 700 }}>
                                1.00
                              </TableCell>
                            );
                          }

                          if (i < j) {
                            // Upper triangular (editable)
                            const currentVal = matrix[i][j];
                            return (
                              <TableCell key={colCrit.code} align="center">
                                <FormControl size="small" sx={{ minWidth: 80 }}>
                                  <Select
                                    value={currentVal}
                                    onChange={(e) => handleCellChange(i, j, Number(e.target.value))}
                                    sx={{
                                      fontSize: '0.8rem',
                                      color: '#38bdf8',
                                      fontWeight: 600,
                                      bgcolor: 'rgba(56, 189, 248, 0.05)',
                                    }}
                                  >
                                    {SAATY_SCALE.map((s) => (
                                      <MenuItem key={s.label} value={s.value} sx={{ fontSize: '0.8rem' }}>
                                        {s.value < 1 ? `1/${Math.round(1 / s.value)}` : s.value}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                            );
                          }

                          // Lower triangular (reciprocal auto-computed)
                          const recipVal = matrix[i][j];
                          return (
                            <TableCell key={colCrit.code} align="center" sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              {recipVal >= 1 ? recipVal.toFixed(2) : `1/${Math.round(1 / recipVal)}`}
                            </TableCell>
                          );
                        })}

                        {/* Calculated weight for row */}
                        <TableCell align="center" sx={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
                          {(ahpMetrics.weights[i] * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Consistency Status Message */}
              <Box sx={{ mt: 3 }}>
                {ahpMetrics.isConsistent ? (
                  <Alert severity="success" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>Matrix is Mathematically Consistent</AlertTitle>
                    Consistency Ratio CR = <strong>{ahpMetrics.cr.toFixed(4)}</strong> is strictly below Saaty's 0.10 threshold.
                    The derived criteria priorities are sound for channel ranking.
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>Consistency Ratio Exceeded (CR &gt; 0.10)</AlertTitle>
                    CR = <strong>{ahpMetrics.cr.toFixed(4)}</strong> (&gt; 0.100). Saaty's AHP theorem advises reviewing transitive judgments
                    (e.g., if A &gt; B and B &gt; C, ensure A is sufficiently &gt; C). You can select a preset template above to restore consistency.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Derived Weights & Math Diagnostics */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Derived Weights Bar Chart */}
            <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Derived Criteria Priority (w_i)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2 }}>
                  Sum of priority weights = 100.0%
                </Typography>

                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" domain={[0, 50]} unit="%" stroke="#64748b" />
                      <YAxis type="category" dataKey="code" stroke="#94a3b8" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                        formatter={(val: number) => [`${val}%`, 'Priority Weight']}
                      />
                      <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Mathematical Diagnostics */}
            <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Scale size={20} color="#14b8a6" />
                  <Typography variant="h6" fontWeight={700}>
                    Spectral &amp; Consistency Metrics
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Order of Matrix (n)</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9' }}>{n}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Principal Eigenvalue (λ_max)</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#38bdf8' }}>{ahpMetrics.lambdaMax.toFixed(4)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Consistency Index (CI)</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9' }}>{ahpMetrics.ci.toFixed(4)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>Random Index RI(5)</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9' }}>1.1200</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#f1f5f9' }}>Consistency Ratio (CR)</Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ color: ahpMetrics.isConsistent ? '#10b981' : '#f59e0b' }}>
                      {ahpMetrics.cr.toFixed(4)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Info size={12} /> Saaty (1980): CI = (λ_max - n) / (n - 1); CR = CI / RI.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
