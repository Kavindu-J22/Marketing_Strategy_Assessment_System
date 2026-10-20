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
} from '@mui/material';
import {
  LayoutDashboard,
  Package,
  Sparkles,
  History,
  GitBranch,
  Layers,
  Award,
  HelpCircle,
  BarChart,
  Home,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: 'Overview & Disclaimer', path: '/', icon: <Home size={18} /> },
  { label: 'Workspace Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Company Products', path: '/products', icon: <Package size={18} /> },
  { label: 'Marketing Wizard (Q1-Q21)', path: '/wizard', icon: <Sparkles size={18} />, badge: '5 Steps' },
  { label: 'Assessment Reports', path: '/campaigns', icon: <History size={18} /> },
];

const researchNavItems: NavItem[] = [
  { label: 'AHP Expert Pairwise UI', path: '/expert/ahp', icon: <Layers size={18} /> },
  { label: 'Model Evaluation Registry', path: '/research/evaluation', icon: <BarChart size={18} /> },
  { label: 'Usability Evaluation (SUS)', path: '/usability/sus', icon: <Award size={18} /> },
  { label: 'Methodology & Sources', path: '/methodology', icon: <HelpCircle size={18} /> },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          px: 3,
          py: 1,
          display: 'block',
          color: '#64748b',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.7rem',
        }}
      >
        {title}
      </Typography>
      <List dense sx={{ px: 1.5 }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  backgroundColor: isActive ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
                  color: isActive ? '#14b8a6' : '#94a3b8',
                  border: isActive ? '1px solid rgba(13, 148, 136, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    color: '#f1f5f9',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActive ? '#14b8a6' : '#64748b',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                    },
                  }}
                />
                {item.badge && (
                  <Box
                    sx={{
                      fontSize: '0.675rem',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: '#0d9488',
                      color: '#ffffff',
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        backgroundColor: '#0c111d',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 64px - 32px)',
      }}
    >
      <Box sx={{ py: 2 }}>
        {renderNavGroup('Decision Support', mainNavItems)}
        <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />
        {renderNavGroup('Research & Evaluation', researchNavItems)}
      </Box>

      {/* Footer Info */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.725rem' }}>
          Research Proposal: <strong>J26-ISE-313</strong>
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.725rem' }}>
          Target: Sri Lankan Tech SMEs
        </Typography>
      </Box>
    </Box>
  );
};
