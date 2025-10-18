// src/components/ReservationModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Button, FormControl, InputLabel,
  Select, MenuItem, RadioGroup, FormControlLabel, Radio,
  Box, FormLabel, FormHelperText, Fade, Alert, Stack
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const AREAS = ['Coberta', 'Descoberta', 'Porks Deck'];
const WHATSAPP_NUMBER_FALLBACK = '5561935003917'; // fallback local se o backend não mandar waLink

function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const d1 = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (!d1) return '';
  if (rest.length <= 5) return `(${d1}) ${rest}`;
  return `(${d1}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}

/** ===== SLOTS PERMITIDOS (17:00 → 20:00, passo 30 min) ===== */
const SLOT_START = { h: 17, m: 0 };
const SLOT_END   = { h: 20, m: 0 }; // inclusive
const pad = (n) => String(n).padStart(2, '0');
const toHHMM = (h, m) => `${pad(h)}:${pad(m)}`;
const todayISO = () => {
  const d = new Date(); const y = d.getFullYear(); const m = pad(d.getMonth()+1); const dd = pad(d.getDate());
  return `${y}-${m}-${dd}`;
};
function buildSlots() {
  const slots = [];
  let h = SLOT_START.h, m = SLOT_START.m;
  while (h < SLOT_END.h || (h === SLOT_END.h && m === SLOT_END.m)) {
    slots.push(toHHMM(h, m));
    m += 30;
    if (m >= 60) { m = 0; h += 1; }
  }
  return slots;
}
const ALLOWED_SLOTS = buildSlots();

function isToday(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const sel = new Date(y, m - 1, d); sel.setHours(0,0,0,0);
  const now = new Date(); now.setHours(0,0,0,0);
  return sel.getTime() === now.getTime();
}

/** Para HOJE, escondemos horários já passados (aceita <2h; confirmação será via WhatsApp no sucesso) */
function getAvailableSlots(dateStr) {
  if (!dateStr) return ALLOWED_SLOTS;
  if (!isToday(dateStr)) return ALLOWED_SLOTS;
  const now = new Date();
  const hhmmNow = toHHMM(now.getHours(), now.getMinutes());
  return ALLOWED_SLOTS.filter(s => s >= hhmmNow);
}

function formatDateBR(iso) {
  const [y,m,d] = iso.split('-').map(Number);
  return new Date(y, m-1, d).toLocaleDateString('pt-BR');
}

function buildWhatsAppLinkLocal({ date, time, people, name }) {
  const dia = formatDateBR(date);
  const qtd = (people === '10+' ? 'Mais de 10' : String(people));
  const msg = `Ola, acabei de fazer minha pre reserva no site para "${dia}" ${time} e ${qtd} Pessoas em nome de ${name.trim()}, pode confirmar?`;
  return `https://wa.me/${WHATSAPP_NUMBER_FALLBACK}?text=${encodeURIComponent(msg)}`;
}

/**
 * Props:
 *  - open, onClose
 *  - onSubmit(payload) -> deve retornar:
 *      { ok: true, needsFastConfirm?: boolean, waLink?: string }  OU
 *      { ok: false, error: '...' }
 *  - initialData, bannerImages
 */
export default function ReservationModal({ open, onClose, onSubmit, initialData = null, bannerImages }) {
  const defaultImages = [
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9515.jpg',
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9512.jpg',
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9511.jpg'
  ];
  const images = bannerImages && bannerImages.length ? bannerImages : defaultImages;

  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSlideIndex(prev => (prev + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const dateRef = useRef(null);

  const [form, setForm] = useState({ date: todayISO(), time: '', name: '', phone: '', people: 2, area: 'Coberta' });
  const [touched, setTouched] = useState({ date: false, time: false, name: false, phone: false, people: false, area: false });
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(null); // { needsFastConfirm, waLink }

  useEffect(() => {
    if (initialData) {
      const dateObj = new Date(initialData.date);
      const isoDate = isNaN(dateObj.getTime()) ? todayISO() : dateObj.toISOString().split('T')[0];
      const slots = getAvailableSlots(isoDate);
      const allowedTime = ALLOWED_SLOTS.includes(initialData.time) ? initialData.time : '';
      const autoTime = allowedTime && slots.includes(allowedTime) ? allowedTime : (slots[0] || '');
      setForm({
        date: isoDate,
        time: autoTime,
        name: initialData.name || '',
        phone: initialData.phone ? formatPhone(initialData.phone) : '',
        people: initialData.people > 10 ? '10+' : (initialData.people || 2),
        area: initialData.area && AREAS.includes(initialData.area) ? initialData.area : 'Coberta'
      });
    } else if (open) {
      const iso = todayISO();
      const slots = getAvailableSlots(iso);
      setForm({ date: iso, time: slots[0] || '', name: '', phone: '', people: 2, area: 'Coberta' });
    }
    setTouched({ date: false, time: false, name: false, phone: false, people: false, area: false });
    setSubmitError('');
    setDone(null);
  }, [initialData, open]);

  const handleChange = e => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const handlePhoneChange = e => setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
  const handleBlur = field => () => setTouched(prev => ({ ...prev, [field]: true }));

  // validações
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  let dateValid = true;
  if (form.date) {
    const [y, m, d] = form.date.split('-').map(Number);
    dateValid = new Date(y, m - 1, d) >= todayStart;
  }
  const availableSlots = getAvailableSlots(form.date);
  const timeIsAllowed = form.time && ALLOWED_SLOTS.includes(form.time) && (!isToday(form.date) || availableSlots.includes(form.time));

  const errors = {
    date: touched.date && (!form.date || !dateValid),
    time: touched.time && (!form.time || !timeIsAllowed),
    name: touched.name && !form.name.trim(),
    phone: touched.phone && form.phone.replace(/\D/g, '').length < 10,
    people: touched.people && !(form.people === '10+' || Number(form.people) >= 2),
    area: touched.area && !AREAS.includes(form.area)
  };
  const isValid = ['date', 'time', 'name', 'phone', 'people', 'area'].every(f => !errors[f] && form[f]);

  const timeHelper = (() => {
    if (!errors.time) {
      if (availableSlots.length === 0 && form.date) return `Sem horários disponíveis para hoje. Você poderá confirmar via WhatsApp após a pré-reserva.`;
      return '';
    }
    if (!form.time) return 'Horário é obrigatório';
    if (isToday(form.date) && !availableSlots.includes(form.time)) return 'Escolha um horário ainda disponível para hoje.';
    return 'Selecione um dos horários (17:00 a 20:00, a cada 30 min)';
  })();

  async function handleConfirm() {
    setSubmitError('');
    if (!isValid) {
      setTouched({ date: true, time: true, name: true, phone: true, people: true, area: true });
      return;
    }

    const payload = {
      date: form.date,
      time: form.time,
      name: form.name.trim(),
      phone: form.phone,
      people: form.people === '10+' ? '11' : String(form.people),
      area: form.area
    };

    try {
      const result = await onSubmit(payload);
      if (result && typeof result === 'object' && result.ok === false) {
        setSubmitError(result.error || 'Não foi possível salvar. Tente novamente.');
        return;
      }
      // sucesso: mostra tela final com botão do WhatsApp
      const waLink = result?.waLink || buildWhatsAppLinkLocal({
        date: form.date, time: form.time, people: form.people, name: form.name
      });
      const needsFastConfirm = Boolean(result?.needsFastConfirm || isToday(form.date));
      setDone({ needsFastConfirm, waLink });
    } catch (e) {
      const msg =
        (e && e.response && e.response.data && e.response.data.error) ||
        e?.message ||
        'Falha ao salvar a reserva. Tente novamente.';
      setSubmitError(msg);
    }
  }

  // Tela de sucesso
  if (done) {
    const dia = formatDateBR(form.date);
    const qtd = (form.people === '10+' ? 'Mais de 10' : String(form.people));
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Pré-reserva enviada!</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              O concierge do Porks vai entrar em contato para confirmação.
            </Typography>
            <Typography>
              Detalhes: <b>{dia}</b> às <b>{form.time}</b>, <b>{qtd} pessoas</b>, em nome de <b>{form.name.trim()}</b>.
            </Typography>
            {done.needsFastConfirm && (
              <Alert severity="info">
                Para hoje, recomendamos confirmar rapidamente no WhatsApp para priorizar seu atendimento.
              </Alert>
            )}
            <Button
              variant="contained"
              size="large"
              startIcon={<WhatsAppIcon />}
              href={done.waLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Confirmar no WhatsApp
            </Button>
            <Typography variant="body2" color="text.secondary">
              Você também receberá a confirmação do nosso concierge por e-mail/WhatsApp.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
      <DialogContent>
        {/* Slider */}
        <Box sx={{ position: 'relative', width: '100%', height: 150, mb: 2, overflow: 'hidden', borderRadius: 1 }}>
          {(bannerImages && bannerImages.length ? bannerImages : [
            'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9515.jpg',
            'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9512.jpg',
            'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9511.jpg'
          ]).map((src, idx) => (
            <Fade key={idx} in={idx === slideIndex} timeout={500} mountOnEnter unmountOnExit>
              <Box component="img" src={src} alt={`Slide ${idx + 1}`} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </Fade>
          ))}
        </Box>

        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Reservas entre <b>17:00 e 20:00</b>, em intervalos de <b>30 minutos</b>. Para hoje, mostramos somente horários que ainda não passaram.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Para qual dia?"
            type="date"
            name="date"
            inputRef={dateRef}
            onFocus={() => dateRef.current?.showPicker?.()}
            value={form.date}
            onChange={(e) => {
              const nextDate = e.target.value;
              const nextSlots = getAvailableSlots(nextDate);
              setForm(prev => ({
                ...prev,
                date: nextDate,
                time: nextSlots.includes(prev.time) ? prev.time : (nextSlots[0] || '')
              }));
            }}
            onBlur={handleBlur('date')}
            InputLabelProps={{ shrink: true }}
            error={touched.date && (!form.date || !dateValid)}
            helperText={touched.date && (!form.date ? 'Data é obrigatória' : (!dateValid ? 'Data anterior ao dia de hoje' : ''))}
            fullWidth
            size="medium"
          />

          <FormControl fullWidth error={touched.time && (!form.time || !timeIsAllowed)}>
            <InputLabel id="time-label">Qual horário?</InputLabel>
            <Select
              labelId="time-label"
              name="time"
              value={form.time}
              label="Qual horário?"
              onChange={handleChange}
              onBlur={handleBlur('time')}
            >
              {getAvailableSlots(form.date).map((slot) => (
                <MenuItem key={slot} value={slot}>{slot}</MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {(() => {
                if (!(touched.time && (!form.time || !timeIsAllowed))) return '';
                return timeHelper;
              })()}
            </FormHelperText>
          </FormControl>

          <TextField
            label="Nome e Sobrenome"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur('name')}
            error={touched.name && !form.name.trim()}
            helperText={touched.name && !form.name.trim() ? 'Obrigatório' : ''}
            fullWidth
            size="medium"
          />

          <TextField
            label="Telefone"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            onBlur={handleBlur('phone')}
            placeholder="(61) 91234-5678"
            error={touched.phone && form.phone.replace(/\D/g, '').length < 10}
            helperText={touched.phone && form.phone.replace(/\D/g, '').length < 10 ? 'Formato inválido' : ''}
            inputProps={{ inputMode: 'numeric' }}
            fullWidth
            size="medium"
          />

          <FormControl fullWidth error={touched.people && !(form.people === '10+' || Number(form.people) >= 2)}>
            <InputLabel id="people-label">Para Quantas Pessoas?</InputLabel>
            <Select
              labelId="people-label"
              name="people"
              value={form.people}
              label="Para Quantas Pessoas?"
              onChange={handleChange}
              onBlur={handleBlur('people')}
            >
              {[...Array(9)].map((_, i) => (
                <MenuItem key={i + 2} value={i + 2}>{i + 2}</MenuItem>
              ))}
              <MenuItem value="10+">Mais de 10 pessoas</MenuItem>
            </Select>
            {touched.people && !(form.people === '10+' || Number(form.people) >= 2) && (
              <FormHelperText>Selecione um valor</FormHelperText>
            )}
          </FormControl>

          <FormControl component="fieldset" error={touched.area && !AREAS.includes(form.area)}>
            <FormLabel component="legend">Área de Preferência</FormLabel>
            <RadioGroup row name="area" value={form.area} onChange={handleChange} onBlur={handleBlur('area')}>
              {AREAS.map(a => (
                <FormControlLabel key={a} value={a} control={<Radio />} label={a} />
              ))}
            </RadioGroup>
            {touched.area && !AREAS.includes(form.area) && <FormHelperText>Selecione uma área</FormHelperText>}
          </FormControl>

          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Reservas a partir de 30 pessoas no Porks Deck têm atendimento exclusivo.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!isValid}>Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
}
