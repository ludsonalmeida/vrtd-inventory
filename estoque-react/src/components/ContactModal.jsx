// src/components/ContactModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import PropTypes from 'prop-types';

// Base URL da API via variável de ambiente (Vite)
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

export default function ContactModal({ open, onClose }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        setSnackbar({ open: true, message: error.error || 'Erro ao enviar mensagem', severity: 'error' });
        return;
      }

      // Mensagem de sucesso e fechar modal
      setSnackbar({ open: true, message: 'Mensagem enviada com sucesso!', severity: 'success' });
      onClose();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao enviar mensagem. Tente novamente.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="contact-dialog-title"
        aria-describedby="contact-dialog-description"
      >
        <DialogTitle id="contact-dialog-title">Entre em Contato</DialogTitle>
        <DialogContent id="contact-dialog-description">
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
          >
            <TextField
              label="Seu nome"
              name="name"
              variant="outlined"
              required
              fullWidth
              InputProps={{ style: { color: '#fff', backgroundColor: '#444', borderRadius: '4px' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
            <TextField
              label="Seu email"
              name="email"
              type="email"
              variant="outlined"
              required
              fullWidth
              InputProps={{ style: { color: '#fff', backgroundColor: '#444', borderRadius: '4px' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
            <TextField
              label="Sua mensagem"
              name="message"
              multiline
              rows={4}
              variant="outlined"
              required
              fullWidth
              InputProps={{ style: { color: '#fff', backgroundColor: '#444', borderRadius: '4px' } }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#FFA500',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#cc8400' }
                }}
              >
                Enviar
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

ContactModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
