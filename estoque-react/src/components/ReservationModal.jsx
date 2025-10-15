// src/components/ReservationModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Button, FormControl, InputLabel,
  Select, MenuItem, RadioGroup, FormControlLabel, Radio,
  Box, FormLabel, FormHelperText, Fade
} from '@mui/material';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  const part1 = digits.slice(0, 2);
  let rest = digits.slice(2);
  let formatted = '';
  if (part1) formatted = `(${part1}) `;
  if (rest.length <= 5) formatted += rest;
  else formatted += `${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
  return formatted;
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
const ALLOWED_SLOTS = buildSlots(); // ["17:00","17:30","18:00","18:30","19:00","19:30","20:00"]

function isToday(dateStr) {
  if (!dateStr) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const sel = new Date(y, m - 1, d); sel.setHours(0,0,0,0);
  const now = new Date(); now.setHours(0,0,0,0);
  return sel.getTime() === now.getTime();
}
function nowHHMM() {
  const n = new Date();
  return toHHMM(n.getHours(), n.getMinutes());
}

/** Slots válidos para a data (se hoje, remove horários passados) */
function getAvailableSlots(dateStr) {
  if (!dateStr) return ALLOWED_SLOTS;
  if (!isToday(dateStr)) return ALLOWED_SLOTS;
  const current = nowHHMM();
  return ALLOWED_SLOTS.filter(s => s >= current);
}

/**
 * Props:
 *  - open: boolean
 *  - onClose: function
 *  - onSubmit: function (recebe form data)
 *  - initialData: object|null
 *  - bannerImages: array de URLs
 */
export default function ReservationModal({ open, onClose, onSubmit, initialData = null, bannerImages }) {
  const defaultImages = [
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9515.jpg',
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9512.jpg',
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9511.jpg'
  ];
  const images = bannerImages && bannerImages.length ? bannerImages : defaultImages;

  // Slider
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSlideIndex(prev => (prev + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const dateRef = useRef(null);

  // Estado
  const [form, setForm] = useState({ date: todayISO(), time: '', name: '', phone: '', people: 2, area: 'Coberta' });
  const [touched, setTouched] = useState({ date: false, time: false, name: false, phone: false, people: false, area: false });

  // Inicialização / edição
  useEffect(() => {
    if (initialData) {
      const dateObj = new Date(initialData.date);
      const isoDate = isNaN(dateObj.getTime()) ? todayISO() : dateObj.toISOString().split('T')[0];
      const allowedTime = ALLOWED_SLOTS.includes(initialData.time) ? initialData.time : '';
      const slots = getAvailableSlots(isoDate);
      const autoTime = allowedTime || (slots[0] || '');
      setForm({
        date: isoDate,
        time: autoTime,
        name: initialData.name || '',
        phone: initialData.phone ? formatPhone(initialData.phone) : '',
        people: initialData.people > 10 ? '10+' : (initialData.people || 2),
        area: initialData.area && ['Coberta', 'Descoberta', 'Porks Deck'].includes(initialData.area) ? initialData.area : 'Coberta'
      });
    } else if (open) {
      // Novo: data = hoje e time = próximo slot disponível (ou primeiro do dia)
      const iso = todayISO();
      const slots = getAvailableSlots(iso);
      setForm({ date: iso, time: slots[0] || '', name: '', phone: '', people: 2, area: 'Coberta' });
    }
    setTouched({ date: false, time: false, name: false, phone: false, people: false, area: false });
  }, [initialData, open]);

  const handleChange = e => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const handlePhoneChange = e => setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
  const handleBlur = field => () => setTouched(prev => ({ ...prev, [field]: true }));

  // Validações
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  let dateValid = true;
  if (form.date) {
    const [y, m, d] = form.date.split('-').map(Number);
    dateValid = new Date(y, m - 1, d) >= todayStart;
  }

  let dateTimeValid = false;
  if (form.date && form.time) {
    const inAllowed = ALLOWED_SLOTS.includes(form.time);
    if (inAllowed) {
      dateTimeValid = isToday(form.date) ? form.time >= nowHHMM() : true;
    }
  }

  const errors = {
    date: touched.date && (!form.date || !dateValid),
    time: touched.time && (!form.time || !dateTimeValid),
    name: touched.name && !form.name.trim(),
    phone: touched.phone && form.phone.replace(/\D/g, '').length < 10,
    people: touched.people && !(form.people === '10+' || Number(form.people) >= 2),
    area: touched.area && !['Coberta', 'Descoberta', 'Porks Deck'].includes(form.area)
  };
  const isValid = ['date', 'time', 'name', 'phone', 'people', 'area'].every(f => !errors[f] && form[f]);

  const handleConfirm = () => {
    if (window.fbq) window.fbq('trackCustom', 'Reserva Efetuada', { people: form.people, area: form.area, time: form.time });
    if (typeof gtag === 'function') {
      gtag('event', 'reserva_efetuada', {
        event_category: 'Reservas',
        event_label: form.name,
        value: form.people,
        time_slot: form.time,
      });
    }
    onSubmit(form);
    onClose();
  };

  const availableSlots = getAvailableSlots(form.date);
  const timeHelper =
    errors.time
      ? (!form.time
          ? 'Horário é obrigatório'
          : isToday(form.date) && form.time < nowHHMM()
            ? 'Horário já passou para hoje'
            : 'Selecione um dos horários (17:00 a 20:00, a cada 30 min)')
      : (availableSlots.length === 0 && form.date ? 'Sem horários disponíveis hoje' : '');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
      <DialogContent>
        {/* Slider */}
        <Box sx={{ position: 'relative', width: '100%', height: 150, mb: 2, overflow: 'hidden', borderRadius: 1 }}>
          {images.map((src, idx) => (
            <Fade key={idx} in={idx === slideIndex} timeout={500} mountOnEnter unmountOnExit>
              <Box component="img" src={src} alt={`Slide ${idx + 1}`} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </Fade>
          ))}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Reservas entre <b>17:00 e 20:00</b>, em intervalos de <b>30 minutos</b>. Para hoje, horários passados são ocultados.
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
            error={errors.date}
            helperText={errors.date ? (!form.date ? 'Data é obrigatória' : 'Data anterior ao dia de hoje') : ''}
            fullWidth
            size="medium"
          />

          <FormControl fullWidth error={errors.time}>
            <InputLabel id="time-label">Qual horário?</InputLabel>
            <Select
              labelId="time-label"
              name="time"
              value={form.time}
              label="Qual horário?"
              onChange={handleChange}
              onBlur={handleBlur('time')}
            >
              {availableSlots.map((slot) => (
                <MenuItem key={slot} value={slot}>{slot}</MenuItem>
              ))}
            </Select>
            <FormHelperText>{timeHelper}</FormHelperText>
          </FormControl>

          <TextField
            label="Nome e Sobrenome"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur('name')}
            error={errors.name}
            helperText={errors.name ? 'Obrigatório' : ''}
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
            error={errors.phone}
            helperText={errors.phone ? 'Formato inválido' : ''}
            inputProps={{ inputMode: 'numeric' }}
            fullWidth
            size="medium"
          />

          <FormControl fullWidth error={errors.people}>
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
            {errors.people && <FormHelperText>Selecione um valor</FormHelperText>}
          </FormControl>

          <FormControl component="fieldset" error={errors.area}>
            <FormLabel component="legend">Área de Preferência</FormLabel>
            <RadioGroup row name="area" value={form.area} onChange={handleChange} onBlur={handleBlur('area')}>
              <FormControlLabel value="Coberta" control={<Radio />} label="Coberta" />
              <FormControlLabel value="Descoberta" control={<Radio />} label="Descoberta" />
              <FormControlLabel value="Porks Deck" control={<Radio />} label="Porks Deck" />
            </RadioGroup>
            {errors.area && <FormHelperText>Selecione uma área</FormHelperText>}
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
