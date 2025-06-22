// src/pages/HomePage.jsx
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import MenuCards from '../components/MenuCards';
import ReservationModal from '../components/ReservationModal';
import ContactModal from '../components/ContactModal';
import PixelLoader from '../components/PixelLoader';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Link,
  Box,
  Snackbar,
  Alert,
  IconButton,
  Fade
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import NavigationIcon from '@mui/icons-material/Navigation';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';


// Dados estáticos de terça a domingo conforme imagem
const weeklyEvents = [
  { day: 'Terça', title: 'Terça Insana: Chope Pilsen (300ml)', time: 'R$3 das 17h às 18h | R$4 das 18h às 19h | R$5 das 19h até fechar' },
  { day: 'Quarta', title: 'Quarta Crocante: Torresmo Mineiro + 2 Pilsens', time: '2 Pilsens + Torresmo por R$29,90 | Refils de Pilsen por R$6 até 20h' },
  { day: 'Quinta', title: 'Quinta Bico Seco: Pague 4 leve 6 chope (300ml)', time: 'Qualquer IPA G por R$12 a noite toda' },
  { day: 'Sexta', title: 'Sexta do Chope: Pague P leve G no chope Pilsen', time: 'Promoção válida até 20h' },
  { day: 'Sábado', title: 'Sábado Animado: Pague P leve G no chope Pilsen', time: 'Promoção válida até 20h' },
  { day: 'Domingo', title: 'Hamburgada de Domingo: Qualquer burger', time: 'Todos burgers por R$18 cada' }
];

// Usando mesmas fotos do banner da modal
const venueImages = [
  'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9515.jpg',
  'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9512.jpg',
  'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9511.jpg'
];
const spotifyPlaylistId = '6Qug7YIw5szhAngeeicNvG?si=78e89aeb0e68436b';
const address = 'Quadra 01, CL 3, Lote 07 – Sobradinho, DF';
const googleMapsLink = 'https://www.google.com/maps/dir/?api=1&destination=Quadra+01+CL+3+Lote+07+Sobradinho+DF';
const wazeLink = 'https://www.waze.com/pt-BR/live-map/directions/br/df/porks-sobradinho?navigate=yes&to=place.ChIJRaEe4YM_WpMRlgI1M3dIrB0';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [eventIndex, setEventIndex] = useState(0);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setEvents(weeklyEvents);
  }, []);

  // Auto-rotacionar eventos a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setEventIndex(i => (i === events.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  // Navegação manual do carrossel de eventos
  const prevEvent = () => setEventIndex(i => (i === 0 ? events.length - 1 : i - 1));
  const nextEvent = () => setEventIndex(i => (i === events.length - 1 ? 0 : i + 1));

  // Modais
  const handleOpenReservation = () => setReservationOpen(true);
  const handleCloseReservation = () => setReservationOpen(false);
  const handleOpenContact = () => setContactOpen(true);
  const handleCloseContact = () => setContactOpen(false);
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // Envio de reserva
  const handleReservationSubmit = async data => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errMsg = errorBody.error || `Status ${response.status}`;
        setSnackbar({ open: true, message: `Erro: ${errMsg}`, severity: 'error' });
      } else {
        await response.json();
        setSnackbar({ open: true, message: 'Reserva criada, nossa equipe entrará em contato nos horários de funcionamento para confirmar: terça a domingo das 16h às 00h', severity: 'success' });
        setReservationOpen(false);
      }
    } catch {
      setSnackbar({ open: true, message: 'Erro de rede ao salvar reserva.', severity: 'error' });
    }
  };

  return (
    <>
     <PixelLoader />
      <NavBar />
      <Box id="home"><HeroSection /></Box>

      {/* Carrossel de Eventos da Semana */}
      <Container id="eventos" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Eventos da Semana
        </Typography>
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, mx: 'auto', mb: 2, height: 180 }}>
          {events.map((evt, idx) => (
            <Fade
              key={evt.day}
              in={idx === eventIndex}
              timeout={500}
              mountOnEnter
              unmountOnExit
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
                <Card sx={{ px: 2, py: 1 }}>
                  <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                    <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                      {evt.day}
                    </Typography>
                    <Typography variant="subtitle1" align="center" sx={{ mb: 0.5 }}>
                      {evt.title}
                    </Typography>
                    <Typography variant="body2" align="center" color="textSecondary">
                      {evt.time}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          ))}
          <IconButton
            onClick={prevEvent}
            sx={{ position: 'absolute', top: '50%', left: '-32px', transform: 'translateY(-50%)' }}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <IconButton
            onClick={nextEvent}
            sx={{ position: 'absolute', top: '50%', right: '-32px', transform: 'translateY(-50%)' }}
          >
            <KeyboardArrowRight />
          </IconButton>
        </Box>
      </Container>

      {/* Seção Promoções */}
      <Box id="destaques"><MenuCards /></Box>

      {/* Seção Reserva Online */}
      <Container id="reserva" sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Reserve seu lugar
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {venueImages.map((src, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card>
                <CardMedia component="img" height="180" image={src} alt={`Ambiente ${idx + 1}`} />
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" size="large" onClick={handleOpenReservation}>
            Fazer Reserva Online
          </Button>
        </Box>
      </Container>

      {/* Seção Localização */}
      <Container id="localizacao" sx={{ mt: 6, textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Como chegar
        </Typography>
        <Typography variant="body1" gutterBottom>
          {address}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button component={Link} href={googleMapsLink} target="_blank" startIcon={<RoomIcon />}>Google Maps</Button>
          <Button component={Link} href={wazeLink} target="_blank" startIcon={<NavigationIcon />}>Waze</Button>
        </Box>
      </Container>

      {/* Seção Playlist Spotify */}
      <Container id="playlist" sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ouça nossa playlist
        </Typography>
        <Box sx={{ position: 'relative', pt: '56.25%' }}>
          <iframe
            title="Spotify Playlist"
            src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="encrypted-media"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
        </Box>
      </Container>

      {/* Seção Contato */}
      <Container id="contato" sx={{ mt: 6, textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#fff', fontWeight: 400 }}>
          Fale Conosco
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: '#fff', mb: 2, fontWeight: 400 }}>
          Tem alguma dúvida ou deseja nos avisar algo? Clique no botão abaixo e preencha o formulário para entrar em contato conosco.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleOpenContact}
          sx={{ backgroundColor: '#FFA500', color: '#fff', px: 2, py: 1, borderRadius: 1, textTransform: 'none', fontSize: 16, '&:hover': { backgroundColor: '#cc8400' } }}
        >
          Abrir Formulário
        </Button>
      </Container>

      {/* Modais e Snackbar */}
      <ReservationModal open={reservationOpen} onClose={handleCloseReservation} onSubmit={handleReservationSubmit} bannerImages={venueImages} />
      <ContactModal open={contactOpen} onClose={handleCloseContact} />
      <Snackbar open={snackbar.open} autoHideDuration={7000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
