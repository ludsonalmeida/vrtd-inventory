// src/components/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, MobileStepper, Fade } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const sliderImages = [
  'https://porks.nyc3.cdn.digitaloceanspaces.com/slider/slide1.jpg',
  'https://porks.nyc3.cdn.digitaloceanspaces.com/slider/slide2.jpg',
  'https://porks.nyc3.cdn.digitaloceanspaces.com/slider/slide3.jpg',
];

export default function HeroSection() {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = sliderImages.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % maxSteps);
    }, 5000);
    return () => clearInterval(timer);
  }, [maxSteps]);

  const nextStep = () => setActiveStep(prev => (prev + 1) % maxSteps);
  const prevStep = () => setActiveStep(prev => (prev - 1 + maxSteps) % maxSteps);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: '90vh', md: '80vh' },
        overflow: 'hidden',
      }}
    >
      {/* Slider com Fade */}
      {sliderImages.map((img, index) => (
        <Fade in={activeStep === index} timeout={800} key={img} unmountOnExit>
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
              filter: 'brightness(0.6) contrast(1.2)',
            }}
          />
        </Fade>
      ))}

      {/* Overlay escuro */}
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

      {/* Texto central */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#fff',
          zIndex: 2,
          px: { xs: 2, md: 4 },
          maxWidth: { xs: '90%', md: '800px' },
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: 'Alfa Slab One',
            fontWeight: 700,
            fontSize: { xs: '2.5rem', md: '4rem' },
            textShadow: '2px 2px 6px rgba(0,0,0,0.7)',
          }}
        >
          Porks Sobradinho
        </Typography>

        <Typography
          variant="h5"
          component="p"
          gutterBottom
          sx={{
            fontSize: { xs: '1.2rem', md: '1.8rem' },
            textShadow: '1px 1px 3px rgba(0,0,0,0.6)',
            mb: 2,
          }}
        >
          O melhor porco e chope da região
        </Typography>
      </Box>

      {/* Stepper de navegação mobile */}
      <MobileStepper
        variant="dots"
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={nextStep} sx={{ color: '#fff' }}>
            <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={prevStep} sx={{ color: '#fff' }}>
            <KeyboardArrowLeft />
          </Button>
        }
        sx={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: 'transparent',
          zIndex: 3,
          display: { xs: 'flex', md: 'none' },
        }}
      />
    </Box>
  );
}
