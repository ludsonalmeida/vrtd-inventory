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

  const handleNav = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80; // ajusta 80px acima
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const toggleDrawer = () => setDrawerOpen(open => !open);

  const renderDesktopMenu = () => (
    <Box sx={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
      {navItems.map(item => (
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
      ))}
    </Box>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton edge="end" onClick={toggleDrawer} sx={{ color: '#333', marginLeft: 'auto' }}>
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 240, bgcolor: '#F59E0B' }} role="presentation" onClick={toggleDrawer}>
          <List>
            {navItems.map(item => (
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
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#F59E0B', boxShadow: 'none' }}>
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
