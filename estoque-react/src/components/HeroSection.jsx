// src/components/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, MobileStepper, Paper, Fade } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

// Slider images stored in public/images and external URL
const sliderImages = [
  'https://d9hhrg4mnvzow.cloudfront.net/lp.porksbrasil.com.br/5ac1c8e2-1-desk_11hc0v4000000000000000.png',
  '/images/1.jpg',
  '/images/2.jpg',
  '/images/3.jpg',
];

export default function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = sliderImages.length;

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % maxSteps);
    }, 5000);
    return () => clearInterval(timer);
  }, [maxSteps]);

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, maxSteps - 1));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  return (
    <Paper
      square
      elevation={0}
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '50vh', md: '80vh' },
        overflow: 'hidden',
      }}
    >
      {/* Slider container with fade transitions */}
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {sliderImages.map((img, index) => (
          <Fade in={activeStep === index} timeout={{ enter: 800, exit: 800 }} key={img} unmountOnExit>
            <Box
              component="img"
              src={img}
              alt={`Slide ${index + 1}`}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.6) contrast(1.2) saturate(1.1) blur(0.5px)',
                transform: 'scale(1.05)',
              }}
            />
          </Fade>
        ))}
      </Box>

      {/* Dark overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(0,0,0,0.6)',
          zIndex: 1,
        }}
      />

      {/* Grain overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/images/grain.png)',
          opacity: 0.2,
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
          zIndex: 2,
        }}
      />

      {/* Headline content centered */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          zIndex: 3,
          px: { xs: 2, sm: 4 },
          maxWidth: { xs: '90%', md: '800px' },
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3.5rem' } }}>
          Porks Sobradinho
        </Typography>
        <Typography variant="h5" component="p" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.5rem' } }}>
          O melhor porco e chope da região
        </Typography>
        {/** <Button variant="contained" color="primary" size="large" sx={{ mt: 3, px: 5, py: 2, fontSize: { xs: '0.8rem', md: '1rem' } }}>
          Veja o Cardápio
        </Button> **/}
      </Box>

      {/* Stepper controls for mobile */}
      <MobileStepper
        variant="dots"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button
            size="small"
            onClick={nextStep}
            disabled={activeStep === maxSteps - 1}
            sx={{ color: '#fff' }}
          >
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button
            size="small"
            onClick={prevStep}
            disabled={activeStep === 0}
            sx={{ color: '#fff' }}
          >
            <KeyboardArrowLeft />
          </Button>
        }
        sx={{
          position: 'absolute',
          bottom: { xs: 8, md: 16 },
          left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: 'transparent',
          zIndex: 3,
          display: { xs: 'flex', md: 'none' },
        }}
      />
    </Paper>
  );
}
