import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Bell,
  HelpCircle,
  BarChart2,
  Grid as GridIcon,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

export const Navbar: React.FC<Props> = () => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eef2f6',
        zIndex: 1200,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: 3 }}>
        {/* Brand / Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          {/* Nexaura Logo Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <GridIcon size={16} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              nexaura<Box component="span" sx={{ color: '#84cc16' }}>.</Box>
            </Typography>
          </Box>

          <Box sx={{ height: 20, width: '1px', bgcolor: '#e2e8f0', mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', lineHeight: 1.2 }}>
              Product & Service Management Consulting Platform
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
              SLIIT Academic Research 2026 • 4 Collaborative Components
            </Typography>
          </Box>
        </Box>

        {/* Center / Research Pillar Badges */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1.5 }}>
          <Chip
            icon={<Sparkles size={14} color="#166534" />}
            label="Component 3: Marketing Strategy (Active)"
            size="small"
            sx={{
              backgroundColor: '#f7fee7',
              color: '#15803d',
              border: '1px solid #d9f99d',
              fontWeight: 700,
              px: 0.5,
            }}
          />
          <Chip
            label="PyTorch Multimodal + AHP + SLSQP"
            size="small"
            sx={{
              backgroundColor: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Right Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Research Methodology & Citations">
            <IconButton onClick={() => navigate('/methodology')} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <HelpCircle size={19} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Usability Survey (SUS)">
            <IconButton onClick={() => navigate('/usability/sus')} sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <BarChart2 size={19} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
              <Bell size={19} />
            </IconButton>
          </Tooltip>

          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1.5, pl: 1.5, borderLeft: '1px solid #e2e8f0' }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              AJ
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                Alex Jensen
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Lead Researcher
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
