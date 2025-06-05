// src/pages/LoginPage.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert
} from '@mui/material';

import Footer from "../components/FooterRestrito";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [serverError, setServerError] = React.useState('');

  async function onSubmit(data) {
    setServerError('');
    try {
      await signIn({ email: data.email, password: data.password });
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          {/* Logo inserida acima do título */}
          <Box component="img"
            src="https://porks.nyc3.cdn.digitaloceanspaces.com/porkstoq-white.png"
            alt="Logo"
            sx={{ width: 180, height: 'auto', mb: 2 }}
          />

          <Typography variant="h5" gutterBottom>
            
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              type="email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Formato de email inválido'
                }
              })}
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ''}
            />

            <TextField
              margin="normal"
              fullWidth
              label="Senha"
              type="password"
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter ao menos 6 caracteres'
                }
              })}
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ''}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Aqui inserimos o Footer */}
      <Footer />
    </Container>
  );
}
