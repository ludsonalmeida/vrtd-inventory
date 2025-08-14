import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

export default function SignupCard() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'confirm' | 'form'
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', cpf: '', email: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleNext = async () => {
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const user = await res.json();
        // split full name
        const [firstName, ...rest] = user.name.split(' ');
        const lastName = rest.join(' ');
        setUserData({ firstName, lastName, email: user.email });
        setStep('confirm');
      } else if (res.status === 404) {
        setFormData(prev => ({ ...prev, email }));
        setStep('form');
      } else {
        throw new Error('Erro na busca de usuário');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmUser = async () => {
    // cadastra cartão para usuário existente
    await fetch('/api/cartao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    setConfirmOpen(true);
  };

  const handleChange = field => e => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmitForm = async () => {
    // cadastra cartão para novo usuário + formData
    await fetch('/api/cartao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setConfirmOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {step === 'email' && (
        <Paper sx={{ p: 3, width: 360 }} elevation={3}>
          <Typography variant="h6" gutterBottom>Informe seu e-mail</Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleNext} disabled={!email}>
            Próximo
          </Button>
        </Paper>
      )}

      {step === 'confirm' && (
        <Dialog open onClose={() => setStep('email')}>
          <DialogTitle>Confirme seus dados</DialogTitle>
          <DialogContent dividers>
            <Typography>Nome: {userData.firstName} {userData.lastName}</Typography>
            <Typography>Email: {userData.email}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStep('email')}>Voltar</Button>
            <Button variant="contained" onClick={handleConfirmUser}>Confirmar Dados</Button>
          </DialogActions>
        </Dialog>
      )}

      {step === 'form' && (
        <Paper sx={{ p: 3, width: 360 }} elevation={3}>
          <Typography variant="h6" gutterBottom>Cadastre seus dados</Typography>
          <TextField label="Nome" value={formData.firstName} onChange={handleChange('firstName')} fullWidth sx={{ mb: 1 }} />
          <TextField label="Sobrenome" value={formData.lastName} onChange={handleChange('lastName')} fullWidth sx={{ mb: 1 }} />
          <TextField label="Email" type="email" value={formData.email} disabled fullWidth sx={{ mb: 1 }} />
          <TextField label="Telefone" value={formData.phone} onChange={handleChange('phone')} fullWidth sx={{ mb: 1 }} />
          <TextField label="CPF" value={formData.cpf} onChange={handleChange('cpf')} fullWidth sx={{ mb: 2 }} />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmitForm}
            disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.cpf}
          >
            Confirmar Cadastro
          </Button>
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Cadastro Realizado!</DialogTitle>
        <DialogContent>
          <Typography>
            Para retirar seu cartão no balcão será cobrada uma taxa de R$ 5,00 na primeira carga. Você ganhará 10% de cashback sobre o valor carregado na primeira carga.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}