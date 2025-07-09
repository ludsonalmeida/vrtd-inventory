// src/pages/RedirectPage.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PixelLoader from '../components/PixelLoader';

const logoUrl = 'https://porks.nyc3.cdn.digitaloceanspaces.com/porks-logo.png';
const WHATSAPP_GROUP = 'https://chat.whatsapp.com/H2syN6U59tvKaFVvxweBVJ';

export default function RedirectPage() {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Meta Pixel
    if (window.fbq) {
      window.fbq('trackCustom', 'Lead WPP Redirect');
    }
    // GA4
    if (typeof gtag === 'function') {
      gtag('event', 'lead_wpp_redirect', {
        event_category: 'Lead',
        event_label: 'WhatsApp Group Redirect',
      });
    }

    // Contagem regressiva
    const intervalId = setInterval(() => {
      setCountdown((c) => Math.max(c - 1, 0));
    }, 1000);

    // Redireciona após 5s
    const timeoutId = setTimeout(() => {
      window.location.href = WHATSAPP_GROUP;
    }, 3000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

   <PixelLoader />
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        component="img"
        src={logoUrl}
        alt="Logo Porks"
        sx={{
          width: { xs: 150, sm: 200, md: 240 },
          mb: 4,
        }}
      />

      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Alfa Slab One',
          fontWeight: 400,
          mb: 2,
          textAlign: 'center',
        }}
      >
        Redirecionando para o grupo do WhatsApp...
      </Typography>

      <CircularProgress />

      <Typography
        variant="body2"
        sx={{
          fontWeight: 400,
          mt: 2,
          color: theme.palette.text.secondary,
        }}
      >
        Você será redirecionado em {countdown} segundo{countdown !== 1 ? 's' : ''}.
      </Typography>
    </Box>
  );
}
