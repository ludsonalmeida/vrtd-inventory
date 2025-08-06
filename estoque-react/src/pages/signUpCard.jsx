import React, { useState, useEffect } from 'react';
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
import FacebookIcon from '@mui/icons-material/Facebook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function ClubeChopeLanding() {
  // Carregar SDK do Facebook
  useEffect(() => {
    if (!document.getElementById('fb-root')) {
      const fbRoot = document.createElement('div');
      fbRoot.id = 'fb-root';
      document.body.prepend(fbRoot);
    }
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
      script.async = true;
      script.onload = () => {
        if (window.FB) {
          window.FB.init({
            appId: '1137904761202799', // substitua pelo seu App ID
            autoLogAppEvents: true,
            xfbml: false,                // se não usar plugins XFBML
            version: 'v12.0',
            cookie: true,
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  // Lookup modal state
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');

  // Confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Facebook login handler
  const handleFacebook = () => {
    if (!window.FB) {
      return alert('SDK do Facebook não carregado.');
    }

    window.FB.login(response => {
      if (response.authResponse) {
        window.FB.api(
          '/me',
          { fields: 'first_name,last_name,email' },
          user => {
            if (!user || user.error) {
              return alert('Não foi possível obter seus dados do Facebook.');
            }
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setEmail(user.email || '');
            setLookupOpen(false);
          }
        );
      } else {
        // o usuário cancelou ou não deu permissão
        console.log('Login não autorizado:', response);
      }
    }, { scope: 'public_profile,email' });
  };

  // Lookup by email (no password)
  const handleLookup = async () => {
    try {
      const res = await fetch(`/api/users?email=${encodeURIComponent(lookupEmail)}`);
      if (!res.ok) throw new Error('Falha ao buscar dados');
      const user = await res.json();
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCpf(user.cpf || '');
      setLookupOpen(false);
    } catch (err) {
      alert('Erro ao buscar dados: ' + err.message);
    }
  };

  // Submit form
  const handleSubmit = () => {
    // chamada para cadastro no backend
    // ex: fetch('/api/cartao', { method: 'POST', body: JSON.stringify({ firstName, lastName, email, phone, cpf }) })
    setConfirmOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ maxWidth: 400, width: '100%', p: 3 }} elevation={3}>
        <Typography variant="h5" gutterBottom align="center">
          Clube do Chope - Cadastro
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Social / Lookup buttons */}
          <Button startIcon={<FacebookIcon />} variant="contained" color="primary" onClick={handleFacebook}>
            Cadastrar com Facebook
          </Button>
          <Button startIcon={<AccountCircleIcon />} variant="outlined" onClick={() => setLookupOpen(true)}>
            Preencher com Email
          </Button>

          {/* Form fields */}
          <TextField label="Nome" value={firstName} onChange={e => setFirstName(e.target.value)} fullWidth />
          <TextField label="Sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} fullWidth />
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
          <TextField label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} fullWidth />
          <TextField label="CPF" value={cpf} onChange={e => setCpf(e.target.value)} fullWidth />

          <Button variant="contained" color="secondary" fullWidth onClick={handleSubmit}>
            Confirmar Cadastro
          </Button>
        </Box>
      </Paper>

      {/* Email Lookup Modal */}
      <Dialog open={lookupOpen} onClose={() => setLookupOpen(false)}>
        <DialogTitle>Preencher com Email</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Email"
            type="email"
            value={lookupEmail}
            onChange={e => setLookupEmail(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLookupOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleLookup}>Buscar Dados</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Cadastro Realizado!</DialogTitle>
        <DialogContent>
          <Typography>
            Para retirar seu cartão no balcão será cobrada uma taxa de R$ 5,00 na primeira carga. Você ganhará 10% de cashback sobre o valor carregado na primeira carga.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
