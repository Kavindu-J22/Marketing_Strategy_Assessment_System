import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getAppTheme } from './theme/theme';

// Layout
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';

// Pages
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { AssessmentWizard } from './pages/AssessmentWizard';
import { StrategyReport } from './pages/StrategyReport';
import { CampaignHistory } from './pages/CampaignHistory';
import { CampaignComparison } from './pages/CampaignComparison';
import { AHPMatrixExpert } from './pages/AHPMatrixExpert';
import { ResearchEvaluation } from './pages/ResearchEvaluation';
import { SUSSurvey } from './pages/SUSSurvey';
import { Methodology } from './pages/Methodology';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const theme = getAppTheme('light');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', bgcolor: '#f8fafc' }}>
            {/* Top Navigation Bar */}
            <Navbar />

            {/* Main Content Area with Fixed Sidebar */}
            <Box sx={{ display: 'flex', flexGrow: 1, width: '100%', overflow: 'hidden' }}>
              <Sidebar />

              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: { xs: 2.5, md: 4 },
                  overflowY: 'auto',
                  height: 'calc(100vh - 64px)',
                  bgcolor: '#f8fafc',
                }}
              >
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/wizard" element={<AssessmentWizard />} />
                  <Route path="/campaigns" element={<CampaignHistory />} />
                  <Route path="/campaigns/compare" element={<CampaignComparison />} />
                  <Route path="/campaigns/:runId" element={<StrategyReport />} />
                  <Route path="/expert/ahp" element={<AHPMatrixExpert />} />
                  <Route path="/research/evaluation" element={<ResearchEvaluation />} />
                  <Route path="/usability/sus" element={<SUSSurvey />} />
                  <Route path="/methodology" element={<Methodology />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
