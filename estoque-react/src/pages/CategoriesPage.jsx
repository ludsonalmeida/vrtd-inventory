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
  CircularProgress
} from '@mui/material';
import { useCategory } from '../contexts/CategoryContext';
import { useAuth } from '../contexts/AuthContext';
import NavBarRestrita from '../components/NavBarRestrita';

export default function CategoriesPage() {
  const { user } = useAuth();
  const { categories, loading, addCategory, updateCategory, removeCategory } = useCategory();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [formValues, setFormValues] = useState({ name: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para confirmação de exclusão
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

  function handleAddClick() {
    setEditingCat(null);
    setFormValues({ name: '', description: '' });
    setErrorMsg('');
    setOpenDialog(true);
  }

  function handleEditClick(cat) {
    setEditingCat(cat);
    setFormValues({ name: cat.name, description: cat.description || '' });
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
      setErrorMsg('O nome é obrigatório');
      return;
    }
    try {
      if (editingCat) {
        await updateCategory(editingCat._id, {
          name: formValues.name.trim(),
          description: formValues.description.trim()
        });
      } else {
        await addCategory({
          name: formValues.name.trim(),
          description: formValues.description.trim()
        });
      }
      setOpenDialog(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao salvar categoria';
      setErrorMsg(msg);
    }
  }

  // Ao clicar em “Excluir”, pede confirmação
  function handleDeleteClick(cat) {
    setCatToDelete(cat);
    setConfirmOpen(true);
  }

  // Confirma exclusão
  async function handleConfirmDelete() {
    if (catToDelete) {
      try {
        await removeCategory(catToDelete._id);
      } catch (err) {
        console.error('Erro ao excluir categoria:', err);
        alert(err.response?.data?.error || 'Erro ao excluir categoria');
      }
      setCatToDelete(null);
    }
    setConfirmOpen(false);
  }

  // Cancela exclusão
  function handleCancelDelete() {
    setCatToDelete(null);
    setConfirmOpen(false);
  }

  return (
    <>
      {/* NavBar restrita para usuários logados */}
      <NavBarRestrita />

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Gestão de Categorias</Typography>
          {user.role === 'admin' && (
            <Button variant="contained" color="primary" onClick={handleAddClick}>
              Nova Categoria
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
                {categories.map(cat => (
                  <TableRow key={cat._id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.description || '-'}</TableCell>
                    <TableCell align="right">
                      {user.role === 'admin' ? (
                        <>
                          <Button size="small" onClick={() => handleEditClick(cat)}>
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(cat)}
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
              {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
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
              Tem certeza que deseja excluir a categoria&nbsp;
              <Typography component="span" variant="body1" fontWeight={700}>
                "{catToDelete?.name}"
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
