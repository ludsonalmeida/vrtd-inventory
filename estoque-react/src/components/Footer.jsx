// src/components/Footer.jsx
import React from 'react';
import { Box, Typography, Link, Container, Grid, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function Footer() {
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
              Porks Sobradinho
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quadra 01, CL 3, Lote 07 – Sobradinho, DF
              <br />
              (61) 93500-3917
              <br />
              Horário: Seg-Dom, 17h – 01h
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Siga nas redes
            </Typography>
            <Box>
              <IconButton
                component={Link}
                href="https://www.facebook.com/porks.sobradinho"
                target="_blank"
                color="inherit"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="https://www.instagram.com/porks_sobradinho"
                target="_blank"
                color="inherit"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                component={Link}
                href="https://wa.me/5561935003917"
                target="_blank"
                color="inherit"
              >
                <WhatsAppIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Porks Sobradinho – Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
