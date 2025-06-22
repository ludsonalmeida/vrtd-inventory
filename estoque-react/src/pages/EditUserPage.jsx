// src/pages/EditUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import ValidationAlert from '../components/ValidationAlert';

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loadingData, setLoadingData] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  // Redirect if not admin
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    } else if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [token, user, navigate]);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_URL}/api/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setFormValues({
          name: data.name || '',
          email: data.email || '',
          password: '',
          confirmPassword: '',
          role: data.role || 'user'
        });
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setAlertMessage('Erro ao carregar dados do usuário');
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setLoadingData(false);
      }
    }
    fetchUser();
  }, [API_URL, id, token]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  async function handleUpdate() {
    // Validations
    if (!formValues.name.trim()) {
      setAlertMessage('Nome é obrigatório'); setAlertSeverity('error'); setAlertOpen(true); return;
    }
    if (!formValues.email.trim()) {
      setAlertMessage('E-mail é obrigatório'); setAlertSeverity('error'); setAlertOpen(true); return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email.trim())) {
      setAlertMessage('E-mail inválido'); setAlertSeverity('error'); setAlertOpen(true); return;
    }
    if (formValues.password) {
      if (formValues.password.length < 6) {
        setAlertMessage('Senha deve ter no mínimo 6 caracteres'); setAlertSeverity('error'); setAlertOpen(true); return;
      }
      if (formValues.confirmPassword !== formValues.password) {
        setAlertMessage('As senhas não coincidem'); setAlertSeverity('error'); setAlertOpen(true); return;
      }
    }

    const payload = {
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      role: formValues.role
    };
    if (formValues.password) payload.password = formValues.password;

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setAlertMessage('Usuário atualizado com sucesso'); setAlertSeverity('success'); setAlertOpen(true);
      setTimeout(() => navigate('/users', { replace: true }), 1000);
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setAlertMessage('Erro ao atualizar usuário'); setAlertSeverity('error'); setAlertOpen(true);
    }
  }

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Editar Usuário
      </Typography>
      <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
        <TextField
          name="name" label="Nome" fullWidth sx={{ mb: 2 }}
          value={formValues.name} onChange={handleChange}
        />
        <TextField
          name="email" label="E-mail" type="email" fullWidth sx={{ mb: 2 }}
          value={formValues.email} onChange={handleChange}
        />
        <TextField
          name="password" label="Nova Senha" type="password" fullWidth sx={{ mb: 2 }}
          value={formValues.password} onChange={handleChange}
        />
        <TextField
          name="confirmPassword" label="Confirmar Senha" type="password" fullWidth sx={{ mb: 2 }}
          value={formValues.confirmPassword} onChange={handleChange}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="label-role">Função</InputLabel>
          <Select
            labelId="label-role" name="role" value={formValues.role} label="Função"
            onChange={handleChange}
          >
            <MenuItem value="manager">Gerente</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained" color="primary" onClick={handleUpdate}
          >
            Atualizar
          </Button>
        </Box>
      </Box>
      <ValidationAlert
        open={alertOpen} severity={alertSeverity} message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </Container>
  );
}
