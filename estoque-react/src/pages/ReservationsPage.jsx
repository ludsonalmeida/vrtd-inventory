// src/pages/ReservationsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
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
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReservationModal from '../components/ReservationModal';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);

  // Usa URL absoluta do backend para evitar proxy
  const BASE_URL = 'http://localhost:4000';

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE_URL}/api/reservations`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        console.log('API Response:', data); // Log para depuração
        setReservations(Array.isArray(data.data) ? data.data : []); // Garante que seja um array válido
      } catch (err) {
        console.error('Erro ao carregar reservas:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openNew    = () => { setSelected(null); setModalOpen(true); };
  const openEdit   = (r)  => { setSelected(r);  setModalOpen(true); };
  const closeModal = ()   => { setSelected(null); setModalOpen(false); };

  const handleSubmit = async (formData) => {
    const url    = selected
      ? `${BASE_URL}/api/reservations/${selected._id}`
      : `${BASE_URL}/api/reservations`;
    const method = selected ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error('Erro ao salvar reserva:', res.status, errBody);
        return;
      }
      const saved = await res.json();
      setReservations(prev =>
        selected ? prev.map(item => item._id === saved._id ? saved : item)
                 : [saved, ...prev]
      );
    } catch (err) {
      console.error('Erro ao salvar reserva:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmar exclusão?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/reservations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setReservations(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Erro ao excluir reserva:', err);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography>Carregando reservas...</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
        <Typography variant="h5">Reservas</Typography>
        <Button variant="contained" onClick={openNew}>
          Nova Reserva
        </Button>
      </Toolbar>

      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Data de Cadastro</TableCell>
              <TableCell>Data de Reserva</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Pessoas</TableCell>
              <TableCell>Área</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(reservations) && reservations.map(r => (
              <TableRow key={r._id} hover>
                <TableCell>{new Date(r.createdAt).toLocaleString('pt-BR')}</TableCell>
                <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                <TableCell>{r.time}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>{r.people}</TableCell>
                <TableCell>{r.area}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(r)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(r._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ReservationModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={selected}
      />
    </Container>
  );
}
