// src/components/FooterRestrito.jsx
import React from 'react';
import { Box, Typography, Link, Container, Grid } from '@mui/material';

export default function FooterRestrito() {
  const year = new Date().getFullYear();
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        bgcolor: 'background.paper',
        mt: 8,
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              PorkStoq - CMV Inteligente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © {year} PorkStoq — Todos os direitos reservados.
              <br />
              Versão do Sistema: 1.0.0
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Suporte
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Para dúvidas, entre em contato:
              <br />
              <Link href="mailto:support@porkstoq.com.br" color="inherit" underline="always">
                support@porkstoq.com.br
              </Link>
              <br />
              Horário: Seg–Sex, 09h–18h
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
