// src/components/ReservationModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  FormLabel,
  FormHelperText,
  Fade
} from '@mui/material';

function formatPhone(value) {
  const digits = value.replace(/\D/g, '');
  const part1 = digits.slice(0, 2);
  let rest = digits.slice(2);
  let formatted = '';
  if (part1) formatted = `(${part1}) `;
  if (rest.length <= 5) formatted += rest;
  else formatted += `${rest.slice(0,5)}-${rest.slice(5,9)}`;
  return formatted;
}

/**
 * Props:
 *  - open: boolean
 *  - onClose: function
 *  - onSubmit: function (receives form data)
 *  - initialData: object|null
 *  - bannerImages: array of image URLs for the slider
 */
export default function ReservationModal({ open, onClose, onSubmit, initialData = null, bannerImages }) {
  const defaultImages = [
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9515.jpg',
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9512.jpg',
    'https://porks.nyc3.cdn.digitaloceanspaces.com/IMG_9511.jpg'
  ];
  const images = bannerImages && bannerImages.length ? bannerImages : defaultImages;

  // Slider state
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSlideIndex(prev => (prev + 1) % images.length), 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Refs for native pickers
  const dateRef = useRef(null);
  const timeRef = useRef(null);

  // Inicializa o formulário com people = 2
  const [form, setForm] = useState({ date: '', time: '', name: '', phone: '', people: 2, area: 'Coberta' });
  const [touched, setTouched] = useState({ date: false, time: false, name: false, phone: false, people: false, area: false });

  useEffect(() => {
    if (initialData) {
      const dateObj = new Date(initialData.date);
      const isoDate = dateObj.toISOString().split('T')[0];
      setForm({
        date: isoDate,
        time: initialData.time,
        name: initialData.name,
        phone: initialData.phone,
        people: initialData.people > 10 ? '10+' : initialData.people,
        area: initialData.area
      });
    } else {
      // Ao abrir modal sem dados iniciais, reinicia com people = 2
      setForm({ date: '', time: '', name: '', phone: '', people: 2, area: 'Coberta' });
    }
    setTouched({ date: false, time: false, name: false, phone: false, people: false, area: false });
  }, [initialData, open]);

  const handleChange = e => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const handlePhoneChange = e => setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
  const handleBlur = field => () => setTouched(prev => ({ ...prev, [field]: true }));

  // Validações de data apenas
  const today = new Date(); today.setHours(0,0,0,0);
  let dateValid = true;
  if (form.date) {
    const [y, m, d] = form.date.split('-').map(Number);
    dateValid = new Date(y, m - 1, d) >= today;
  }

  // Validações data+hora
  let dateTimeValid = false;
  if (form.date && form.time) {
    const [y, m, d] = form.date.split('-').map(Number);
    const [h, mi] = form.time.split(':').map(Number);
    dateTimeValid = new Date(y, m - 1, d, h, mi) >= new Date();
  }

  const errors = {
    date: touched.date && (!form.date || !dateValid),
    time: touched.time && (!form.time || !dateTimeValid),
    name: touched.name && !form.name.trim(),
    phone: touched.phone && form.phone.replace(/\D/g,'').length < 10,
    people: touched.people && !(form.people === '10+' || Number(form.people) >= 2),
    area: touched.area && !['Coberta', 'Descoberta', 'Porks Deck'].includes(form.area)
  };
  const isValid = ['date','time','name','phone','people','area'].every(f => !errors[f] && form[f]);

  // Ação de confirmação: envia dados e aciona evento personalizado do Meta Pixel
  const handleConfirm = () => {
    if (window.fbq) {
      window.fbq('trackCustom', 'Reserva Efetuada', { people: form.people, area: form.area });
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
      <DialogContent>
        {/* Slider de banner com transição suave */}
        <Box sx={{ position: 'relative', width: '100%', height: 150, mb: 2, overflow: 'hidden', borderRadius: 1 }}>
          {images.map((src, idx) => (
            <Fade key={idx} in={idx === slideIndex} timeout={500} mountOnEnter unmountOnExit>
              <Box component="img" src={src} alt={`Slide ${idx + 1}`} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            </Fade>
          ))}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Regras: data a partir de hoje e horário não anterior ao atual.
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
            onChange={handleChange}
            onBlur={handleBlur('date')}
            InputLabelProps={{ shrink: true }}
            error={errors.date}
            helperText={errors.date ? (!form.date ? 'Data é obrigatória' : 'Data anterior ao dia de hoje') : ''}
            fullWidth
          />

          <TextField
            label="Qual horário?"
            type="time"
            name="time"
            inputRef={timeRef}
            onFocus={() => timeRef.current?.showPicker?.()}
            value={form.time}
            onChange={handleChange}
            onBlur={handleBlur('time')}
            InputLabelProps={{ shrink: true }}
            error={errors.time}
            helperText={errors.time ? (!form.time ? 'Horário é obrigatório' : 'Horário anterior ao agora') : ''}
            fullWidth
          />

          <TextField
            label="Nome e Sobrenome"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur('name')}
            error={errors.name}
            helperText={errors.name ? 'Obrigatório' : ''}
            fullWidth
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
                <MenuItem key={i + 2} value={i + 2}>
                  {i + 2}
                </MenuItem>
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

          {/* Disclaimer */}
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Reservas a partir de 30 pessoas no Porks Deck têm atendimento exclusivo.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!isValid}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
