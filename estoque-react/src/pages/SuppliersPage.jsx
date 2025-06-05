// src/pages/SuppliersPage.jsx
import React, { useState } from 'react';
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
import { useSupplier } from '../contexts/SupplierContext';
import { useAuth } from '../contexts/AuthContext';
import NavBarRestrita from '../components/NavBarRestrita';

export default function SuppliersPage() {
  const { suppliers, loading, addSupplier, updateSupplier, removeSupplier } = useSupplier();
  const { user } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Abrir diálogo (novo ou editar)
  function handleOpenDialog(supplier = null) {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormValues({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address ? JSON.stringify(supplier.address) : '',
        notes: supplier.notes || '',
      });
    } else {
      setEditingSupplier(null);
      setFormValues({ name: '', email: '', phone: '', address: '', notes: '' });
    }
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setOpenDialog(false);
    setEditingSupplier(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  // Salvar novo fornecedor ou atualizar existente
  async function handleSave() {
    const payload = {
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      // Converter JSON da address (se for um objeto)
      address: formValues.address ? JSON.parse(formValues.address) : {},
      notes: formValues.notes.trim(),
    };

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, payload);
      } else {
        await addSupplier(payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Erro ao salvar fornecedor:', err);
      alert(err.response?.data?.error || 'Erro ao salvar fornecedor');
    }
  }

  // Confirmar exclusão
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  function handleDeleteClick(sup) {
    setSupplierToDelete(sup);
    setConfirmDeleteOpen(true);
  }
  async function handleConfirmDelete() {
    await removeSupplier(supplierToDelete._id);
    setConfirmDeleteOpen(false);
    setSupplierToDelete(null);
  }
  function handleCancelDelete() {
    setConfirmDeleteOpen(false);
    setSupplierToDelete(null);
  }

  return (
    <>
      <NavBarRestrita />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Fornecedores</Typography>
          {user.role === 'admin' && (
            <Button variant="contained" onClick={() => handleOpenDialog()}>
              Novo Fornecedor
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
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((sup) => (
                  <TableRow key={sup._id}>
                    <TableCell>{sup.name}</TableCell>
                    <TableCell>{sup.email || '-'}</TableCell>
                    <TableCell>{sup.phone || '-'}</TableCell>
                    <TableCell>
                      {sup.address
                        ? `${sup.address.street || ''} ${sup.address.city || ''}`.trim()
                        : '-'}
                    </TableCell>
                    <TableCell>{sup.notes || '-'}</TableCell>
                    <TableCell align="right">
                      {user.role === 'admin' ? (
                        <>
                          <Button size="small" onClick={() => handleOpenDialog(sup)}>
                            Editar
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteClick(sup)}>
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

        {/* Dialog para criar/editar */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              fullWidth
              label="Nome"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Telefone"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Endereço (JSON)"
              name="address"
              value={formValues.address}
              onChange={handleChange}
              helperText='Ex.: {"street":"Rua A","city":"São Paulo","state":"SP"}'
            />
            <TextField
              margin="normal"
              fullWidth
              label="Notas"
              name="notes"
              value={formValues.notes}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmação de exclusão */}
        <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que quer excluir o fornecedor “{supplierToDelete?.name}”?
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
