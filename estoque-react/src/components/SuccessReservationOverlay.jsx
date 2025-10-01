// src/components/SuccessReservationOverlay.jsx
import React, { useEffect } from 'react';
import { Backdrop, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Sobreposição de sucesso com check animado.
 * - open: boolean para exibir/ocultar
 * - onClose: função opcional para fechar manualmente
 * - autoHideMs: tempo para auto-fechar (default 5000ms)
 */
export default function SuccessReservationOverlay({
  open,
  onClose,
  autoHideMs = 5000
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      onClose?.();
    }, autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);

  return (
    <Backdrop
      open={open}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 2,
        backdropFilter: 'blur(2px)',
        backgroundColor: 'rgba(0,0,0,0.6)'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: 320, sm: 420 },
          bgcolor: '#111',
          borderRadius: 3,
          p: { xs: 4, sm: 5 },
          boxShadow: 6,
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, color: 'rgba(255,255,255,0.7)' }}
            aria-label="Fechar"
          >
            <CloseIcon />
          </IconButton>
        )}

        {/* Check animado */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <style>{`
                @keyframes dash {
                  0%   { stroke-dashoffset: 440; }
                  60%  { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: 0; }
                }
                @keyframes pop {
                  0%   { transform: scale(0.8); opacity: 0; }
                  60%  { transform: scale(1.05); opacity: 1; }
                  100% { transform: scale(1); }
                }
              `}</style>
            </defs>
            {/* Círculo */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="330"
              strokeDashoffset="330"
              style={{ animation: 'dash 1200ms ease-out forwards' }}
            />
            {/* Check */}
            <path
              d="M40 62 L55 76 L84 47"
              fill="none"
              stroke="#22c55e"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="120"
              strokeDashoffset="120"
              style={{ animation: 'dash 900ms 200ms ease-out forwards, pop 500ms 900ms ease-out forwards' }}
            />
          </svg>
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Alfa Slab One',
            letterSpacing: 0.3,
            mb: 1
          }}
        >
          Pré-reserva enviada!
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          O concierge do <strong>Porks</strong> vai entrar em contato
          para <strong>confirmação</strong>.
        </Typography>

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.6)' }}>
          Horário de funcionamento: terça a domingo, 16h — 00h
        </Typography>
      </Box>
    </Backdrop>
  );
}
