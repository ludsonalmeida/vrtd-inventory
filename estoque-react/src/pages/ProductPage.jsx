import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Box, Typography, Divider, Button, Tooltip, Paper,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Autocomplete, CircularProgress, Pagination,
  InputAdornment, IconButton, TableSortLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';


import api from '../services/api';
import { useProduct } from '../contexts/ProductContext';
import { useSupplier } from '../contexts/SupplierContext';
import ValidationAlert from '../components/ValidationAlert';

export default function ProductPage() {
  // --- Estados de ordenação ---
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  // --- Contextos, filtros, paginação etc. ---
  const { products, loading, addProduct, updateProduct, removeProduct } = useProduct();
  const { suppliers, loading: supLoading } = useSupplier();
  const [filterName, setFilterName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Estados diálogo manual
  const [openManual, setOpenManual] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [manualValues, setManualValues] = useState({
    name: '', supplier: '', avgPrice: '', description: ''
  });
  const [manualSaving, setManualSaving] = useState(false);

  // Estados exclusão
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Estados importação
  const [importSupplier, setImportSupplier] = useState('');
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scanned, setScanned] = useState([]);
  const [importing, setImporting] = useState(false);

  // Alerts
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [alertSev, setAlertSev] = useState('error');

  useEffect(() => setCurrentPage(1), [filterName]);

  // Helpers
  // 3) Função para alternar ordenação:
  const handleSort = (field) => {
    if (orderBy === field) {
      setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrder('asc');
    }
  };
  const getSupplierLabel = s => s.name;
  const isSupplierEqual = (a, b) => a._id === b._id;
  const showAlert = (msg, sev = 'error') => {
    setAlertMsg(msg); setAlertSev(sev); setAlertOpen(true);
  };


  // Filtragem + ordenação
  const filtered = useMemo(() => {
    let arr = Array.isArray(products)
      ? products.filter(p =>
        p.name.toLowerCase().includes(filterName.toLowerCase())
      )
      : [];
    if (startDate) {
      const start = new Date(startDate);
      arr = arr.filter(p => new Date(p.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      arr = arr.filter(p => new Date(p.createdAt) <= end);
    }
    if (supplierFilter) {
      arr = arr.filter(p => p.supplier?._id === supplierFilter);
    }
    arr.sort((a, b) => {
      let aVal = orderBy === 'supplier'
        ? (a.supplier?.name || '').toLowerCase()
        : (String(a[orderBy]) || '').toLowerCase();
      let bVal = orderBy === 'supplier'
        ? (b.supplier?.name || '').toLowerCase()
        : (String(b[orderBy]) || '').toLowerCase();
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [products, filterName, startDate, endDate, supplierFilter, orderBy, order]);

  const anyLoading = loading || supLoading;
  // Paginação
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // — Manual Form Handlers —
  const openAdd = () => {
    setEditingItem(null);
    setManualValues({ name: '', supplier: '', avgPrice: '', description: '' });
    setOpenManual(true);
  };
  const openEdit = item => {
    setEditingItem(item);
    setManualValues({
      name: item.name,
      supplier: item.supplier?._id || '',
      avgPrice: item.avgPrice?.toString() || '',
      description: item.description || ''
    });
    setOpenManual(true);
  };
  const closeManual = () => {
    if (manualSaving) return;
    setOpenManual(false);
  };
  const handleManualChange = e => {
    const { name, value } = e.target;
    setManualValues(v => ({ ...v, [name]: value }));
  };
  const handleManualSave = async () => {
    if (manualSaving) return;

    // Verificação de duplicata (desconsiderar o próprio produto se estiver editando)
    const exists = products.some(
      p =>
        p.name.toLowerCase() === manualValues.name.trim().toLowerCase() &&
        (!editingItem || p._id !== editingItem._id)
    );
    if (exists) {
      showAlert('Já existe outro produto com esse nome', 'warning');
      return;
    }

    // Validações
    if (!manualValues.name.trim()) return showAlert('Nome é obrigatório');
    if (!manualValues.supplier) return showAlert('Fornecedor é obrigatório');

    const payload = {
      name: manualValues.name.trim(),
      supplier: manualValues.supplier,
      avgPrice: Number(manualValues.avgPrice) || 0,
      description: manualValues.description
    };

    setManualSaving(true);
    try {
      if (editingItem) {
        await updateProduct(editingItem._id, payload);
      } else {
        await addProduct(payload);
      }
      closeManual();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || 'Erro ao salvar produto');
    } finally {
      setManualSaving(false);
    }
  };


  // — Delete Handlers —
  const openDelete = item => {
    setEditingItem(item);
    setDeleteOpen(true);
  };
  const cancelDelete = () => setDeleteOpen(false);
  const confirmDelete = async () => {
    try {
      await removeProduct(editingItem._id);
      cancelDelete();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || 'Erro ao excluir produto');
    }
  };

  // — Invoice Import Handlers —
  const handleScan = async () => {
    if (!importSupplier) return showAlert('Selecione um fornecedor');
    if (!file) return showAlert('Selecione um arquivo');
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append('invoice', file);
      const res = await api.post('/products/scan-invoice', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });
      let arr = [];
      const p = res.data;
      if (p.products?.products) arr = p.products.products;
      else if (Array.isArray(p.products)) arr = p.products;
      else if (Array.isArray(p.data)) arr = p.data;
      else if (Array.isArray(p)) arr = p;
      if (arr.length) {
        setScanned(arr);
        setPreviewOpen(true);
      } else showAlert('Nenhum produto encontrado', 'warning');
    } catch (err) {
      console.error(err);
      showAlert('Erro ao processar nota', 'error');
    } finally {
      setScanning(false);
    }
  };
  const handleScannedChange = (i, field, val) => {
    setScanned(s => {
      const tmp = [...s];
      tmp[i] = { ...tmp[i], [field]: val };
      return tmp;
    });
  };

  // — Novo: remover produto da pré-lista —
  const handleRemoveScanned = idx => {
    setScanned(prev => prev.filter((_, i) => i !== idx));
  };

  const handleImport = async () => {
    setPreviewOpen(false);
    setImporting(true);

    const duplicates = [];
    const imported = [];

    for (const p of scanned) {
      // checa duplicata pelo nome (case-insensitive)
      const exists = products.some(
        prod => prod.name.toLowerCase() === p.name.trim().toLowerCase()
      );
      if (exists) {
        duplicates.push(p.name);
        continue;
      }

      try {
        await addProduct({
          name: p.name,
          supplier: importSupplier,
          avgPrice: Number(p.unitPrice) || 0,
          description: p.description || ''
        });
        imported.push(p.name);
      } catch (err) {
        console.error(`Erro ao importar produto ${p.name}:`, err.response?.data || err.message);
        duplicates.push(p.name);
      }
    }

    setImporting(false);

    if (duplicates.length) {
      showAlert(
        `Produtos já existentes e ignorados:\n• ${duplicates.join('\n• ')}`,
        'info'
      );
    } else {
      showAlert('Importação concluída com sucesso!', 'success');
    }

    setScanned([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: React.useCallback(files => {
      if (files.length) setFile(files[0]);
    }, [setFile]),
    accept: { 'image/*': [], 'application/pdf': [] }
  });



  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

        {/* === Manual Section === */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Gestão de Produtos</Typography>
          <Button variant="contained" onClick={openAdd}>Adicionar Produto</Button>
        </Box>

        {/* === Import Section === */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5">Importar via Nota Fiscal</Typography>
        <br />
        <Box display="flex" alignItems="center" mb={2}>
          <Autocomplete
            sx={{ width: 300 }}
            options={suppliers}
            getOptionLabel={getSupplierLabel}
            isOptionEqualToValue={isSupplierEqual}
            value={suppliers.find(s => s._id === importSupplier) || null}
            onChange={(_, v) => setImportSupplier(v ? v._id : '')}
            renderInput={params => <TextField {...params} label="Fornecedor" />}
          />
        </Box>


        <Box mb={4}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #1976d2',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: isDragActive ? 'rgba(25,118,210,0.1)' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            <UploadFileIcon sx={{ fontSize: 48, color: '#1976d2' }} />
            <Typography sx={{ mt: 1 }}>
              {isDragActive
                ? 'Solte a nota aqui...'
                : file
                  ? file.name
                  : 'Arraste sua nota fiscal ou clique para selecionar'}
            </Typography>
          </Box>

          <Tooltip title="Necessário assimilar um fornecedor" arrow>
            <span>
              <Button
                variant="outlined"
                onClick={handleScan}
                disabled={scanning || !importSupplier || !file}
                sx={{ mt: 2 }}
              >
                {scanning ? <CircularProgress size={20} /> : 'Processar Nota'}
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* === Product Table === */}
        {(anyLoading) ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : (
          <>
            <TextField
              label="Buscar por nome"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              fullWidth sx={{ mb: 2 }}
            />
            <br />

            <Box display="flex" gap={2} mb={2}>
              {/* Data Inicial */}
              <TextField
                label="Data Início"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              {/* Data Final */}
              <TextField
                label="Data Final"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              {/* Fornecedor */}
              <Autocomplete
                sx={{ width: 300 }}
                options={suppliers}
                getOptionLabel={s => s.name}
                isOptionEqualToValue={(o, v) => o._id === v._id}
                value={suppliers.find(s => s._id === supplierFilter) || null}
                onChange={(_, v) => setSupplierFilter(v ? v._id : '')}
                renderInput={params => <TextField {...params} label="Fornecedor" />}
              />
            </Box>

            {/* Resumo à direita */}
            <Box display="flex" justifyContent="flex-end" mb={1}>
              <Typography variant="body2">
                Registros: {filtered.length} — Filtrados: {paginated.length}
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'name'}
                        direction={order}
                        onClick={() => handleSort('name')}
                      >
                        Nome
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'supplier'}
                        direction={order}
                        onClick={() => handleSort('supplier')}
                      >
                        Fornecedor
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'avgPrice'}
                        direction={order}
                        onClick={() => handleSort('avgPrice')}
                      >
                        Preço Unit.
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'description'}
                        direction={order}
                        onClick={() => handleSort('description')}
                      >
                        Descrição
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map(item => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.supplier?.name || '-'}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(item.avgPrice || 0)}
                      </TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="warning" onClick={() => openEdit(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => openDelete(item)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, p) => setCurrentPage(p)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* === Manual Add/Edit Dialog === */}
        <Dialog open={openManual} onClose={closeManual} maxWidth="sm" fullWidth>
          <DialogTitle>{editingItem ? 'Editar Produto' : 'Adicionar Produto'}</DialogTitle>
          <DialogContent>
            <Autocomplete
              freeSolo
              sx={{ mt: 2 }}
              options={products.map(p => p.name)}
              value={manualValues.name}
              onChange={(_, v) => setManualValues(m => ({ ...m, name: v || '' }))}
              inputValue={manualValues.name}
              onInputChange={(_, text) => setManualValues(m => ({ ...m, name: text }))}
              renderInput={params => (
                <TextField
                  {...params}
                  name="name"
                  label="Nome do Produto"
                  fullWidth
                  disabled={manualSaving}
                />
              )}
            />
            <Autocomplete
              sx={{ mt: 2 }}
              options={suppliers}
              getOptionLabel={getSupplierLabel}
              isOptionEqualToValue={isSupplierEqual}
              value={suppliers.find(s => s._id === manualValues.supplier) || null}
              onChange={(_, v) => setManualValues(m => ({ ...m, supplier: v ? v._id : '' }))}
              renderInput={params => <TextField {...params} label="Fornecedor" fullWidth disabled={manualSaving} />}
            />
            <TextField
              name="avgPrice"
              label="Preço Médio"
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={manualValues.avgPrice}
              onChange={handleManualChange}
              disabled={manualSaving}
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            />
            <TextField
              name="description"
              label="Descrição"
              fullWidth multiline rows={3}
              sx={{ mt: 2 }}
              value={manualValues.description}
              onChange={handleManualChange}
              disabled={manualSaving}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeManual} disabled={manualSaving}>Cancelar</Button>
            <Button variant="contained" onClick={handleManualSave} disabled={manualSaving}>
              {manualSaving ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* === Delete Confirmation === */}
        <Dialog open={deleteOpen} onClose={cancelDelete} maxWidth="xs" fullWidth>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>Tem certeza que deseja excluir “<strong>{editingItem?.name}</strong>”?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete}>Cancelar</Button>
            <Button color="error" onClick={confirmDelete}>Excluir</Button>
          </DialogActions>
        </Dialog>

        {/* === Preview & Import Dialog === */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Confirme e Edite antes de Importar</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell sx={{ width: '50%' }}>Nome</TableCell>
                    <TableCell sx={{ width: '25%' }}>Valor Unitário</TableCell>
                    <TableCell sx={{ width: '25%' }}>Descrição</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scanned.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell padding="checkbox">
                        <IconButton size="small" onClick={() => handleRemoveScanned(i)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </TableCell>

                      <TableCell sx={{ width: '50%' }}>
                        <Autocomplete
                          freeSolo
                          size="small"
                          options={products.map(prod => prod.name)}
                          inputValue={p.name}
                          onInputChange={(_, text) => handleScannedChange(i, 'name', text)}
                          renderInput={params => (
                            <TextField
                              {...params}
                              fullWidth
                              placeholder="Nome do produto"
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell sx={{ width: '25%' }}>
                        <TextField
                          size="small"
                          type="number"
                          value={p.unitPrice}
                          onChange={e => handleScannedChange(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment
                                position="start"
                                sx={{
                                  backgroundColor: 'black',
                                  color: 'orange',
                                  fontWeight: 'bold',
                                  px: 0.5,
                                  borderTopLeftRadius: 4,
                                  borderBottomLeftRadius: 4
                                }}
                              >
                                R$
                              </InputAdornment>
                            )
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ width: '25%' }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={p.description || ''}
                          onChange={e => handleScannedChange(i, 'description', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleImport} disabled={importing}>
              {importing ? <CircularProgress size={20} /> : 'Importar Tudo'}
            </Button>
          </DialogActions>
        </Dialog>

        <ValidationAlert
          open={alertOpen}
          severity={alertSev}
          message={alertMsg}
          onClose={() => setAlertOpen(false)}
        />
      </Container>
    </>
  );
}
