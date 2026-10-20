import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark' = 'dark') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#0d9488', // Emerald/Teal 600
        light: '#14b8a6',
        dark: '#0f766e',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0284c7', // Sky 600
        light: '#38bdf8',
        dark: '#0369a1',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0b0f19' : '#f8fafc',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      success: {
        main: '#10b981',
      },
      warning: {
        main: '#f59e0b',
      },
      error: {
        main: '#ef4444',
      },
      info: {
        main: '#06b6d4',
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.125rem', fontWeight: 600 },
      h6: { fontSize: '1.0rem', fontWeight: 600 },
      subtitle1: { fontSize: '0.95rem', lineHeight: 1.5 },
      subtitle2: { fontSize: '0.85rem', fontWeight: 500 },
      body1: { fontSize: '0.925rem', lineHeight: 1.6 },
      body2: { fontSize: '0.825rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 18px',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 14px 0 rgba(13, 148, 136, 0.35)'
                : '0 4px 14px 0 rgba(13, 148, 136, 0.25)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.85)' : '#ffffff',
            backdropFilter: 'blur(12px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: isDark
              ? '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
              : '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
          },
        },
      },
    },
  });
};
