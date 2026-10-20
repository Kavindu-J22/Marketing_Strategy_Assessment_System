import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  History,
  Eye,
  GitCompare,
  Plus,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analysisApi } from '../lib/api';

export const CampaignHistory: React.FC = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Demo runs matching synthetic scenario structures
  const defaultRuns = [
    {
      id: 'run-001',
      productName: 'Apex Cloud ERP',
      companyName: 'Lanka Tech Solutions Ltd',
      audienceLevel: 'Low',
      confidence: 0.94,
      monthlyBudget: 250000,
      allocatedChannels: 4,
      createdAt: '2026-10-18T14:20:00Z',
      strategyStatus: 'COMPLETED',
    },
    {
      id: 'run-002',
      productName: 'PayLanka Micro-Gateway',
      companyName: 'Colombo Fintech Labs',
      audienceLevel: 'Medium',
      confidence: 0.89,
      monthlyBudget: 500000,
      allocatedChannels: 5,
      createdAt: '2026-10-19T09:45:00Z',
      strategyStatus: 'COMPLETED',
    },
    {
      id: 'run-003',
      productName: 'DevPulse CI/CD Pipeline',
      companyName: 'Kandy Software Systems',
      audienceLevel: 'High',
      confidence: 0.96,
      monthlyBudget: 150000,
      allocatedChannels: 3,
      createdAt: '2026-10-20T11:15:00Z',
      strategyStatus: 'COMPLETED',
    },
  ];

  useEffect(() => {
    const fetchRuns = async () => {
      setLoading(true);
      try {
        const res = await analysisApi.listRuns();
        if (res.data && res.data.length > 0) {
          setRuns(res.data);
        } else {
          setRuns(defaultRuns);
        }
      } catch (err) {
        setRuns(defaultRuns);
      } finally {
        setLoading(false);
      }
    };
    fetchRuns();
  }, []);

  const getAudienceColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
      case 'medium':
        return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' };
      case 'high':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8' };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <History size={28} color="#14b8a6" />
            <Typography variant="h4" fontWeight={700}>
              Assessment Reports &amp; History
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Browse and inspect previous multi-criteria marketing strategy assessments for Sri Lankan tech products.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<GitCompare size={16} />}
            onClick={() => navigate('/campaigns/compare')}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#f1f5f9' }}
          >
            Compare Runs
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => navigate('/wizard')}
            sx={{ bgcolor: '#0d9488', '&:hover': { bgcolor: '#0f766e' } }}
          >
            New Assessment (Q1–Q21)
          </Button>
        </Box>
      </Box>

      {/* Runs Table */}
      <Card sx={{ bgcolor: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Assessment ID</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Product &amp; Company</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Audience Literacy</TableCell>
                  <TableCell align="right" sx={{ color: '#94a3b8', fontWeight: 700 }}>Monthly Budget (LKR)</TableCell>
                  <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 700 }}>Channels</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Execution Date</TableCell>
                  <TableCell align="center" sx={{ color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {runs.map((run) => {
                  const audStyle = getAudienceColor(run.audienceLevel);
                  return (
                    <TableRow key={run.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                      <TableCell sx={{ color: '#38bdf8', fontWeight: 600 }}>
                        {run.id}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9' }}>
                          {run.productName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {run.companyName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${run.audienceLevel} (${Math.round((run.confidence || 0.9) * 100)}%)`}
                          size="small"
                          sx={{
                            bgcolor: audStyle.bg,
                            color: audStyle.text,
                            fontWeight: 600,
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                        LKR {run.monthlyBudget?.toLocaleString()}
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#94a3b8' }}>
                        {run.allocatedChannels} Channels
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.825rem' }}>
                        {new Date(run.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Full Strategy Report" arrow>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/campaigns/${run.id}`)}
                            sx={{ color: '#14b8a6', '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.1)' } }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
