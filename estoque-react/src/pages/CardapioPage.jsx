import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

export default function CardapioPage() {
  useEffect(() => {
    if (window.fbq) {
      window.fbq('trackCustom', 'Abriu Cardápio');
    }
  }, []);

  return (
    <Box component="main" sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nosso Cardápio
      </Typography>
      {/* Conteúdo do cardápio: PDF embutido ou lista de itens */}
      <Box
        component="iframe"
        src="https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio.pdf"
        width="100%"
        height="calc(100vh - 160px)"
        sx={{ border: 0 }}
        title="Cardápio Completo"
      />
    </Box>
  );
}
