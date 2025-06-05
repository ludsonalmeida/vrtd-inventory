// src/pages/UnitsPage.jsx
import React, { useState } from 'react';
import { useUnit } from '../contexts/UnitContext';
import { useAuth } from '../contexts/AuthContext';
import NavBarRestrita from '../components/NavBarRestrita';

import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';

export default function UnitsPage() {
  const { units, loading, addUnit, updateUnit, removeUnit } = useUnit();
  const { user } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formValues, setFormValues] = useState({ name: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para confirmação de exclusão
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);

  function handleAddClick() {
    setEditingUnit(null);
    setFormValues({ name: '', description: '' });
    setErrorMsg('');
    setOpenDialog(true);
  }

  function handleEditClick(unit) {
    setEditingUnit(unit);
    setFormValues({ name: unit.name, description: unit.description || '' });
    setErrorMsg('');
    setOpenDialog(true);
  }

  function handleClose() {
    setOpenDialog(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setErrorMsg('');
    if (!formValues.name.trim()) {
      setErrorMsg('O nome da unidade é obrigatório');
      return;
    }
    try {
      if (editingUnit) {
        await updateUnit(editingUnit._id, {
          name: formValues.name.trim(),
          description: formValues.description.trim()
        });
      } else {
        await addUnit({
          name: formValues.name.trim(),
          description: formValues.description.trim()
        });
      }
      setOpenDialog(false);
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao salvar unidade';
      setErrorMsg(message);
    }
  }

  function handleDeleteClick(unit) {
    setUnitToDelete(unit);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (unitToDelete) {
      try {
        await removeUnit(unitToDelete._id);
      } catch (err) {
        console.error('Erro ao excluir unidade:', err);
        alert(err.response?.data?.error || 'Erro ao excluir unidade');
      }
      setUnitToDelete(null);
    }
    setConfirmOpen(false);
  }

  function handleCancelDelete() {
    setUnitToDelete(null);
    setConfirmOpen(false);
  }

  return (
    <>
      <NavBarRestrita />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Gerenciar Unidades</Typography>
          {user.role === 'admin' && (
            <Button variant="contained" color="primary" onClick={handleAddClick}>
              Nova Unidade
            </Button>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {units.map(unit => (
                  <TableRow key={unit._id}>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.description || '-'}</TableCell>
                    <TableCell align="right">
                      {user.role === 'admin' ? (
                        <>
                          <Button size="small" onClick={() => handleEditClick(unit)}>
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(unit)}
                          >
                            Excluir
                          </Button>
                        </>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Acesso restrito
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Diálogo de Adicionar/Editar */}
        <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" color="textPrimary">
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              name="name"
              label="Nome"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.name}
              onChange={handleChange}
            />
            <TextField
              name="description"
              label="Descrição"
              fullWidth
              sx={{ mt: 2 }}
              multiline
              rows={3}
              value={formValues.description}
              onChange={handleChange}
            />
            {errorMsg && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {errorMsg}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de confirmação de exclusão */}
        <Dialog open={confirmOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
          <DialogTitle>
            <Typography variant="h6" color="error">
              Confirmar Exclusão
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="textPrimary">
              Tem certeza que deseja excluir a unidade&nbsp;
              <Typography component="span" variant="body1" fontWeight={700}>
                "{unitToDelete?.name}"
              </Typography>
              ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} color="error">
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
