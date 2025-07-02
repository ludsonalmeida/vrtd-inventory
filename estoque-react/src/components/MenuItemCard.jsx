// src/components/MenuItemCard.jsx
import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

export default function MenuItemCard({ title, description, price, image }) {
  return (
    <Card
      sx={{
        maxWidth: 320,
        borderRadius: 3,
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        backgroundColor: '#1f1f1f',
        color: '#fff',
        fontFamily: 'Alfa Slab One',
      }}
    >
      <CardMedia
        component="img"
        height="180"
        image={image}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontFamily: 'Alfa Slab One',
            textTransform: 'uppercase',
            fontSize: '1.1rem',
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Roboto',
            fontSize: '0.9rem',
            opacity: 0.8,
            mb: 1,
          }}
        >
          {description}
        </Typography>
        <Box sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
          R$ {price}
        </Box>
      </CardContent>
    </Card>
  );
}
