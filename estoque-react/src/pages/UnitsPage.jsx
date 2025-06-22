// src/pages/UnitsPage.jsx

import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { useUnit } from '../contexts/UnitContext';
import ValidationAlert from '../components/ValidationAlert';
import { unitIcons } from '../icons/unitIcons';

export default function UnitsPage() {
  const { units, loading: unitLoading, addUnit, updateUnit, removeUnit } = useUnit();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    iconName: '',
  });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  // Todas as chaves de unitIcons, exceto 'default'
  const iconOptions = Object.keys(unitIcons).filter((key) => key !== 'default');

  // Abre diálogo de “Adicionar”
  function handleAddClick() {
    setEditingUnit(null);
    setFormValues({ name: '', description: '', iconName: '' });
    setOpenDialog(true);
  }

  // Abre diálogo de “Editar”
  function handleEditClick(unit) {
    setEditingUnit(unit);
    setFormValues({
      name: unit.name,
      description: unit.description || '',
      iconName: unit.iconName || '',
    });
    setOpenDialog(true);
  }

  // Ao clicar no ícone de excluir, abre diálogo de confirmação
  function handleDeleteClick(unit) {
    setUnitToDelete(unit);
    setConfirmOpen(true);
  }

  function handleClose() {
    setOpenDialog(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    // Validações front-end
    if (!formValues.name.trim()) {
      setAlertMessage('Nome da unidade é obrigatório');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    // Determina qual iconName usar:
    // - se estamos editando e o usuário não escolheu um novo, mantemos o antigo
    let chosenIconName = formValues.iconName;
    if (editingUnit) {
      if (!chosenIconName) {
        chosenIconName = editingUnit.iconName || '';
      }
    }

    if (!chosenIconName) {
      setAlertMessage('Selecione um ícone para a unidade');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      iconName: chosenIconName,
    };

    try {
      if (editingUnit) {
        await updateUnit(editingUnit._id, payload);
      } else {
        await addUnit(payload);
      }
      setOpenDialog(false);
    } catch (err) {
      console.error('Erro ao salvar unidade:', err.response?.data || err);
      setAlertMessage(err.response?.data?.error || 'Erro ao salvar unidade');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }

  // Despacha a exclusão após confirmação
  async function confirmDelete() {
    if (unitToDelete) {
      try {
        await removeUnit(unitToDelete._id);
      } catch (err) {
        console.error('Erro ao excluir unidade:', err.response?.data || err);
        setAlertMessage(err.response?.data?.error || 'Erro ao excluir unidade');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
      setUnitToDelete(null);
    }
    setConfirmOpen(false);
  }

  // Cancela exclusão
  function cancelDelete() {
    setUnitToDelete(null);
    setConfirmOpen(false);
  }

  if (unitLoading) {
    return (
      <>
     
        <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Carregando unidades...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
 

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Gerenciar Unidades</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
            Adicionar Unidade
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ícone</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units.map((unit) => {
                // Renderiza o componente de ícone correto
                const IconComponent = unitIcons[unit.iconName] || unitIcons.default;
                return (
                  <TableRow key={unit._id}>
                    <TableCell>
                      <IconComponent fontSize="medium" />
                    </TableCell>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEditClick(unit)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(unit)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo de Adicionar / Editar Unidade */}
        <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUnit ? 'Editar Unidade' : 'Adicionar Nova Unidade'}
          </DialogTitle>
          <DialogContent>
            <TextField
              name="name"
              label="Nome da Unidade"
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
              rows={2}
              sx={{ mt: 2 }}
              value={formValues.description}
              onChange={handleChange}
            />

            {/* Autocomplete para selecionar ícone */}
            <Autocomplete
              sx={{ mt: 2 }}
              options={iconOptions}
              getOptionLabel={(option) => option}
              isOptionEqualToValue={(opt, val) => opt === val}
              value={formValues.iconName || null}
              onChange={(e, newValue) => {
                setFormValues((prev) => ({
                  ...prev,
                  iconName: newValue || '',
                }));
              }}
              renderOption={(props, option) => {
                // Extrai "key" antes de espalhar o restante
                const { key, ...otherProps } = props;
                const IconComponent = unitIcons[option] || unitIcons.default;
                return (
                  <li key={key} {...otherProps}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent fontSize="small" />
                      <Typography>{option}</Typography>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => {
                // Mostra o ícone selecionado dentro do input
                const SelectedIcon = unitIcons[formValues.iconName] || unitIcons.default;
                return (
                  <TextField
                    {...params}
                    label="Ícone"
                    placeholder="Selecione um ícone"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: formValues.iconName ? (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                          <SelectedIcon fontSize="small" />
                        </Box>
                      ) : null,
                    }}
                  />
                );
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de confirmação de exclusão */}
        <Dialog open={confirmOpen} onClose={cancelDelete} maxWidth="xs" fullWidth>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
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
            <Button onClick={cancelDelete}>Cancelar</Button>
            <Button onClick={confirmDelete} color="error">
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
