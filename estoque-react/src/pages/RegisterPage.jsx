// src/pages/RegisterPage.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import NavBarRestrita from '../components/NavBarRestrita';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        role: data.role
      });
      alert('Usuário cadastrado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cadastrar usuário');
    }
  }

  return (
    <>
      <NavBarRestrita />

      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h5" gutterBottom>
              Registrar Usuário
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', mt: 1 }}>
              <TextField
                margin="normal"
                fullWidth
                label="Email"
                type="email"
                {...register('email', { required: true })}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Senha"
                type="password"
                {...register('password', { required: true, minLength: 6 })}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Nível</InputLabel>
                <Select
                  defaultValue="user"
                  label="Role"
                  {...register('role')}
                >
                  <MenuItem value="worker">Funcionário</MenuItem>
                  <MenuItem value="manager">Gerente</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
              >
                Cadastrar
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
