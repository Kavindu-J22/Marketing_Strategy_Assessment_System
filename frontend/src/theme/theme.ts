import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode: 'light' | 'dark' = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#38bdf8' : '#0f172a', // Clean Deep Slate in light mode
        light: isDark ? '#7dd3fc' : '#1e293b',
        dark: isDark ? '#0284c7' : '#020617',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#bef264', // Nexaura Signature Pistachio / Lime Accent
        light: '#d9f99d',
        dark: '#a3e635',
        contrastText: '#14532d',
      },
      background: {
        default: isDark ? '#0b0f19' : '#f8fafc',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
      },
      info: {
        main: '#0284c7',
        light: '#38bdf8',
        dark: '#0369a1',
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: isDark ? '#f8fafc' : '#0f172a' },
      h2: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: isDark ? '#f8fafc' : '#0f172a' },
      h3: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: isDark ? '#f8fafc' : '#0f172a' },
      h4: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em', color: isDark ? '#f8fafc' : '#0f172a' },
      h5: { fontSize: '1.125rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#0f172a' },
      h6: { fontSize: '1.0rem', fontWeight: 600, color: isDark ? '#f1f5f9' : '#0f172a' },
      subtitle1: { fontSize: '0.95rem', lineHeight: 1.5, color: isDark ? '#94a3b8' : '#64748b' },
      subtitle2: { fontSize: '0.85rem', fontWeight: 500, color: isDark ? '#94a3b8' : '#64748b' },
      body1: { fontSize: '0.925rem', lineHeight: 1.6, color: isDark ? '#cbd5e1' : '#334155' },
      body2: { fontSize: '0.825rem', lineHeight: 1.5, color: isDark ? '#94a3b8' : '#64748b' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 9999, // Pill shaped buttons matching Nexaura UI
            padding: '8px 22px',
            boxShadow: 'none',
            fontSize: '0.875rem',
            transition: 'all 0.15s ease-in-out',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-1px)',
            },
          },
          containedSecondary: {
            backgroundColor: '#bef264',
            color: '#14532d',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: '#a3e635',
              boxShadow: '0 4px 12px rgba(163, 230, 53, 0.35)',
            },
          },
          outlined: {
            borderColor: '#e2e8f0',
            color: isDark ? '#f1f5f9' : '#334155',
            backgroundColor: isDark ? 'transparent' : '#ffffff',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20, // Ultra-modern soft rounded corners
            backgroundImage: 'none',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #eef2f6',
            boxShadow: isDark
              ? '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
              : '0 4px 24px -2px rgba(15, 23, 42, 0.04), 0 1px 4px -1px rgba(15, 23, 42, 0.02)',
            transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderRadius: 18,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 9999, // Pill chips
            fontSize: '0.75rem',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
            padding: '14px 16px',
          },
          head: {
            fontWeight: 700,
            color: isDark ? '#94a3b8' : '#64748b',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: isDark ? '#94a3b8' : '#334155',
            fontWeight: 600,
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: isDark ? '#38bdf8' : '#0f172a',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#38bdf8' : '#94a3b8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#38bdf8' : '#0f172a',
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: isDark ? '#334155' : '#e2e8f0',
            '&.Mui-active': {
              color: '#0f172a',
            },
            '&.Mui-completed': {
              color: '#10b981',
            },
          },
        },
      },
    },
  });
};
