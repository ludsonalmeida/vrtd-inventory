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

export default function ContactModal({ open, onClose }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        message: form.message
      });
      setSnackbar({
        open: true,
        message: 'Mensagem enviada com sucesso!',
        severity: 'success'
      });
      setForm({ name: '', email: '', message: '' });
      onClose();
    } catch (err) {
      console.error('[ContactModal] Erro ao enviar contato:', err);
      const msg = err.response?.data?.error || err.message || 'Erro ao enviar mensagem';
      setSnackbar({ open: true, message: msg, severity: 'error' });
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
