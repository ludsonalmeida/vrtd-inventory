// src/components/NavBar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

// Remova a linha de import local:
// import logo from '../assets/logo.png';

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          {/* Use um placeholder via URL: */}
          <img
            src="https://porks.nyc3.cdn.digitaloceanspaces.com/porkstoq-white.png"
            alt="Logo Porks"
            style={{ height: 40, marginRight: 12 }}
          />
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Porks Sobradinho
          </Typography>
        </Box>

        <Box>
          <Button color="inherit" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/cardapio')}>
            Cardápio
          </Button>
          <Button color="inherit" onClick={() => navigate('/contato')}>
            Contato
          </Button>
        </Box>

        {/* Ícone de menu para mobile (visível apenas em xs) */}
        <IconButton edge="end" color="inherit" sx={{ display: { xs: 'block', md: 'none' } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
