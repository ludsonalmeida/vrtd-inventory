import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function CardapioPage() {
  useEffect(() => {
    if (window.fbq) {
      window.fbq('trackCustom', 'Abriu Cardápio');
    }
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Nosso Cardápio
      </Typography>
      {/* Caso queira link direto em vez de iframe */}
       <Button href="https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio.pdf" target="_blank">
        Abrir Cardápio em PDF
      </Button>
    </Box>
  );
}
