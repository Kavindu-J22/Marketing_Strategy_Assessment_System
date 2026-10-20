import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Paper,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  HelpCircle,
  Layers,
  Cpu,
  DollarSign,
  Award,
  BookOpen,
  Info,
  Scale,
  ShieldAlert,
} from 'lucide-react';

export const Methodology: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <BookOpen size={28} color="#14b8a6" />
          <Typography variant="h4" fontWeight={700}>
            Methodological Foundations &amp; Academic Reference
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 900 }}>
          Detailed mathematical formulations, optimization algorithms, and research provenance underlying
          the Marketing Strategy Assessment System (Proposal <strong>J26-ISE-313 IT23221796</strong>, SLIIT 2026).
        </Typography>
      </Box>

      {/* Synthetic Provenance Notice */}
      <Alert
        severity="info"
        icon={<ShieldAlert size={22} />}
        sx={{
          mb: 4,
          bgcolor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          color: '#e2e8f0',
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, color: '#38bdf8' }}>
          Academic Truth Constraint &amp; Dataset Provenance
        </AlertTitle>
        All 5,000 dataset records in this system are <strong>100% synthetically generated</strong> (1,000 fictional companies × 5 scenarios)
        designed to represent Sri Lankan ICT small-to-medium enterprises.
        The default AHP weights (34%, 25%, 18%, 13%, 10%) represent an assumed proposal demonstration fallback.
        Prospective commercial field trials are required before establishing empirical market efficacy.
      </Alert>

      {/* Grid of 4 Methodology Pillars */}
      <Grid container spacing={4}>
        {/* Pillar 1: Multimodal Audience Classifier */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Cpu size={22} color="#14b8a6" />
                <Typography variant="h6" fontWeight={700}>
                  1. Multimodal Neural Fusion Classifier
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.7 }}>
                The target audience technical literacy model categorizes customer segments into <strong>Low</strong>, <strong>Medium</strong>, or <strong>High</strong> technical literacy.
                To prevent data leakage, training strictly isolates corporate profiles using <strong>GroupKFold</strong> (0 company crossover).
              </Typography>

              <Paper sx={{ p: 2, bgcolor: '#0c111d', border: '1px solid rgba(255, 255, 255, 0.04)', mb: 2, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block', mb: 1 }}>
                  ARCHITECTURE SPECIFICATION:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '0.8rem' }}>
                  Text Input (TF-IDF 300) ──┐<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──► Concat(302) ──► Dense(64) ──► BatchNorm ──► ReLU ──► Dropout(0.3)<br />
                  Likert Input (Q10, Q11) ──┘<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;──► Dense(32) ──► Dense(3) ──► Softmax
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Test Accuracy: <strong>90.60%</strong> | Macro-F1: <strong>90.69%</strong> | Group-held-out test split (N=500).
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pillar 2: Analytic Hierarchy Process */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Layers size={22} color="#38bdf8" />
                <Typography variant="h6" fontWeight={700}>
                  2. Analytic Hierarchy Process (AHP - Saaty 1980)
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.7 }}>
                AHP mathematically ranks Sri Lankan marketing channels across 5 criteria (Audience, Objective, Cost, Reach, Format)
                using Saaty's 1–9 pairwise scale and eigenvalue decomposition.
              </Typography>

              <Paper sx={{ p: 2, bgcolor: '#0c111d', border: '1px solid rgba(255, 255, 255, 0.04)', mb: 2, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 700, display: 'block', mb: 1 }}>
                  MATHEMATICAL FORMULATIONS:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '0.8rem', lineHeight: 1.8 }}>
                  • Reciprocal Property: a_ji = 1 / a_ij, where a_ii = 1<br />
                  • Principal Eigenvector: A · w = λ_max · w<br />
                  • Consistency Index: CI = (λ_max - n) / (n - 1)<br />
                  • Consistency Ratio: CR = CI / RI(n) ≤ 0.10 (where RI(5) = 1.12)
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Ensures subjective channel trade-offs remain mathematically transmissible and consistent.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pillar 3: Constrained Budget Optimization */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <DollarSign size={22} color="#f59e0b" />
                <Typography variant="h6" fontWeight={700}>
                  3. Constrained Budget Allocation (SLSQP)
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.7 }}>
                Sequential Least Squares Programming (SLSQP) solves the non-linear diminishing returns marketing budget distribution,
                coupled with the Largest-Remainder method to guarantee exact rupee summation in LKR.
              </Typography>

              <Paper sx={{ p: 2, bgcolor: '#0c111d', border: '1px solid rgba(255, 255, 255, 0.04)', mb: 2, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700, display: 'block', mb: 1 }}>
                  OPTIMIZATION PROBLEM:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '0.8rem', lineHeight: 1.8 }}>
                  maximize: U(x) = ∑ s_k · ln(1 + x_k / c_k)<br />
                  subject to: ∑ x_k + x_reserve = B_total<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;L_k ≤ x_k ≤ U_k<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;x_reserve = 0.10 · B_total (Unallocated contingency)
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Integer rounding guarantee: ∑ (x_k) + x_reserve == B_total to the exact rupee.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pillar 4: System Usability Scale */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Award size={22} color="#10b981" />
                <Typography variant="h6" fontWeight={700}>
                  4. System Usability Scale (SUS - Brooke 1996)
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2, lineHeight: 1.7 }}>
                Standardized 10-item psychometric assessment measuring overall system usability, effectiveness, and cognitive load
                for Sri Lankan tech startup stakeholders.
              </Typography>

              <Paper sx={{ p: 2, bgcolor: '#0c111d', border: '1px solid rgba(255, 255, 255, 0.04)', mb: 2, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, display: 'block', mb: 1 }}>
                  SCORING FORMULA:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '0.8rem', lineHeight: 1.8 }}>
                  • Odd items (1, 3, 5, 7, 9): s_i = R_i - 1<br />
                  • Even items (2, 4, 6, 8, 10): s_i = 5 - R_i<br />
                  • Total Score: SUS = 2.5 · ∑ (s_i) ∈ [0, 100]<br />
                  • Research Target (NFR1): SUS ≥ 70.0 (Grade B / Good)
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Validated against industry benchmark distributions (Bangor et al., 2008).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bibliography & Sources */}
      <Card sx={{ mt: 4, bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Academic Citations &amp; Institutional Data Sources
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              1. <strong>Saaty, T. L. (1980).</strong> <em>The Analytic Hierarchy Process: Planning, Priority Setting, Resource Allocation</em>. McGraw-Hill, New York.
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              2. <strong>Brooke, J. (1996).</strong> SUS-A quick and dirty usability scale. <em>Usability evaluation in industry</em>, 189(194), 4-7.
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              3. <strong>Bangor, A., Kortum, P. T., &amp; Miller, J. T. (2008).</strong> An empirical evaluation of the system usability scale. <em>International Journal of Human-Computer Interaction</em>, 24(6), 574-594.
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              4. <strong>DataReportal (2024).</strong> <em>Digital 2024: Sri Lanka</em>. Kepios analysis on internet, social media, and mobile penetration rates in Sri Lanka.
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              5. <strong>Information and Communication Technology Agency of Sri Lanka (ICTA, 2023).</strong> <em>National IT-BPM Industry Review and SME Digitalization Report</em>.
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              6. <strong>SLASSCOM (2024).</strong> <em>Sri Lanka Technology Sector SME Enablement &amp; Marketing Framework</em>.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
