// src/pages/CategoriesPage.jsx

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

import { useCategory } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import ValidationAlert from '../components/ValidationAlert';

export default function CategoriesPage() {
  const { 
    categories, 
    loading, 
    addCategory, 
    updateCategory, 
    removeCategory 
  } = useCategory();
  const { user } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formValues, setFormValues] = useState({ name: '', description: '' });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Estados para alertas de validação
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  function handleAddClick() {
    setEditingCategory(null);
    setFormValues({ name: '', description: '' });
    setOpenDialog(true);
  }

  function handleEditClick(category) {
    setEditingCategory(category);
    setFormValues({ 
      name: category.name || '', 
      description: category.description || '' 
    });
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setOpenDialog(false);
    setEditingCategory(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    // Validações: name e description são obrigatórios
    if (!formValues.name.trim()) {
      setAlertMessage('Nome da categoria é obrigatório');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }
    if (!formValues.description.trim()) {
      setAlertMessage('Descrição da categoria é obrigatória');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, payload);
      } else {
        await addCategory(payload);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Erro ao salvar categoria:', err.response?.data || err);
      setAlertMessage(err.response?.data?.error || 'Erro ao salvar categoria');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }

  function handleDeleteClick(category) {
    setCategoryToDelete(category);
    setConfirmOpen(true);
  }

  function handleCancelDelete() {
    setCategoryToDelete(null);
    setConfirmOpen(false);
  }

  async function handleConfirmDelete() {
    if (!categoryToDelete) return;
    try {
      await removeCategory(categoryToDelete._id);
    } catch (err) {
      console.error('Erro ao remover categoria:', err.response?.data || err);
      setAlertMessage(err.response?.data?.error || 'Erro ao remover categoria');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
    setCategoryToDelete(null);
    setConfirmOpen(false);
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Categorias</Typography>
          {user.role === 'admin' && (
            <Button variant="contained" color="primary" onClick={handleAddClick}>
              Adicionar Categoria
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
                {categories.map(category => (
                  <TableRow key={category._id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell align="right">
                      {user.role === 'admin' ? (
                        <>
                          <Button
                            size="small"
                            onClick={() => handleEditClick(category)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(category)}
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
            {editingCategory ? 'Editar Categoria' : 'Adicionar Categoria'}
          </DialogTitle>
          <DialogContent>
            <TextField
              name="name"
              label="Nome da Categoria"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.name}
              onChange={handleChange}
            />
            <TextField
              name="description"
              label="Descrição"
              fullWidth
              multiline
              rows={3}
              sx={{ mt: 2 }}
              value={formValues.description}
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
              Tem certeza que deseja excluir a categoria&nbsp;
              <Typography component="span" variant="body1" fontWeight={700}>
                "{categoryToDelete?.name}"
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
