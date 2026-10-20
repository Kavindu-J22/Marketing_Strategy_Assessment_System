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
} from '@mui/material';
import {
  Sparkles,
  Package,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  TrendingUp,
  AlertCircle,
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
          api.getProducts(),
          api.getAnalysisRuns(),
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Calculate actual KPIs strictly from saved database records
  const totalProducts = products.length;
  const totalRuns = runs.length;
  const budgets = runs
    .map((r) => r.input_summary?.monthly_budget_lkr)
    .filter((b) => typeof b === 'number');
  const avgBudget = budgets.length > 0 ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length) : 0;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 3 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
            Workspace Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            CeylonTech Solutions (Pvt) Ltd | Marketing Strategy Decision Support Hub
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Package size={18} />}
            onClick={() => navigate('/products')}
          >
            Manage Products
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Sparkles size={18} />}
            onClick={() => navigate('/wizard')}
          >
            New Assessment
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  REGISTERED PRODUCTS
                </Typography>
                <Package size={18} color="#0d9488" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {totalProducts}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Across Sri Lankan tech portfolio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  COMPLETED ANALYSES
                </Typography>
                <CheckCircle2 size={18} color="#0284c7" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                {totalRuns}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Persistent strategy runs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  AVG MONTHLY BUDGET
                </Typography>
                <DollarSign size={18} color="#10b981" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                LKR {avgBudget.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Exact integer rupee arithmetic
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                  EMPIRICAL VALIDATION
                </Typography>
                <AlertCircle size={18} color="#f59e0b" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#fbbf24', mt: 0.5 }}>
                Not Yet Validated
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Synthetic simulation models
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Strategy Analyses Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#f1f5f9' }}>
              Recent Strategy Assessments
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowRight size={16} />}
              onClick={() => navigate('/campaigns')}
              sx={{ color: '#0d9488' }}
            >
              View Full History
            </Button>
          </Box>

          {runs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, color: '#94a3b8' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                No marketing assessments recorded yet in this workspace.
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                Complete the 5-step questionnaire to generate your first AI-assisted marketing strategy report.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Sparkles size={16} />}
                onClick={() => navigate('/wizard')}
              >
                Start First Assessment
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>RUN ID</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>PRODUCT</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>ASSESSED LITERACY</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>MONTHLY BUDGET</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>PROVENANCE</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 600 }}>DATE</TableCell>
                    <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 600 }}>ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.slice(0, 5).map((run) => (
                    <TableRow key={run.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ color: '#f1f5f9', fontWeight: 500, fontFamily: 'monospace' }}>
                        {run.id}
                      </TableCell>
                      <TableCell sx={{ color: '#f1f5f9' }}>
                        {run.input_summary?.product_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={run.raw_results?.audience?.predicted_class || 'Medium'}
                          size="small"
                          sx={{
                            bgcolor:
                              run.raw_results?.audience?.predicted_class === 'High'
                                ? 'rgba(16, 185, 129, 0.2)'
                                : run.raw_results?.audience?.predicted_class === 'Low'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(245, 158, 11, 0.2)',
                            color:
                              run.raw_results?.audience?.predicted_class === 'High'
                                ? '#34d399'
                                : run.raw_results?.audience?.predicted_class === 'Low'
                                ? '#f87171'
                                : '#fbbf24',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#f1f5f9' }}>
                        LKR {(run.input_summary?.monthly_budget_lkr || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="synthetic_demo"
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        {new Date(run.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/campaigns/${run.id}`)}
                          sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
