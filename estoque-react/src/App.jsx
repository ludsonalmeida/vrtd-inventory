// src/App.jsx
import React from 'react';
import AppRoutes from './routes';
import { Container, Box, CssBaseline } from '@mui/material';

export default function App() {
  return (
    <>
      <CssBaseline />
      {/* Container com padding responsivo e sem overflow horizontal */}
      <Box sx={{ overflowX: 'hidden' }}>
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 1, sm: 2, md: 4 }, width: '100%' }}
        >
          <AppRoutes />
        </Container>
      </Box>
    </>
  );
}
