// src/components/Layout.jsx
import React from 'react';
import { Box, Container } from '@mui/material';
import NavBarRestrita from './NavBarRestrita';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
    >
      <NavBarRestrita />
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
}