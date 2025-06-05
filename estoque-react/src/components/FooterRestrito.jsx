// src/components/Footer.jsx
import React from 'react';
import { Box, Typography, Link } from '@mui/material';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 2,
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="body2" color="textSecondary">
        &copy; {year} Virtude Digital. Todos os direitos reservados.  
        Contato:{" "}
        <Link
          href="mailto:ludson@virtudedigital.com.br"
          color="inherit"
          underline="always"
        >
          ludson@virtudedigital.com.br
        </Link>
      </Typography>
    </Box>
  );
}
