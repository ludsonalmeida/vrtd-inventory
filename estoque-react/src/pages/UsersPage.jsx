// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ValidationAlert from '../components/ValidationAlert';

export default function UsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Redireciona se não estiver autenticado ou não for admin
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    } else if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [token, user, navigate]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  console.log('Using API_URL:', API_URL);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  // Carrega usuários com autorização
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(err => {
        console.error('Falha ao carregar usuários:', err);
        setAlertMessage('Falha ao carregar usuários');
        setAlertSeverity('error');
        setAlertOpen(true);
      })
      .finally(() => setLoading(false));
  }, [API_URL, token]);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    fetch(`${API_URL}/api/users/${deleteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setUsers(prev => prev.filter(u => u._id !== deleteId));
        setAlertMessage('Usuário excluído com sucesso');
        setAlertSeverity('success');
      })
      .catch(err => {
        console.error('Erro ao excluir usuário:', err);
        setAlertMessage('Erro ao excluir usuário');
        setAlertSeverity('error');
      })
      .finally(() => {
        setAlertOpen(true);
        setDialogOpen(false);
        setDeleteId(null);
      });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Carregando usuários...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Toolbar disableGutters sx={{ mb: 2, px: 0 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Usuários
        </Typography>
        <Button
          component={Link}
          to="/register"
          variant="contained"
          color="primary"
        >
          Cadastrar Usuário
        </Button>
      </Toolbar>

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '30%' }}>Nome</TableCell>
              <TableCell sx={{ width: '30%' }}>Email</TableCell>
              <TableCell sx={{ width: '20%' }}>Função</TableCell>
              <TableCell align="right" sx={{ width: '20%' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map(userRow => (
                <TableRow key={userRow._id} hover>
                  <TableCell>{userRow.name}</TableCell>
                  <TableCell>{userRow.email}</TableCell>
                  <TableCell>{userRow.role}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      to={`/users/edit/${userRow._id}`} size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => confirmDelete(userRow._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir este usuário?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>

      <ValidationAlert
        open={alertOpen}
        severity={alertSeverity}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </Container>
  );
}