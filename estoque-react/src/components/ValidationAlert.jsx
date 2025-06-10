// src/components/ValidationAlert.jsx

import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * ValidationAlert é um componente reutilizável que exibe uma
 * mensagem de alerta bonita (usando Snackbar + MUI Alert). 
 *
 * Props:
 * - open (boolean): controla visibilidade do Snackbar.
 * - severity ("error" | "warning" | "info" | "success"): tipo do alerta.
 * - message (string): texto a ser exibido.
 * - onClose (function): callback para fechar o alerta.
 *
 * Uso:
 * <ValidationAlert
 *   open={alertOpen}
 *   severity="error"
 *   message="Fornecedor é obrigatório"
 *   onClose={() => setAlertOpen(false)}
 * />
 */
export default function ValidationAlert({ open, severity, message, onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} elevation={6} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
