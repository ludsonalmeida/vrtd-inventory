import React from 'react';
import { Box, Typography, Chip, AppBar, Toolbar, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// URL do logo
const logoUrl = 'https://porks.nyc3.cdn.digitaloceanspaces.com/porks-logo.png';

// Dados dos chopes
const chopes = [
  {
    name: 'Cruls Puro Malte',
    description: 'Chope puro malte, leve e refrescante, com notas suaves de malte tostado.',
    ibu: 18,
    abv: 4.8,
    image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/chopes/cruls-puro-malte.jpg'
  },
  {
    name: 'Session IPA',
    description: 'Session IPA com aromas cítricos, lúpulo intenso e corpo leve.',
    ibu: 40,
    abv: 4.5,
    image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/chopes/session-ipa.jpg'
  },
  {
    name: 'Mafia IPA',
    description: 'IPA encorpada e lupulada, com notas de frutas tropicais.',
    ibu: 60,
    abv: 6.5,
    image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/chopes/mafia-ipa.jpg'
  },
];

export default function ChopesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>      
      <AppBar position="sticky" sx={{ bgcolor: '#F59E0B', color: '#fff' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton edge="start" color="inherit" onClick={() => window.history.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Box component="img" src={logoUrl} alt="Logo Porks" sx={{ height: 40 }} />
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      {/* Container com espaçamento lateral para os itens respirarem */}
      <Box sx={{ mt: 1, px: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{
            fontFamily: 'Alfa Slab One',
            fontWeight: 400,
            mb: 1,
            textAlign: 'center',
            color: '#fff'
          }}
        >
          Nossos Chopes
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {chopes.map((chope) => (
            <Box
              key={chope.name}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 1,
                boxShadow: 1,
                overflow: 'hidden',
                mx: 1  // espaçamento lateral entre a borda e o item
              }}
            >
              <Box
                component="img"
                src={chope.image}
                alt={chope.name}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  m: 0.5
                }}
              />

              <Box sx={{ p: 0.5, flex: 1 }}>
                <Typography
                  variant={isMobile ? 'subtitle2' : 'h6'}
                  sx={{
                    fontFamily: 'Alfa Slab One',
                    fontWeight: 400,
                    mb: 0.5,
                    color: '#000',
                    fontSize: isMobile ? '1rem' : '1.2rem'
                  }}
                >
                  {chope.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mb: 0.5, color: '#333', fontSize: isMobile ? '0.6rem' : '0.8rem' }}
                >
                  {chope.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip label={`${chope.abv}% vol`} size="small" sx={{ fontSize: isMobile ? '0.6rem' : '0.8rem' }} />
                  <Chip label={`${chope.ibu} IBU`} size="small" sx={{ fontSize: isMobile ? '0.6rem' : '0.8rem' }} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}
