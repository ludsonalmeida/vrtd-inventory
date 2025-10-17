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
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const PAGE_SIZE = 200; // ajuste se quiser
        let page = 1;
        let pageCount = 1;
        const all = [];

        // primeira chamada para obter pageCount
        const firstRes = await fetch(
          `${BASE_URL}/api/reservations?pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
        );
        if (!firstRes.ok) throw new Error(`Status ${firstRes.status}`);
        const firstData = await firstRes.json();

        const firstList = Array.isArray(firstData.data) ? firstData.data : [];
        all.push(...firstList);

        // tenta ler metadados de paginação do Strapi v4
        const meta = firstData?.meta?.pagination;
        pageCount = meta?.pageCount ?? 1;

        // busca as próximas páginas (se houver)
        while (page < pageCount) {
          page += 1;
          const res = await fetch(
            `${BASE_URL}/api/reservations?pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
          );
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data = await res.json();
          const list = Array.isArray(data.data) ? data.data : [];
          all.push(...list);
        }

        // opcional: ordenar (ex.: mais recente primeiro por createdAt)
        all.sort((a, b) => new Date(b?.createdAt ?? b?.attributes?.createdAt ?? 0) - new Date(a?.createdAt ?? a?.attributes?.createdAt ?? 0));

        setReservations(all);
      } catch (err) {
        console.error('Erro ao carregar reservas (todas páginas):', err);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [BASE_URL]);

  const openNew    = () => { setSelected(null); setModalOpen(true); };
  const openEdit   = (r)  => { setSelected(r);  setModalOpen(true); };
  const closeModal = ()   => { setSelected(null); setModalOpen(false); };

  const handleSubmit = async (formData) => {
    const url    = selected
      ? `${BASE_URL}/api/reservations/${selected._id || selected.id}`
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
      // Se o backend for Strapi, saved.data é o item; senão, use saved direto
      const savedItem = saved?.data ?? saved;

      setReservations(prev => {
        const getId = (x) => x._id || x.id;
        if (selected) {
          return prev.map(item => getId(item) === getId(savedItem) ? savedItem : item);
        }
        return [savedItem, ...prev];
      });
    } catch (err) {
      console.error('Erro ao salvar reserva:', err);
    }
  };

  const handleDelete = async (id) => {
    const realId = id || (typeof id === 'object' ? id._id || id.id : id);
    if (!window.confirm('Confirmar exclusão?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/reservations/${realId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setReservations(prev => prev.filter(r => (r._id || r.id) !== realId));
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
            {Array.isArray(reservations) && reservations.map(r => {
              // compat: Strapi v4 (r.attributes) ou objeto plano
              const attrs = r.attributes ?? r;
              return (
                <TableRow key={r._id || r.id} hover>
                  <TableCell>{new Date(attrs.createdAt).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{attrs.date ? new Date(attrs.date).toLocaleDateString('pt-BR') : ''}</TableCell>
                  <TableCell>{attrs.time}</TableCell>
                  <TableCell>{attrs.name}</TableCell>
                  <TableCell>{attrs.phone}</TableCell>
                  <TableCell>{attrs.people}</TableCell>
                  <TableCell>{attrs.area}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(r._id || r.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ReservationModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={selected?.attributes ?? selected}
      />
    </Container>
  );
}
