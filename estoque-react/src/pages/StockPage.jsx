// src/pages/StockPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';

import { useStock } from '../contexts/StockContext';
import { useAuth } from '../contexts/AuthContext';
import { useCategory } from '../contexts/CategoryContext';
import { useUnit } from '../contexts/UnitContext';
import NavBarRestrita from '../components/NavBarRestrita';
import { unitIcons } from '../icons/unitIcons';

/**
 * Mapeia cada status para a porcentagem aproximada que será exibida na barra.
 */
const STATUS_PERCENT = {
  Cheio: 100,
  Meio: 50,
  Baixo: 20,
  Final: 2,
  Vazio: 0,
  'N/A': 0,
};

export default function StockPage() {
  // ─── Hooks no topo ───
  const { stock, loading: stockLoading, addItem, updateItem, removeItem } = useStock();
  const { user } = useAuth();
  const { categories, loading: catLoading } = useCategory();
  const { units, loading: unitLoading } = useUnit();
  const location = useLocation();
  // ──────────────────────

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({
    category: '',
    name: '',
    quantity: '',
    unit: '',
    status: 'N/A',
  });

  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);

  // Estados para confirmação de exclusão
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ① Carregar parâmetros da URL (se houver)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const filterParam = searchParams.get('filter');

    if (categoryParam) {
      setFilterCategory(categoryParam);
    }
    if (filterParam === 'low') {
      setShowLowOnly(true);
    }
  }, [location.search]);

  // Abrir diálogo para adicionar
  function handleAddClick() {
    setEditingItem(null);
    setFormValues({ category: '', name: '', quantity: '', unit: '', status: 'N/A' });
    setOpenDialog(true);
  }

  // Abrir diálogo para editar
  function handleEditClick(item) {
    setEditingItem(item);
    setFormValues({
      category: item.category?._id || '',
      name: item.name,
      quantity: item.quantity !== undefined ? item.quantity : '',
      unit: item.unit || '',
      status: item.status || 'N/A',
    });
    setOpenDialog(true);
  }

  // Fechar diálogo
  function handleClose() {
    setOpenDialog(false);
  }

  // Atualizar valores do formulário
  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  // Salvar (criar ou atualizar)
  async function handleSave() {
    if (!formValues.category || !formValues.name.trim()) {
      alert('Categoria e nome são obrigatórios');
      return;
    }

    const payload = {
      category: formValues.category,
      name: formValues.name.trim(),
      quantity: formValues.quantity !== '' ? Number(formValues.quantity) : undefined,
      unit: formValues.unit,
      status: formValues.status || 'N/A',
    };

    try {
      if (editingItem) {
        await updateItem(editingItem._id, payload);
      } else {
        await addItem(payload);
      }
      setOpenDialog(false);
    } catch (err) {
      console.error('Erro ao salvar item:', err);
      alert(err.response?.data?.error || 'Erro ao salvar item');
    }
  }

  // Ao clicar em “Excluir” antes de confirmar
  function handleDeleteClick(item) {
    setItemToDelete(item);
    setConfirmOpen(true);
  }

  // Confirma exclusão
  async function handleConfirmDelete() {
    if (itemToDelete) {
      try {
        await removeItem(itemToDelete._id);
      } catch (err) {
        console.error('Erro ao excluir item:', err);
        alert(err.response?.data?.error || 'Erro ao excluir item');
      }
      setItemToDelete(null);
    }
    setConfirmOpen(false);
  }

  // Cancela exclusão
  function handleCancelDelete() {
    setItemToDelete(null);
    setConfirmOpen(false);
  }

  // Filtragem combinada: nome, categoria e “low only”
  const filteredStock = stock
    .filter((item) => {
      const matchesName = item.name.toLowerCase().includes(filterName.toLowerCase());
      const matchesCategory = filterCategory ? item.category?._id === filterCategory : true;
      return matchesName && matchesCategory;
    })
    .filter((item) => {
      if (!showLowOnly) return true;
      if (item.status === 'Baixo') return true;
      if (item.quantity !== undefined && item.quantity <= 0) return true;
      return false;
    });

  /**
   * Renderiza a barra de progresso baseada no status.
   */
  function renderStatusBar(status) {
    const percent = STATUS_PERCENT[status] ?? 0;
    let barColor;
    switch (status) {
      case 'Cheio':
        barColor = '#4caf50';
        break;
      case 'Meio':
        barColor = '#2196f3';
        break;
      case 'Baixo':
        barColor = '#ff9800';
        break;
      case 'Final':
      case 'Vazio':
        barColor = '#f44336';
        break;
      default:
        barColor = '#757575';
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#333',
              '& .MuiLinearProgress-bar': {
                backgroundColor: barColor,
              },
            }}
          />
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ minWidth: 40 }}>
          {`${percent}%`}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <NavBarRestrita />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Gestão de Estoque</Typography>
          {user.role === 'admin' && (
            <Button variant="contained" color="primary" onClick={handleAddClick}>
              Adicionar Item
            </Button>
          )}
        </Box>

        {/* Se estoque, categorias ou unidades estiverem carregando, mostra spinner */}
        {(stockLoading || catLoading || unitLoading) ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Barra de filtros */}
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="Buscar por nome"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                fullWidth
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="label-filter-category">Filtrar por Categoria</InputLabel>
                <Select
                  labelId="label-filter-category"
                  value={filterCategory}
                  label="Filtrar por Categoria"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="label-low-only">Somente Baixo</InputLabel>
                <Select
                  labelId="label-low-only"
                  value={showLowOnly ? 'yes' : 'no'}
                  label="Somente Baixo"
                  onChange={(e) => setShowLowOnly(e.target.value === 'yes')}
                >
                  <MenuItem value="no">Não</MenuItem>
                  <MenuItem value="yes">Sim</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Tabela de itens filtrados */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Quantidade</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStock.map((item) => {
                    const IconComponent =
                      unitIcons[units.find((u) => u._id === item.unit)?.name] ||
                      unitIcons.default;

                    return (
                      <TableRow key={item._id}>
                        <TableCell>{item.category?.name || '-'}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {item.quantity !== undefined ? item.quantity : '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconComponent fontSize="small" />
                            <Typography>
                              {units.find((u) => u._id === item.unit)?.name || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{renderStatusBar(item.status || 'N/A')}</TableCell>
                        <TableCell align="right">
                          {user.role === 'admin' ? (
                            <>
                              <Button size="small" onClick={() => handleEditClick(item)}>
                                Editar
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(item)}
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
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Diálogo de Adicionar/Editar */}
        <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6" color="textPrimary">
              {editingItem ? 'Editar Item' : 'Adicionar Novo Item'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {/* Select de Categoria */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="label-dialog-category">Categoria</InputLabel>
              <Select
                labelId="label-dialog-category"
                name="category"
                value={formValues.category}
                label="Categoria"
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Nome do Item */}
            <TextField
              name="name"
              label="Nome do Item"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.name}
              onChange={handleChange}
            />

            {/* Quantidade (numérica) */}
            <TextField
              name="quantity"
              label="Quantidade"
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.quantity}
              onChange={handleChange}
            />

            {/* Autocomplete de Unidade */}
            <Autocomplete
              sx={{ mt: 2 }}
              options={units}
              getOptionLabel={(opt) => opt.name}
              isOptionEqualToValue={(opt, val) => opt._id === val?._id}
              value={units.find((u) => u._id === formValues.unit) || null}
              onChange={(e, newValue) => {
                setFormValues((prev) => ({
                  ...prev,
                  unit: newValue ? newValue._id : '',
                }));
              }}
              renderOption={(props, option) => {
                const IconComponent = unitIcons[option.name] || unitIcons.default;
                return (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent fontSize="small" />
                      <Typography>{option.name}</Typography>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => {
                const SelectedIcon = unitIcons[
                  units.find((u) => u._id === formValues.unit)?.name
                ] || unitIcons.default;

                return (
                  <TextField
                    {...params}
                    label="Unidade"
                    placeholder="Selecione uma unidade"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: formValues.unit ? (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          <SelectedIcon fontSize="small" />
                        </Box>
                      ) : null,
                    }}
                  />
                );
              }}
            />

            {/* Status */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="label-dialog-status">Status</InputLabel>
              <Select
                labelId="label-dialog-status"
                name="status"
                value={formValues.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="N/A">N/A</MenuItem>
                <MenuItem value="Cheio">Cheio</MenuItem>
                <MenuItem value="Meio">Meio</MenuItem>
                <MenuItem value="Final">Final</MenuItem>
                <MenuItem value="Baixo">Baixo</MenuItem>
                <MenuItem value="Vazio">Vazio</MenuItem>
              </Select>
            </FormControl>
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
              Tem certeza que deseja excluir o item&nbsp;
              <Typography component="span" variant="body1" fontWeight={700}>
                "{itemToDelete?.name}"
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
