import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Gauge,
  Server,
  Target,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Layers,
  Cpu,
  Database,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleDetail {
  id: number;
  title: string;
  member: string;
  role: string;
  icon: React.ReactNode;
  tag: string;
  color: string;
  badgeBg: string;
  description: string;
  methodology: string;
  metrics: string[];
  sharedIntegration: string;
  isMyComponent?: boolean;
}

const teamModules: ModuleDetail[] = [
  {
    id: 1,
    title: 'Product Performance Assessment',
    member: 'Team Member 1',
    role: 'Technical Performance & Architecture Researcher',
    icon: <Gauge size={26} color="#0284c7" />,
    tag: 'Module 1 • System Architecture',
    color: '#0284c7',
    badgeBg: '#e0f2fe',
    description:
      'Evaluates software microservice responsiveness, latency bottlenecks, database indexing efficiency, memory footprints, and code maintainability standards across Sri Lankan technology products.',
    methodology:
      'Automated APM telemetry, load testing benchmarks (Apache JMeter/k6), cyclomatic code complexity indices, and concurrency stress testing.',
    metrics: ['p95 Latency Thresholds', 'Throughput Capacity (RPS)', 'Codebase Maintainability Index', 'Database Query Efficiency'],
    sharedIntegration:
      'Feeds system performance scores into the shared PostgreSQL product catalog to calibrate marketing promises against actual technical capabilities.',
  },
  {
    id: 2,
    title: 'Infrastructure Assessment',
    member: 'Team Member 2',
    role: 'Cloud & DevOps Engineering Researcher',
    icon: <Server size={26} color="#7c3aed" />,
    tag: 'Module 2 • Cloud & DevOps',
    color: '#7c3aed',
    badgeBg: '#ede9fe',
    description:
      'Assesses multi-cloud hosting topologies (AWS/GCP/Azure), automated CI/CD deployment pipelines, disaster recovery failover mechanisms, and cloud infrastructure cost optimization (FinOps).',
    methodology:
      'Infrastructure as Code (IaC) static analysis, cloud readiness maturity models, multi-region redundancy simulations, and cost-drift analytics.',
    metrics: ['Cloud High-Availability SLA', 'Monthly Cloud Cost Efficiency', 'Deployment Frequency (DORA)', 'Mean Time to Recovery (MTTR)'],
    sharedIntegration:
      'Shares cloud hosting expenditure benchmarks with the marketing budget optimizer to balance promotional spend with infrastructure run-rates.',
  },
  {
    id: 3,
    title: 'Marketing Strategy Assessment',
    member: 'Team Member 3 (Lead Researcher)',
    role: 'AI, ML & Decision Science Specialist',
    icon: <Target size={26} color="#15803d" />,
    tag: 'Module 3 • Operational System (Current)',
    color: '#15803d',
    badgeBg: '#f7fee7',
    description:
      'Assesses customer technical literacy with a PyTorch Multimodal Classifier, translates specifications into value messaging with OpenAI RAG, prioritizes marketing channels via Saaty AHP (CR <= 0.10), and optimizes integer LKR budgets using SciPy SLSQP.',
    methodology:
      'PyTorch Multimodal Neural Fusion (TF-IDF + Likert tensors), OpenAI Responses API + Pinecone 3072d vector retrieval, Saaty Analytic Hierarchy Process, and SciPy SLSQP constrained optimization.',
    metrics: ['Audience Literacy Macro-F1: 90.69%', 'AHP Consistency Ratio: CR <= 0.10', '100% Exact LKR Budget Summation', 'Pinecone 3072d Grounded RAG Citations'],
    sharedIntegration:
      'Central operational hub orchestrating 21-question customer profiling, strategy report generation, and executive decision-support for founders.',
    isMyComponent: true,
  },
  {
    id: 4,
    title: 'Compliance Assessment',
    member: 'Team Member 4',
    role: 'Legal Tech & Regulatory Governance Researcher',
    icon: <ShieldCheck size={26} color="#ea580c" />,
    tag: 'Module 4 • Legal & Governance',
    color: '#ea580c',
    badgeBg: '#ffedd5',
    description:
      'Verifies statutory compliance with the Sri Lanka Personal Data Protection Act (PDPA No. 9 of 2022), GDPR cross-border rules, national digital tax/VAT invoice conformity, and cybersecurity audit standards.',
    methodology:
      'Statutory legal ontology mapping, automated privacy risk scoring, data residency verification, and statutory invoice rule validation.',
    metrics: ['PDPA Compliance Score (0-100)', 'Data Subject Rights Alignment', 'Statutory Tax Invoice Audit', 'Third-Party Risk Score'],
    sharedIntegration:
      'Ensures marketing campaigns and target audience communication strictly adhere to Sri Lankan customer consent and privacy regulations.',
  },
];

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<ModuleDetail | null>(null);

  const handleCardClick = (module: ModuleDetail) => {
    if (module.isMyComponent) {
      // Direct navigation to user's component system
      navigate('/dashboard');
    } else {
      // Show informative research modal for other team modules
      setSelectedModule(module);
    }
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', py: 3, px: { xs: 2, md: 4 } }}>
      {/* Hero Header */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.6, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 9999, mb: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <Sparkles size={14} color="#84cc16" />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Final Year Research Project • 4-Pillar Consulting Framework
          </Typography>
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', mb: 1.5 }}>
          Product & Service Management Consulting Platform
        </Typography>

        <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 840, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.6, mb: 4 }}>
          A collaborative academic research framework engineered for Sri Lankan technology companies.
          Four specialized research dimensions unite to provide holistic, evidence-based management consulting.
        </Typography>

        {/* Action Button Strip */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<ArrowRight size={18} />}
            onClick={() => navigate('/dashboard')}
            sx={{
              px: 3.5,
              py: 1.4,
              fontSize: '0.95rem',
              fontWeight: 700,
              bgcolor: '#bef264',
              color: '#14532d',
              '&:hover': { bgcolor: '#a3e635' },
            }}
          >
            Launch Marketing Strategy Assessment (My Component)
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/wizard')}
            sx={{
              px: 3,
              py: 1.4,
              fontSize: '0.95rem',
              fontWeight: 600,
              borderColor: '#e2e8f0',
              bgcolor: '#ffffff',
              color: '#0f172a',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
            }}
          >
            Start 21-Question Wizard
          </Button>
        </Box>
      </Box>

      {/* Quick Summary Pill Ribbon */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 5,
        }}
      >
        {[
          { label: 'Collaborative Modules', value: '4 Pillars', desc: 'Performance, Infra, Marketing, Legal' },
          { label: 'Benchmark Dataset', value: '5,000 Scenarios', desc: '1,000 Fictional Companies (Seed 20261020)' },
          { label: 'Decision Mathematics', value: 'AHP & SLSQP', desc: 'CR <= 0.10 & Exact Integer LKR Sum' },
          { label: 'Shared Architecture', value: 'Prisma & Pinecone', desc: 'PostgreSQL, Better Auth, OpenAI 3072d' },
        ].map((item, idx) => (
          <Box
            key={idx}
            sx={{
              bgcolor: '#ffffff',
              p: 2.2,
              borderRadius: '18px',
              border: '1px solid #eef2f6',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)',
            }}
          >
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
              {item.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              {item.value}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {item.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* The 4 Team Components Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            The 4 Research Framework Pillars
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Select any component to inspect its research scope. Click <strong>Marketing Strategy Assessment</strong> to enter your active system.
          </Typography>
        </Box>
      </Box>

      {/* 4 Interactive Component Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {teamModules.map((m) => {
          const isMy = !!m.isMyComponent;

          return (
            <Grid key={m.id} size={{ xs: 12, md: 6 }}>
              <Card
                onClick={() => handleCardClick(m)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderRadius: '22px',
                  backgroundColor: '#ffffff',
                  border: isMy ? '2px solid #bef264' : '1px solid #eef2f6',
                  boxShadow: isMy
                    ? '0 10px 30px -5px rgba(190, 242, 100, 0.3), 0 4px 12px rgba(0, 0, 0, 0.03)'
                    : '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.25s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isMy
                      ? '0 16px 36px -5px rgba(190, 242, 100, 0.4)'
                      : '0 12px 28px -4px rgba(15, 23, 42, 0.08)',
                    borderColor: isMy ? '#a3e635' : '#cbd5e1',
                  },
                }}
              >
                {/* Highlight banner for My Component */}
                {isMy && (
                  <Box
                    sx={{
                      bgcolor: '#bef264',
                      color: '#14532d',
                      py: 0.6,
                      px: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                      ★ Primary Active Component (My Research Component)
                    </Typography>
                    <Chip label="Live System Ready" size="small" sx={{ bgcolor: '#14532d', color: '#ffffff', height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                  </Box>
                )}

                <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Top Icon & Tag */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '16px',
                        bgcolor: m.badgeBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${m.color}33`,
                      }}
                    >
                      {m.icon}
                    </Box>

                    <Chip
                      label={m.tag}
                      size="small"
                      sx={{
                        bgcolor: m.badgeBg,
                        color: m.color,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        border: `1px solid ${m.color}33`,
                      }}
                    />
                  </Box>

                  {/* Component Title & Member */}
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                    {m.title}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1.5 }}>
                    {m.member} • {m.role}
                  </Typography>

                  {/* Description */}
                  <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.6, flexGrow: 1 }}>
                    {m.description}
                  </Typography>

                  {/* Metrics Pills */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
                    {m.metrics.slice(0, 3).map((met, i) => (
                      <Chip
                        key={i}
                        label={met}
                        size="small"
                        sx={{
                          bgcolor: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ mb: 2.5, borderColor: '#f1f5f9' }} />

                  {/* Bottom Action Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                      {isMy ? 'Operational Application' : 'Collaborative Partner Module'}
                    </Typography>

                    <Button
                      variant={isMy ? 'contained' : 'outlined'}
                      color={isMy ? 'secondary' : 'inherit'}
                      size="small"
                      endIcon={isMy ? <ArrowRight size={16} /> : <ExternalLink size={14} />}
                      sx={{
                        borderRadius: 9999,
                        px: 2.5,
                        fontWeight: 700,
                        ...(isMy
                          ? { bgcolor: '#bef264', color: '#14532d', '&:hover': { bgcolor: '#a3e635' } }
                          : { borderColor: '#e2e8f0', color: '#334155' }),
                      }}
                    >
                      {isMy ? 'Launch My System' : 'View Module Scope'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Information Modal for Partner Modules (1, 2, and 4) */}
      <Dialog
        open={Boolean(selectedModule)}
        onClose={() => setSelectedModule(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          },
        }}
      >
        {selectedModule && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: selectedModule.badgeBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedModule.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {selectedModule.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                    {selectedModule.member} ({selectedModule.role})
                  </Typography>
                </Box>
              </Box>

              <IconButton onClick={() => setSelectedModule(null)} sx={{ color: '#94a3b8' }}>
                <X size={20} />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: '#f1f5f9', py: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Research Scope & Problem Formulation:
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.6 }}>
                {selectedModule.description}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Scientific Methodology & Tools:
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.6 }}>
                {selectedModule.methodology}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Key Evaluation Metrics:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
                {selectedModule.metrics.map((m, idx) => (
                  <Chip key={idx} label={m} size="small" sx={{ bgcolor: '#f1f5f9', color: '#0f172a', fontWeight: 600 }} />
                ))}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                Consulting Framework Integration:
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', bgcolor: '#f8fafc', p: 1.5, borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.825rem' }}>
                {selectedModule.sharedIntegration}
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setSelectedModule(null)} sx={{ color: '#64748b' }}>
                Close
              </Button>

              <Button
                variant="contained"
                color="secondary"
                endIcon={<ArrowRight size={16} />}
                onClick={() => {
                  setSelectedModule(null);
                  navigate('/dashboard');
                }}
                sx={{
                  borderRadius: 9999,
                  bgcolor: '#bef264',
                  color: '#14532d',
                  fontWeight: 700,
                  px: 2.5,
                  '&:hover': { bgcolor: '#a3e635' },
                }}
              >
                Go to Marketing Strategy (My System)
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
