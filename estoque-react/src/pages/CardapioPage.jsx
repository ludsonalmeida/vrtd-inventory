import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import PixelLoader from '../components/PixelLoader';

export default function CardapioPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    // Dispara evento customizado no Meta Pixel
    if (window.fbq) {
      window.fbq('trackCustom', 'Abriu Cardápio');
    }
    // Abre o modal de cardápio assim que a página monta
    openMenu();
  }, []);

  return (
    <>
      {/* Inicializa Meta Pixel */}
      <PixelLoader />

      {/* Modal exibindo as páginas do cardápio em imagens */}
      <Dialog open={menuOpen} onClose={closeMenu} fullWidth maxWidth="md">
        <DialogTitle>Cardápio</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box
            component="img"
            src="https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio-1.jpg"
            alt="Cardápio Página 1"
            width="100%"
            sx={{ display: 'block' }}
          />
          <Box
            component="img"
            src="https://porks.nyc3.cdn.digitaloceanspaces.com/cardapio-2.jpg"
            alt="Cardápio Página 2"
            width="100%"
            sx={{ display: 'block', mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMenu}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
