// src/components/MenuCards.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';


// Imagens via loremflickr para tags específicas
const ITEMS = [
  {
    title: '🍖 TORRESMO MINEIRO + 2 PILSEN',
    image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/torresmomineiro.jpg',
     description: `
    Torresmo Mineiro: crocância incrível e tempero na medida certa para petiscar.

    🍺 2 Pilsen Artesanais (chope): dois copos super gelados e cremosos, com colarinho perfeito que equilibra o torresmo.
  `.trim(),
  action: 'Ver Cardápio',
  },
  
  {
    title: '🍺 Chope Gelado',
    image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/DSC00972-2.jpg',
    description: '🍺 Pilsen ou Puro Malte artesanal, tirado na hora, com colarinho cremoso e refrescante.',
    action: 'Ver Cardápio',
  },
  {
    title: '🍟 Fucking Fritas',
    image: 'https://porks.nyc3.cdn.digitaloceanspaces.com/_MG_6886.jpg',
    description: 'Batata extra crocante, coberta com bacon crocante e generosas lascas de queijo cheddar derretido para uma explosão de sabor.',
    action: 'Ver Cardápio',
  },
];

export default function MenuCards() {
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Seção Hot Promo's */}
      <Box sx={{ textAlign: 'center', py: 4, backgroundColor: 'background.paper' }}>
        <Typography
          variant="h4"
          component="div"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 400 }}
        >
          <Box component="img" src="/images/fire.gif" alt="foguinho" sx={{ width: 32, height: 32 }} />
          Hot Promo's
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
          Aproveite nossas promoções quentes desta semana!
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, py: 6, backgroundColor: 'background.default' }}>
        
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
          {ITEMS.map((item) => (
            <Grid item key={item.title} xs={12} sm={6} md={4}>
              <Card sx={{ maxWidth: 345, margin: 'auto', bgcolor: 'background.paper', height:450, textAlign: 'center'}}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image}
                  alt={item.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" sx={{ color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{justifyContent:'center'}}>
                  <Button size="small" variant="contained" color="primary" onClick={openMenu}>
                    {item.action}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Modal para exibir imagens do cardápio */}
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
