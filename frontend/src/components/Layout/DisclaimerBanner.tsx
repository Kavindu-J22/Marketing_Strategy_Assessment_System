import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface Props {
  provenance?: string;
  isEmpiricallyValidated?: boolean;
}

export const DisclaimerBanner: React.FC<Props> = ({
  provenance = 'synthetic_demo',
  isEmpiricallyValidated = false,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: '#451a03',
        color: '#fef3c7',
        borderBottom: '1px solid #78350f',
        py: 0.75,
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        fontSize: '0.8125rem',
        fontWeight: 500,
        zIndex: 1100,
      }}
    >
      <ShieldAlert size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
      <Typography variant="caption" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
        <strong>ACADEMIC RESEARCH PROTOTYPE:</strong> Dataset provenance is{' '}
        <span style={{ textDecoration: 'underline' }}>100% SYNTHETIC SIMULATION</span> (5,000 scenarios, 1,000 fictional companies). All ML predictions, AHP rankings, and budget distributions are illustrative models and{' '}
        <strong>NOT YET EMPIRICALLY VALIDATED</strong> on live market campaigns.
      </Typography>
    </Box>
  );
};
