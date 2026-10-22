import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  BarChart2,
  Users,
  MessageSquare,
  RotateCcw,
  Download,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Product } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodsData, runsData] = await Promise.all([
          api.getProducts().catch(() => []),
          api.getAnalysisRuns().catch(() => []),
        ]);
        setProducts(prodsData || []);
        setRuns(runsData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestRun = runs.length > 0 ? runs[0] : null;
  const audienceClass = latestRun?.raw_results?.audience?.predicted_class || 'Moderate';
  const confidenceScore = latestRun?.raw_results?.audience?.confidence_score
    ? Math.round(latestRun.raw_results.audience.confidence_score * 100)
    : 50;

  const communicationStyle =
    audienceClass === 'High'
      ? 'Technical / Architectural & Formal'
      : audienceClass === 'Low'
      ? 'Simple / Metaphorical & Pain-Relief'
      : 'Balanced / Conversational';

  const jargonRule =
    audienceClass === 'High'
      ? 'Direct technical specifications, API standards, and system architecture are required.'
      : audienceClass === 'Low'
      ? 'Avoid technical jargon entirely; use practical day-to-day business analogies.'
      : 'Industry standard terminology is acceptable.';

  const coreMessage =
    latestRun?.raw_results?.feature_value_messages?.recommended_message ||
    latestRun?.raw_results?.feature_value_messages?.short_headline ||
    '"Delivering value and ease of use."';

  const painPoint =
    latestRun?.raw_results?.feature_value_messages?.addressed_pain_points?.[0] ||
    'Manual operational overhead';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress sx={{ color: '#0f172a' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', py: 2, px: { xs: 2, md: 3 } }}>
      {/* 1. TOP HEADER (Matching Nexaura Screenshot) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              mb: 0.5,
            }}
          >
            Marketing Strategy Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.925rem' }}>
            Actionable insights based on your product and audience data.
          </Typography>
        </Box>

        {/* Action Buttons (Reset & Save & Export) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={15} />}
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: 9999,
              borderColor: '#e2e8f0',
              bgcolor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.825rem',
              px: 2,
              py: 0.8,
              '&:hover': {
                bgcolor: '#f8fafc',
                borderColor: '#cbd5e1',
              },
            }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<Download size={16} color="#14532d" />}
            onClick={() => {
              if (latestRun) {
                navigate(`/campaigns/${latestRun.id}`);
              } else {
                navigate('/campaigns');
              }
            }}
            sx={{
              borderRadius: 9999,
              bgcolor: '#bef264',
              color: '#14532d',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.9,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#a3e635',
                boxShadow: '0 4px 12px rgba(163, 230, 53, 0.3)',
              },
            }}
          >
            Save & Export
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<Sparkles size={16} />}
            onClick={() => navigate('/wizard')}
            sx={{
              borderRadius: 9999,
              bgcolor: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.9,
              '&:hover': {
                bgcolor: '#1e293b',
              },
            }}
          >
            New Assessment
          </Button>
        </Box>
      </Box>

      {/* 2. THE THREE SIGNATURE CARDS (Matching Nexaura UI Design) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: Technical Literacy */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              border: '1px solid #eef2f6',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
              p: 1,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Card Header with circular icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                  }}
                >
                  <BarChart2 size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                  Technical Literacy
                </Typography>
              </Box>

              {/* Level & Score Grid */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    LEVEL
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {audienceClass}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    SCORE
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {confidenceScore}/100
                  </Typography>
                </Grid>
              </Grid>

              {/* Communication Style */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  COMMUNICATION STYLE
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                  {communicationStyle}
                </Typography>
              </Box>

              {/* Tags / Pills (Easy, Fast, Reliable) */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {['Easy', 'Fast', 'Reliable'].map((tag) => (
                  <Box
                    key={tag}
                    sx={{
                      px: 2,
                      py: 0.6,
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#334155',
                    }}
                  >
                    {tag}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Target Audience Profile */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              border: '1px solid #eef2f6',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
              p: 1,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Card Header with circular icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                  }}
                >
                  <Users size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                  Target Audience Profile
                </Typography>
              </Box>

              {/* Key Values List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Demographic', value: latestRun?.input_summary?.target_customer || 'All Ages • General' },
                  { label: 'Region', value: latestRun?.input_summary?.target_location || 'All of Sri Lanka' },
                  { label: 'Preferred Content', value: latestRun?.input_summary?.preferred_content?.[0] || 'Mixed Media' },
                  { label: 'Goals', value: latestRun?.input_summary?.business_goals?.[0] || 'Not specified' },
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                      borderBottom: idx < 3 ? '1px solid #f8fafc' : 'none',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Simplified Product Messaging */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              border: '1px solid #eef2f6',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
              p: 1,
            }}
          >
            <CardContent sx={{ p: 3.5 }}>
              {/* Card Header with circular icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                  }}
                >
                  <MessageSquare size={18} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                  Simplified Product Messaging
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Core Message & Pain Points */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    CORE MESSAGE
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: '#0f172a',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    {coreMessage}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    KEY PAIN POINTS SOLVED
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.6,
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        bgcolor: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      {painPoint}
                    </Box>
                  </Box>
                </Grid>

                {/* Jargon Translation Rule Inset Box */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontSize: '0.7rem',
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    JARGON TRANSLATION RULE
                  </Typography>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: '16px',
                      border: '1px solid #eef2f6',
                      bgcolor: '#f8fafc',
                      color: '#334155',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {jargonRule}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. RECENT STRATEGY ASSESSMENTS TABLE */}
      <Card
        sx={{
          borderRadius: '24px',
          backgroundColor: '#ffffff',
          border: '1px solid #eef2f6',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
          p: 1,
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Completed Strategy Assessments
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Historical evaluations generated across Sri Lankan technology products
              </Typography>
            </Box>

            <Button
              size="small"
              endIcon={<ArrowRight size={15} />}
              onClick={() => navigate('/campaigns')}
              sx={{ color: '#0f172a', fontWeight: 700 }}
            >
              View All History
            </Button>
          </Box>

          {runs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, color: '#64748b' }}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                No strategy assessments recorded yet in this workspace.
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Run the 21-question assessment wizard to predict audience literacy and allocate your marketing budget.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Sparkles size={16} />}
                onClick={() => navigate('/wizard')}
                sx={{ bgcolor: '#bef264', color: '#14532d', fontWeight: 700 }}
              >
                Start First Assessment
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>RUN ID</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>PRODUCT NAME</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>LITERACY TIER</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>MONTHLY BUDGET</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>PROVENANCE</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>DATE</TableCell>
                    <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.slice(0, 5).map((run) => {
                    const tier = run.raw_results?.audience?.predicted_class || 'Medium';
                    const budget = run.input_summary?.monthly_budget_lkr || 0;

                    return (
                      <TableRow key={run.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {run.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 700 }}>
                          {run.input_summary?.product_name || 'FinTech Cloud ERP'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tier}
                            size="small"
                            sx={{
                              bgcolor:
                                tier === 'High'
                                  ? '#dcfce7'
                                  : tier === 'Low'
                                  ? '#fee2e2'
                                  : '#fef3c7',
                              color:
                                tier === 'High'
                                  ? '#15803d'
                                  : tier === 'Low'
                                  ? '#b91c1c'
                                  : '#b45309',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>
                          LKR {budget.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="synthetic_demo"
                            size="small"
                            sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {new Date(run.created_at || Date.now()).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/campaigns/${run.id}`)}
                            sx={{
                              py: 0.4,
                              px: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderColor: '#e2e8f0',
                              color: '#0f172a',
                              borderRadius: 9999,
                            }}
                          >
                            View Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
