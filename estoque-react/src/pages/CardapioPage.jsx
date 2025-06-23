import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import PixelLoader from '../components/PixelLoader';

export default function CardapioPage() {
  const [menuOpen] = useState(true);

  useEffect(() => {
    // Dispara evento customizado no Meta Pixel
    if (window.fbq) {
      window.fbq('trackCustom', 'Abriu Cardápio');
    }

    if (typeof gtag === 'function') {
      gtag('event', 'abriu_cardapio', {
        event_category: 'Cardapio',
        event_label: 'Página Cardápio Aberta',
      });
      console.log('Evento GA4: abriu_cardapio enviado');
    }
  }, []);

  return (
    <>
      {/* Inicializa Meta Pixel */}
      <PixelLoader />

      {/* Modal exibindo as páginas do cardápio, sem opção de fechar */}
      <Dialog
        open={menuOpen}
        fullWidth
        maxWidth="md"
        // Não permitir fechar com clique fora ou ESC
        onClose={() => {}}
        disableEscapeKeyDown
      >
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
      </Dialog>
    </>
  );
}
