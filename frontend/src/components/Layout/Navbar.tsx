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
  Compass,
  Cpu,
  Building,
  HelpCircle,
  BarChart2,
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
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: 3 }}>
        {/* Brand / Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(13, 148, 136, 0.4)',
            }}
          >
            <Compass color="#ffffff" size={22} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
              Marketing Strategy Assessment
            </Typography>
            <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600 }}>
              Consulting Framework Component | Sri Lankan Tech Companies
            </Typography>
          </Box>
        </Box>

        {/* Center / Workspace & Model Status */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<Building size={14} color="#38bdf8" />}
            label="CeylonTech Solutions (Pvt) Ltd"
            size="small"
            sx={{
              backgroundColor: 'rgba(2, 132, 199, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontWeight: 500,
            }}
          />
          <Chip
            icon={<Cpu size={14} color="#10b981" />}
            label="PyTorch Multimodal Fusion Net: Online"
            size="small"
            sx={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 500,
            }}
          />
        </Box>

        {/* Right Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Research Methodology & Citations">
            <IconButton onClick={() => navigate('/methodology')} sx={{ color: '#94a3b8' }}>
              <HelpCircle size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Usability Survey (SUS)">
            <IconButton onClick={() => navigate('/usability/sus')} sx={{ color: '#94a3b8' }}>
              <BarChart2 size={20} />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: '#0d9488',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            CT
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
