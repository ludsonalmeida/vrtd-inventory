// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import NavBarRestrita from '../components/NavBarRestrita';
import ValidationAlert from '../components/ValidationAlert';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register, loading: authLoading } = useAuth();

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // ou 'admin'
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  async function handleRegister() {
    // Validações: todos os campos obrigatórios
    if (!formValues.name.trim()) {
      setAlertMessage('Nome é obrigatório');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!formValues.email.trim()) {
      setAlertMessage('E-mail é obrigatório');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    // Regex simples para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email.trim())) {
      setAlertMessage('E-mail inválido');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!formValues.password) {
      setAlertMessage('Senha é obrigatória');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (formValues.password.length < 6) {
      setAlertMessage('Senha deve ter no mínimo 6 caracteres');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (formValues.confirmPassword !== formValues.password) {
      setAlertMessage('As senhas não coincidem');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!formValues.role) {
      setAlertMessage('Role é obrigatório');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      password: formValues.password,
      role: formValues.role,
    };

    try {
      await register(payload);
      // Depois que o registro for bem-sucedido, você pode redirecionar ou limpar campos:
      setFormValues({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
      setAlertMessage('Usuário cadastrado com sucesso');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err.response?.data || err);
      setAlertMessage(err.response?.data?.error || 'Erro ao cadastrar usuário');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }

  return (
    <>
      <NavBarRestrita />

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Cadastro de Usuário
        </Typography>

        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <TextField
            name="name"
            label="Nome"
            fullWidth
            sx={{ mb: 2 }}
            value={formValues.name}
            onChange={handleChange}
          />
          <TextField
            name="email"
            label="E-mail"
            type="email"
            fullWidth
            sx={{ mb: 2 }}
            value={formValues.email}
            onChange={handleChange}
          />
          <TextField
            name="password"
            label="Senha"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={formValues.password}
            onChange={handleChange}
          />
          <TextField
            name="confirmPassword"
            label="Confirmar Senha"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={formValues.confirmPassword}
            onChange={handleChange}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="label-role">Função</InputLabel>
            <Select
              labelId="label-role"
              name="role"
              value={formValues.role}
              label="Função"
              onChange={handleChange}
            >
              <MenuItem value="manager">Gerente</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegister}
              disabled={authLoading}
            >
              {authLoading ? <CircularProgress size={24} /> : 'Cadastrar'}
            </Button>
          </Box>
        </Box>

        {/* Alerta de validação */}
        <ValidationAlert
          open={alertOpen}
          severity={alertSeverity}
          message={alertMessage}
          onClose={() => setAlertOpen(false)}
        />
      </Container>
    </>
  );
}
