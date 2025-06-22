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
import ValidationAlert from '../components/ValidationAlert';

export default function SuppliersPage() {
  const { suppliers, loading, addSupplier, updateSupplier, removeSupplier } = useSupplier();
  const { user } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  // Estados para alertas de validação
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  function handleAddClick() {
    setEditingSupplier(null);
    setFormValues({ name: '', cnpj: '', email: '', phone: '' });
    setOpenDialog(true);
  }

  function handleEditClick(supplier) {
    setEditingSupplier(supplier);
    setFormValues({
      name: supplier.name || '',
      cnpj: supplier.cnpj || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
    });
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

  async function handleSave() {
    // Validações: todos os campos são obrigatórios
    if (!formValues.name.trim()) {
      setAlertMessage('Nome do fornecedor é obrigatório');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!formValues.cnpj.trim()) {
      setAlertMessage('CNPJ é obrigatório');
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
    if (!formValues.phone.trim()) {
      setAlertMessage('Telefone é obrigatório');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      cnpj: formValues.cnpj.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
    };

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, payload);
      } else {
        await addSupplier(payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Erro ao salvar fornecedor:', err.response?.data || err);
      setAlertMessage(err.response?.data?.error || 'Erro ao salvar fornecedor');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }

  function handleDeleteClick(supplier) {
    setSupplierToDelete(supplier);
    setConfirmOpen(true);
  }

  function handleCancelDelete() {
    setSupplierToDelete(null);
    setConfirmOpen(false);
  }

  async function handleConfirmDelete() {
    if (!supplierToDelete) return;
    try {
      await removeSupplier(supplierToDelete._id);
    } catch (err) {
      console.error('Erro ao remover fornecedor:', err.response?.data || err);
      setAlertMessage(err.response?.data?.error || 'Erro ao remover fornecedor');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
    setSupplierToDelete(null);
    setConfirmOpen(false);
  }

  return (
    <>
       <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Fornecedores</Typography>
          {user.role === 'admin' && (
            <Button variant="contained" color="primary" onClick={handleAddClick}>
              Adicionar Fornecedor
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
                  <TableCell>CNPJ</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map(supplier => (
                  <TableRow key={supplier._id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.cnpj}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell align="right">
                      {user.role === 'admin' ? (
                        <>
                          <Button size="small" onClick={() => handleEditClick(supplier)}>
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(supplier)}
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

        {/* Diálogo de adicionar/editar */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingSupplier ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
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
              name="cnpj"
              label="CNPJ"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.cnpj}
              onChange={handleChange}
            />
            <TextField
              name="email"
              label="E-mail"
              type="email"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.email}
              onChange={handleChange}
            />
            <TextField
              name="phone"
              label="Telefone"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.phone}
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

        {/* Diálogo de confirmação de exclusão */}
        <Dialog
          open={confirmOpen}
          onClose={handleCancelDelete}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography variant="body1" color="textPrimary">
              Tem certeza que deseja excluir o fornecedor&nbsp;
              <Typography component="span" variant="body1" fontWeight={700}>
                "{supplierToDelete?.name}"
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
