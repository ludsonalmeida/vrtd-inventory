// src/components/HeroSection.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
// Remova ou comente a importação local:
// import heroImage from '../assets/hero.jpg';

export default function HeroSection() {
  return (
    <Box
      sx={{
       backgroundImage: `url('https://d9hhrg4mnvzow.cloudfront.net/lp.porksbrasil.com.br/5ac1c8e2-1-desk_11hc0v4000000000000000.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: { xs: '50vh', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: '#fff',
      }}
    >
      {/* Overlay escuro para contraste do texto */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      />

      {/* Conteúdo do hero em cima da overlay */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          px: 2,
          maxWidth: '800px',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Porks Sobradinho
        </Typography>
        <Typography variant="h5" component="p" gutterBottom>
          O melhor porco e chope da região
        </Typography>
        <Button variant="contained" color="primary" size="large" sx={{ mt: 3 }}>
          Veja o Cardápio
        </Button>
      </Box>
    </Box>
  );
}
