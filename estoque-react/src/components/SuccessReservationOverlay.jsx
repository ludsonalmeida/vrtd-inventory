// src/components/SuccessReservationOverlay.jsx
import React, { useEffect, useMemo } from 'react';
import {
  Backdrop, Box, Typography, IconButton, Button, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

/**
 * Props:
 * - open: boolean
 * - onClose: fn
 * - autoHideMs?: number (default 5000)
 * - waLink?: string  (ex.: "https://wa.me/5561935003917" ou já com ?text=...)
 * - details?: { date: 'YYYY-MM-DD', time: 'HH:mm', people: number|'10+', name: string }
 */
export default function SuccessReservationOverlay({
  open,
  onClose,
  autoHideMs = 5000,
  waLink,
  details = null,
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => { onClose?.(); }, autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);

  const finalWaLink = useMemo(() => {
    // Nº fixo de destino
    const TO = '5561935003917';

    // Helpers
    const formatDateBR = (iso) => {
      if (!iso) return '';
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
    };
    const buildMessage = (d) => {
      if (!d) return '';
      const dia = formatDateBR(d.date);
      const qtd = d.people === '10+' ? 'Mais de 10' : String(d.people);
      const nome = (d.name || '').trim();
      // === Modelo solicitado ===
      return `Ola, acabei de fazer minha pre reserva no site para "${dia}" ${d.time} e ${qtd} Pessoas em nome de ${nome}, pode confirmar?`;
    };

    // Base do link (prioriza o que veio do backend; cai para wa.me/TO se não tiver)
    const base = waLink && waLink.trim() ? waLink.trim() : `https://wa.me/${TO}`;

    // Se já tem ?text= no link, usa como está
    if (/[?&]text=/.test(base)) return base;

    // Caso contrário, monta a mensagem com os details
    const msg = buildMessage(details);
    if (!msg) return base; // fallback: sem mensagem se faltar detail

    // Anexa text= respeitando ? ou &
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}text=${encodeURIComponent(msg)}`;
  }, [waLink, details]);

  const hasDetails = Boolean(details?.date && details?.time && details?.people && details?.name);

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
                @keyframes dash { 0%{stroke-dashoffset:440} 60%{stroke-dashoffset:0} 100%{stroke-dashoffset:0} }
                @keyframes pop  { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05);opacity:1} 100%{transform:scale(1)} }
              `}</style>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round"
              strokeDasharray="330" strokeDashoffset="330" style={{ animation: 'dash 1200ms ease-out forwards' }}/>
            <path d="M40 62 L55 76 L84 47" fill="none" stroke="#22c55e" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="120" strokeDashoffset="120"
              style={{ animation: 'dash 900ms 200ms ease-out forwards, pop 500ms 900ms ease-out forwards' }}/>
          </svg>
        </Box>

        <Typography variant="h5" sx={{ fontFamily: 'Alfa Slab One', letterSpacing: 0.3, mb: 1 }}>
          Pré-reserva enviada!
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)' }}>
          O concierge do <strong>Porks</strong> vai entrar em contato para <strong>confirmação</strong>.
        </Typography>

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.6)' }}>
          Horário de funcionamento: terça a domingo, 16h — 00h
        </Typography>

        <Stack spacing={1.5} sx={{ mt: 3 }}>
          {hasDetails && (
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <b>{new Date(details.date).toLocaleDateString('pt-BR')}</b> às <b>{details.time}</b> •{' '}
              <b>{details.people === '10+' ? 'Mais de 10' : details.people} pessoas</b><br />
              em nome de <b>{details.name}</b>
            </Typography>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={<WhatsAppIcon />}
            href={finalWaLink}
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
            sx={{ mt: 1 }}
          >
            Confirmar no WhatsApp
          </Button>
        </Stack>
      </Box>
    </Backdrop>
  );
}
