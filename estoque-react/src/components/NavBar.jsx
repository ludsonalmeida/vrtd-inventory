// src/components/NavBar.jsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';

export default function NavBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Eventos', id: 'eventos' },
    { label: 'Promoções', id: 'destaques' },
    { label: 'Reservas', id: 'reserva' },
    { label: 'Localização', id: 'localizacao' },
    { label: 'Playlist', id: 'playlist' },
    { label: 'Contato', id: 'contato' }
  ];

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      const yOffset = -80; // Ajuste conforme a altura real da sua navbar
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  const handleNav = (id) => {
    if (isMobile) {
      setDrawerOpen(false);
      setTimeout(() => {
        scrollToSection(id);
      }, 300);
    } else {
      scrollToSection(id);
    }
  };

  const toggleDrawer = () => setDrawerOpen(open => !open);

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
      {navItems.map(item => {
        const isReserva = item.id === 'reserva';

        if (isReserva) {
          return (
            <Button
              key={item.id}
              onClick={() => {
                window.location.href = 'https://reservas.sobradinhoporks.com.br';
              }}
              sx={{
                color: '#333',
                backgroundColor: 'transparent',
                fontFamily: 'Alfa Slab One',
                fontWeight: 400,
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              {item.label}
            </Button>
          );
        }

        return (
          <Button
            key={item.id}
            onClick={() => handleNav(item.id)}
            sx={{
              color: '#333',
              backgroundColor: 'transparent',
              fontFamily: 'Alfa Slab One',
              fontWeight: 400,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Box>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton
        edge="end"
        onClick={toggleDrawer}
        sx={{
          color: '#333',
          ml: 3,
          mr: 2,
          mt: 1,
          p: 1.5,
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.05)',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuIcon fontSize="large" />
      </IconButton>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 240, bgcolor: '#F59E0B' }} role="presentation">
          <List>
            {navItems.map(item => {
              const isReserva = item.id === 'reserva';

              if (isReserva) {
                return (
                  <ListItem
                    button
                    key={item.id}
                    onClick={() => {
                      setDrawerOpen(false);
                      window.location.href = 'https://reservas.sobradinhoporks.com.br';
                    }}
                    sx={{
                      color: '#333',
                      fontFamily: 'Alfa Slab One',
                      fontWeight: 400,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontFamily: 'Alfa Slab One',
                        fontWeight: 400,
                        fontSize: '1rem',
                        color: '#333',
                      }}
                    />
                  </ListItem>
                );
              }

              return (
                <ListItem
                  button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  sx={{
                    color: '#333',
                    fontFamily: 'Alfa Slab One',
                    fontWeight: 400,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontFamily: 'Alfa Slab One',
                      fontWeight: 400,
                      fontSize: '1rem',
                      color: '#333',
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#F59E0B', boxShadow: 'none' }}>
      <Toolbar sx={{ px: { xs: 1, md: 4 }, justifyContent: 'space-between' }}>
        <Box
          component="img"
          src="https://porks.nyc3.cdn.digitaloceanspaces.com/porks-logo.png"
          alt="Porks Sobradinho"
          onClick={() => handleNav('home')}
          sx={{ height: 40, maxWidth: 60, cursor: 'pointer' }}
        />
        {isMobile ? renderMobileMenu() : renderDesktopMenu()}
      </Toolbar>
    </AppBar>
  );
}
