// src/components/MenuCards.jsx
import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button
} from '@mui/material';

// Não há import de imagens locais. Vamos usar placeholders:
const ITEMS = [
  {
    title: 'Torresmo Mineiro',
    image: 'https://via.placeholder.com/400x200?text=Torresmo',
    description: 'Porção crocante de torresmo com temperos especiais.',
    action: 'Ver Detalhes',
  },
  {
    title: 'Chope Gelado',
    image: 'https://via.placeholder.com/400x200?text=Chope',
    description: 'Chope Pilsen artesanal, tirado na hora.',
    action: 'Peça Agora',
  },
  {
    title: 'Hambúrguer Suíno',
    image: 'https://via.placeholder.com/400x200?text=Hamb%C3%BArguer',
    description: 'Hambúrguer de porco 100% artesanal, com queijo derretido.',
    action: 'Peça Agora',
  },
];

export default function MenuCards() {
  return (
    <Box sx={{ flexGrow: 1, py: 6, backgroundColor: 'background.default' }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: 700, color: 'text.primary' }}
      >
        Destaques do Cardápio
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        {ITEMS.map((item) => (
          <Grid item key={item.title} xs={12} sm={6} md={4}>
            <Card sx={{ maxWidth: 345, margin: 'auto', bgcolor: 'background.paper' }}>
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
              <CardActions>
                <Button size="small" variant="contained" color="primary">
                  {item.action}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
