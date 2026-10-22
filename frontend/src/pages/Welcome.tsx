import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Compass,
  Cpu,
  Layers,
  DollarSign,
  ArrowRight,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 3 }}>
      {/* Hero Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Chip
          label="SLIIT Academic Research | J26-ISE-313"
          color="primary"
          variant="outlined"
          size="small"
          sx={{ mb: 2, fontWeight: 600, borderColor: '#0d9488' }}
        />
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#f8fafc' }}>
          Marketing Strategy Assessment System
        </Typography>
        <Typography variant="h6" sx={{ color: '#94a3b8', maxWidth: 800, mx: 'auto', fontWeight: 400, mb: 4 }}>
          A Product and Service Management Consulting Framework for Sri Lankan Technology Startups & SMEs.
          Integrates AI technical literacy classification, feature-to-value translation, AHP channel ranking, and constraint-aware budget allocation.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowRight size={18} />}
            onClick={() => navigate('/wizard')}
            sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
          >
            Launch Assessment Wizard
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{ px: 3, py: 1.5 }}
          >
            View Workspace Dashboard
          </Button>
        </Box>
      </Box>

      {/* Synthetic Dataset & Truth Constraints Warning Box */}


      {/* 4 Core Engines Overview */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#f1f5f9' }}>
        The Four Analytical Decision Engines
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(13, 148, 136, 0.2)' }}>
                  <Cpu color="#14b8a6" size={24} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  1. Audience Literacy Classifier (FR3)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Trained PyTorch Multimodal Neural Fusion network combining text descriptions and Likert comfort scores into Low, Medium, or High technical literacy with calibrated confidence.
              </Typography>
              <Chip label="PyTorch 2.10+ Multimodal" size="small" color="primary" sx={{ mr: 1 }} />
              <Chip label="Test Macro-F1: 90.69%" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(2, 132, 199, 0.2)' }}>
                  <Compass color="#38bdf8" size={24} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  2. Feature-to-Value Translator (FR4)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Server-side OpenAI structured generation service converting complex engineering features into tailored customer benefit statements with Pinecone RAG grounding and non-AI template fallbacks.
              </Typography>
              <Chip label="OpenAI Responses API" size="small" color="secondary" sx={{ mr: 1 }} />
              <Chip label="Pinecone 3072d RAG" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.2)' }}>
                  <Layers color="#f59e0b" size={24} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  3. AHP Channel Recommendation (FR5)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Analytical Hierarchy Process ranking across 8 Sri Lankan channels (Facebook, LinkedIn, Google Ads, TikTok, etc.) based on audience, goal, cost, reach, and content fit.
              </Typography>
              <Chip label="Saaty 1-9 Scale" size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', mr: 1 }} />
              <Chip label="Consistency Ratio CR <= 0.10" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.2)' }}>
                  <DollarSign color="#10b981" size={24} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  4. Constraint-Aware Budget Optimizer (FR6)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                Mathematical optimization in integer LKR with exact summation guarantee, minimum viable spend bounds, reserve funds, and comparison against equal-split baselines.
              </Typography>
              <Chip label="scipy.optimize SLSQP" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', mr: 1 }} />
              <Chip label="Exact Sum Guarantee (LKR)" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
