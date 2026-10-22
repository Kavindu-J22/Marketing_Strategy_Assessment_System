import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Briefcase,
  Store,
  Plus,
  LayoutGrid,
  Sparkles,
  FileText,
  Layers,
  BarChart,
  HelpCircle,
  LogOut,
  Target,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BusinessItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  active?: boolean;
}

const mockBusinesses: BusinessItem[] = [
  { id: '1', name: 'FinTech Startup', icon: <Briefcase size={16} />, active: true },
  { id: '2', name: 'E-Commerce Store', icon: <Store size={16} />, active: false },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #eef2f6',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        py: 2.5,
        px: 2,
        overflowY: 'auto',
      }}
    >
      {/* 1. MY BUSINESSES Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 1.2,
            display: 'block',
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
          }}
        >
          My Businesses
        </Typography>

        <List dense disablePadding>
          {mockBusinesses.map((b) => (
            <ListItem key={b.id} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                sx={{
                  borderRadius: '14px',
                  py: 1,
                  px: 1.5,
                  backgroundColor: b.active ? '#f3f1fb' : 'transparent',
                  color: b.active ? '#1e1b4b' : '#64748b',
                  fontWeight: b.active ? 700 : 500,
                  border: b.active ? '1px solid #e0e7ff' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: b.active ? '#ece9fb' : '#f8fafc',
                    color: '#0f172a',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 28,
                    color: b.active ? '#4338ca' : '#94a3b8',
                  }}
                >
                  {b.icon}
                </ListItemIcon>
                <ListItemText
                  primary={b.name}
                  slotProps={{
                    primary: {
                      fontSize: '0.85rem',
                      fontWeight: b.active ? 700 : 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Add New Business Pill Button */}
          <ListItem disablePadding sx={{ mt: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/products')}
              sx={{
                borderRadius: '14px',
                py: 0.8,
                px: 1.5,
                border: '1px dashed #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  borderColor: '#94a3b8',
                  color: '#0f172a',
                },
              }}
            >
              <Plus size={15} color="#94a3b8" />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Add New Business
              </Typography>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

      {/* 2. MAIN NAVIGATION */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 1,
            display: 'block',
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
          }}
        >
          Framework Platform
        </Typography>

        <List dense disablePadding>
          {/* Platform Dashboard / Home with 4 modules */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/')}
              sx={{
                borderRadius: '14px',
                py: 0.9,
                px: 1.5,
                backgroundColor: isCurrent('/') ? '#f1f5f9' : 'transparent',
                color: isCurrent('/') ? '#0f172a' : '#64748b',
                fontWeight: isCurrent('/') ? 700 : 500,
                border: isCurrent('/') ? '1px solid #e2e8f0' : '1px solid transparent',
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: isCurrent('/') ? '#0f172a' : '#94a3b8' }}>
                <LayoutGrid size={16} />
              </ListItemIcon>
              <ListItemText
                primary="Platform Hub (4 Pillars)"
                slotProps={{ primary: { fontSize: '0.85rem', fontWeight: isCurrent('/') ? 700 : 500 } }}
              />
            </ListItemButton>
          </ListItem>

          {/* My Component: Marketing Strategy Dashboard */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: '14px',
                py: 0.9,
                px: 1.5,
                backgroundColor: isCurrent('/dashboard') ? '#f7fee7' : 'transparent',
                color: isCurrent('/dashboard') ? '#15803d' : '#64748b',
                fontWeight: isCurrent('/dashboard') ? 700 : 500,
                border: isCurrent('/dashboard') ? '1px solid #d9f99d' : '1px solid transparent',
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: isCurrent('/dashboard') ? '#16a34a' : '#94a3b8' }}>
                <Target size={16} />
              </ListItemIcon>
              <ListItemText
                primary="Marketing Dashboard"
                slotProps={{ primary: { fontSize: '0.85rem', fontWeight: isCurrent('/dashboard') ? 700 : 500 } }}
              />
              <Chip label="My Module" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
            </ListItemButton>
          </ListItem>

          {/* Assessment Wizard */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/wizard')}
              sx={{
                borderRadius: '14px',
                py: 0.9,
                px: 1.5,
                backgroundColor: isCurrent('/wizard') ? '#f1f5f9' : 'transparent',
                color: isCurrent('/wizard') ? '#0f172a' : '#64748b',
                fontWeight: isCurrent('/wizard') ? 700 : 500,
                border: isCurrent('/wizard') ? '1px solid #e2e8f0' : '1px solid transparent',
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: isCurrent('/wizard') ? '#0f172a' : '#94a3b8' }}>
                <Sparkles size={16} />
              </ListItemIcon>
              <ListItemText
                primary="Assessment Wizard"
                slotProps={{ primary: { fontSize: '0.85rem', fontWeight: isCurrent('/wizard') ? 700 : 500 } }}
              />
            </ListItemButton>
          </ListItem>

          {/* Strategy Reports */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/campaigns')}
              sx={{
                borderRadius: '14px',
                py: 0.9,
                px: 1.5,
                backgroundColor: isCurrent('/campaigns') ? '#f1f5f9' : 'transparent',
                color: isCurrent('/campaigns') ? '#0f172a' : '#64748b',
                fontWeight: isCurrent('/campaigns') ? 700 : 500,
                border: isCurrent('/campaigns') ? '1px solid #e2e8f0' : '1px solid transparent',
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: isCurrent('/campaigns') ? '#0f172a' : '#94a3b8' }}>
                <FileText size={16} />
              </ListItemIcon>
              <ListItemText
                primary="Strategy Reports"
                slotProps={{ primary: { fontSize: '0.85rem', fontWeight: isCurrent('/campaigns') ? 700 : 500 } }}
              />
            </ListItemButton>
          </ListItem>

          {/* AHP Channel Matrix */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/expert/ahp')}
              sx={{
                borderRadius: '14px',
                py: 0.9,
                px: 1.5,
                backgroundColor: isCurrent('/expert/ahp') ? '#f1f5f9' : 'transparent',
                color: isCurrent('/expert/ahp') ? '#0f172a' : '#64748b',
                fontWeight: isCurrent('/expert/ahp') ? 700 : 500,
                border: isCurrent('/expert/ahp') ? '1px solid #e2e8f0' : '1px solid transparent',
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: isCurrent('/expert/ahp') ? '#0f172a' : '#94a3b8' }}>
                <Layers size={16} />
              </ListItemIcon>
              <ListItemText
                primary="AHP Channel Matrix"
                slotProps={{ primary: { fontSize: '0.85rem', fontWeight: isCurrent('/expert/ahp') ? 700 : 500 } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

      {/* 3. RESEARCH & EVALUATION */}
      <Box sx={{ mb: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 1,
            display: 'block',
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
          }}
        >
          Research Governance
        </Typography>

        <List dense disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/research/evaluation')}
              sx={{
                borderRadius: '14px',
                py: 0.8,
                px: 1.5,
                backgroundColor: isCurrent('/research/evaluation') ? '#f1f5f9' : 'transparent',
                color: isCurrent('/research/evaluation') ? '#0f172a' : '#64748b',
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: '#94a3b8' }}>
                <BarChart size={16} />
              </ListItemIcon>
              <ListItemText primary="ML Model Evaluation" slotProps={{ primary: { fontSize: '0.825rem' } }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/methodology')}
              sx={{
                borderRadius: '14px',
                py: 0.8,
                px: 1.5,
                backgroundColor: isCurrent('/methodology') ? '#f1f5f9' : 'transparent',
                color: isCurrent('/methodology') ? '#0f172a' : '#64748b',
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: '#94a3b8' }}>
                <HelpCircle size={16} />
              </ListItemIcon>
              <ListItemText primary="Methodology & Truth" slotProps={{ primary: { fontSize: '0.825rem' } }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* 4. Bottom User Profile Card */}
      <Box
        sx={{
          pt: 2,
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            AJ
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Alex Jensen
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              alex@example.com
            </Typography>
          </Box>
        </Box>

        <ListItemButton
          onClick={() => navigate('/products')}
          sx={{
            minWidth: 'auto',
            p: 1,
            borderRadius: '10px',
            color: '#94a3b8',
            '&:hover': { color: '#0f172a', bgcolor: '#f8fafc' },
          }}
        >
          <LogOut size={16} />
        </ListItemButton>
      </Box>
    </Box>
  );
};
