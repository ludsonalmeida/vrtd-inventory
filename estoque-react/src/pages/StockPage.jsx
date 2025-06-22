// src/pages/StockPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  TableSortLabel,
  Pagination,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStock } from '../contexts/StockContext';
import { useAuth } from '../contexts/AuthContext';
import { useCategory } from '../contexts/CategoryContext';
import { useUnit } from '../contexts/UnitContext';
import { useSupplier } from '../contexts/SupplierContext';
import ValidationAlert from '../components/ValidationAlert';
import { unitIcons } from '../icons/unitIcons';
import { useProduct } from '../contexts/ProductContext';
import { parseContagemWithOpenAI } from '../utils/openai';
import { LoadingButton } from '@mui/lab';
import StockDailyCount from '../components/StockDailyCount'



/** Percentuais para as barras de status */
const STATUS_PERCENT = {
  Cheio: 100,
  Meio: 50,
  Baixo: 20,
  Final: 2,
  Vazio: 0,
  'N/A': 0,
};

/* ──────────────────────────
 * Helper: d/m/Y H:i:s
 * ────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('pt-BR') +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour12: false })
  );
}

/* Logo abaixo de formatDate, acrescente: */
const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
function getWeekday(dateStr) {
  if (!dateStr) return '';
  return WEEKDAYS_PT[new Date(dateStr).getDay()];
}

export default function StockPage() {
  const { stock, loading: stockLoading, addItem, updateItem, removeItem } = useStock();
  const { user } = useAuth();
  const { categories: ctxCategories, loading: catLoading } = useCategory();
  const { units: ctxUnits, loading: unitLoading } = useUnit();
  const { suppliers, loading: supplierLoading } = useSupplier();
  const location = useLocation();
  const [importLoading, setImportLoading] = useState(false);
  // Dialog de add/edit
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formValues, setFormValues] = useState({
    supplier: '',
    category: '',
    product: '',   // ← Adicione isso aqui
    name: '',
    quantity: '',
    unit: '',
    status: 'N/A',
  });

  // Opções de preço médio (autocomplete)
  const [priceOptions, setPriceOptions] = useState([]);

  // Filtros e paginação
  const [filterName, setFilterName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortField, setSortField] = useState('updatedAt'); // ← agora ordena por data
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Exclusão
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Alertas
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  // Importação
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importText, setImportText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [invalidProducts, setInvalidProducts] = useState([]);

  // Carrega params de URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    const fltParam = params.get('filter');
    const supParam = params.get('supplierId');
    if (catParam) setFilterCategory(catParam);
    if (fltParam === 'low') setShowLowOnly(true);
    if (supParam) setFilterSupplier(supParam);
  }, [location.search]);

  // Volta à página 1 quando filtros/ordenação mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterCategory, showLowOnly, sortField, sortOrder]);

  // Ao desfocar do campo nome, monta opções de avgPrice baseado em items já cadastrados
  function handleNameBlur() {
    const term = formValues.name.trim().toLowerCase();
    if (!term) {
      setPriceOptions([]);
      return;
    }
    const matches = stock
      .filter(i => i.name.toLowerCase().includes(term) && i.avgPrice != null)
      .map(i => i.avgPrice);
    const unique = Array.from(new Set(matches)).sort((a, b) => a - b);
    setPriceOptions(unique);
    if (unique.length === 1) {
      setFormValues(v => ({ ...v, avgPrice: unique[0].toString() }));
    }
  }

  // Ajusta status e unidade ao escolher categoria
  useEffect(() => {
    const { category } = formValues;
    if (!category) return;
    const sel = ctxCategories.find(c => c._id === category);
    if (!sel) return;
    let newStatus = formValues.status;
    let newUnit = formValues.unit;
    if (sel.name === 'Estoque de Chope') newStatus = 'Cheio';
    if (['Estoque de Chope', 'Chopes Engatados'].includes(sel.name)) {
      const barril = ctxUnits.find(u => u.name.toLowerCase() === 'barril');
      if (barril) newUnit = barril._id;
    }
    setFormValues(v =>
      v.status !== newStatus || v.unit !== newUnit
        ? { ...v, status: newStatus, unit: newUnit }
        : v
    );
  }, [formValues.category, ctxCategories, ctxUnits]);

  // Handlers gerais
  function handleChange(e) {
    const { name, value } = e.target;
    setFormValues(v => ({ ...v, [name]: value }));
  }

  function openAdd() {
    setEditingItem(null);
    setFormValues({
      supplier: formValues.supplier || '',
      category: '',
      product: '',   // ← Aqui também
      name: '',
      quantity: '',
      unit: '',
      status: 'N/A',
      avgPrice: '',
    });
    setPriceOptions([]);
    setOpenDialog(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormValues({
      supplier: item.supplier?._id || item.supplier || '',
      category: item.category?._id || '',
      product: item.product?._id || item.product || '',
      quantity: item.quantity ?? '',
      unit: item.unit?._id || '',
      status: item.status || 'N/A',
    });
    setOpenDialog(true);
  }

  function closeDialog() {
    setOpenDialog(false);
  }

  function showAlert(msg) {
    setAlertMessage(msg);
    setAlertSeverity('error');
    setAlertOpen(true);
  }

  async function handleSave() {
    if (!formValues.supplier) return showAlert('Fornecedor é obrigatório');
    if (!formValues.category) return showAlert('Categoria é obrigatória');
    if (!formValues.product) return showAlert('Produto é obrigatório');
    if (formValues.quantity === '') return showAlert('Quantidade é obrigatória');
    if (!formValues.unit) return showAlert('Unidade é obrigatória');
    if (!formValues.status) return showAlert('Status é obrigatório');

    const payload = {
      supplier: formValues.supplier?._id || formValues.supplier,
      category: formValues.category,
      product: formValues.product,  // ✅ Agora enviando o ID do produto
      quantity: Number(formValues.quantity),
      unit: formValues.unit,
      status: formValues.status,
    };

    try {
      if (editingItem) {
        await updateItem(editingItem._id, payload);
      } else {
        await addItem(payload);
      }
      closeDialog();
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || 'Erro ao salvar item');
    }
  }

  function openDelete(item) {
    setItemToDelete(item);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    try {
      await removeItem(itemToDelete._id);
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
      showAlert(err.response?.data?.error || 'Erro ao excluir item');
    }
  }

  function cancelDelete() {
    setConfirmOpen(false);
  }

  // Ordenação
  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  // Filtragem e ordenação
  const filteredStock = useMemo(() => {
    let arr = stock.filter(item => {
      const dt = new Date(item.updatedAt || item.createdAt);
      const byName = (item.product?.name || '').toLowerCase().includes(filterName.toLowerCase());
      const byCat = filterCategory ? item.category?._id === filterCategory : true;
      const bySup = filterSupplier ? item.supplier?._id === filterSupplier : true;
      const byStart = filterStartDate ? dt >= new Date(filterStartDate) : true;
      const byEnd = filterEndDate ? dt <= new Date(filterEndDate + 'T23:59:59') : true;
      const byLowOnly = showLowOnly ? ['Baixo', 'Final'].includes(item.status) : true;

      return byName && byCat && bySup && byStart && byEnd && byLowOnly;

    });



    if (showLowOnly) {
      arr = arr.filter(i => i.status === 'Baixo' || i.status === 'Final');
    }
    if (sortField) {
      arr = [...arr].sort((a, b) => {
        const getVal = (obj, key) => {
          switch (key) {
            case 'category':
              return obj.category?.name || '';
            case 'name':
              return obj.name.toLowerCase();
            case 'quantity':
              return obj.quantity ?? 0;
            case 'unit':
              const uid = obj.unit?._id || obj.unit;
              const u = ctxUnits.find(un => un._id === uid);
              return u?.name || '';
            case 'status':
              return obj.status || '';
            case 'supplier':
              return obj.supplier?.name.toLowerCase() || '';
            case 'updatedAt': // ← suporte à nova coluna
              return new Date(obj.updatedAt || obj.createdAt).getTime();
            default:
              return '';
          }
        };
        const va = getVal(a, sortField);
        const vb = getVal(b, sortField);
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortOrder === 'asc' ? va - vb : vb - va;
        }
        return sortOrder === 'asc'
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return arr;
  }, [
    stock,
    filterName,
    filterCategory,
    filterSupplier,
    filterStartDate,
    filterEndDate,
    showLowOnly,
    sortField,
    sortOrder,
    ctxUnits,
  ]);

  const sumFilteredQuantity = useMemo(
    () =>
      filteredStock.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [filteredStock]
  );


  const countByName = useMemo(
    () =>
      filterName
        ? stock.filter(item =>
          (item.product?.name || '').toLowerCase().includes(filterName.toLowerCase())
        ).length
        : 0,
    [stock, filterName]
  );
  const countByCategory = useMemo(
    () =>
      filterCategory
        ? stock.filter(item => item.category?._id === filterCategory).length
        : 0,
    [stock, filterCategory]
  );
  const countBySupplier = useMemo(
    () =>
      filterSupplier
        ? stock.filter(item => item.supplier?._id === filterSupplier).length
        : 0,
    [stock, filterSupplier]
  );
  const countLowOnly = useMemo(
    () =>
      showLowOnly
        ? stock.filter(item =>
          item.status === 'Baixo' || item.status === 'Final'
        ).length
        : 0,
    [stock, showLowOnly]
  );

  // Paginação
  const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);
  const paginatedStock = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStock.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStock, currentPage]);

  // Renderiza barra de status
  function renderStatusBar(status) {
    const pct = STATUS_PERCENT[status] !== undefined ? STATUS_PERCENT[status] : 0;

    let color = '#757575';
    if (status === 'Cheio') color = '#4caf50';
    if (status === 'Meio') color = '#2196f3';
    if (status === 'Baixo') color = '#ff9800';
    if (['Final', 'Vazio'].includes(status)) color = '#f44336';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#333',
              '& .MuiLinearProgress-bar': { backgroundColor: color },
            }}
          />
        </Box>
        <Typography sx={{ minWidth: 40 }}>{pct}%</Typography>
      </Box>
    );
  }

  const anyLoading =
    stockLoading || catLoading || unitLoading || supplierLoading;

  const { products } = useProduct();


  // Handlers para importação
  const handleOpenImportDialog = () => {
    setOpenImportDialog(true);
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
    setImportText('');
    setParsedItems([]);
  };

  function findMatchingProduct(name, products) {
    const normalized = name.toLowerCase().trim();
    const found = products.find(p => normalized.includes(p.name.toLowerCase()));
    if (found) return found;

    return products.find(p => p.name.toLowerCase().includes(normalized));
  }
  const handleParseImportText = async () => {
    try {
      setImportLoading(true);
      setParsedItems([]);
      setAlertMessage('Processando contagem com IA... Por favor aguarde.');
      setAlertSeverity('info');
      setAlertOpen(true);

      const parsed = await parseContagemWithOpenAI(importText);

      setParsedItems(
        parsed.map(item => {
          const foundProduct = findMatchingProduct(item.name, products);
          return {
            name: foundProduct ? foundProduct.name : item.name,
            quantity: item.quantity,
            category: item.category || '',
            unit: item.unit || '',
            status: item.status || 'N/A',
            supplier: item.supplier || '',
            productId: foundProduct ? foundProduct._id : null,
          };
        })
      );

      setAlertOpen(false);
    } catch (error) {
      console.error('Erro ao processar contagem com OpenAI:', error);
      setAlertMessage('Erro ao interpretar a contagem. Tente novamente.');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setImportLoading(false);
    }
  };


  const handleConfirmImport = async () => {
    const invalids = parsedItems
      .map((item, index) => (!item.productId ? index : null))
      .filter(i => i !== null);

    if (invalids.length > 0) {
      setInvalidProducts(invalids);
      setAlertMessage('Existem produtos não cadastrados. Por favor, corrija antes de importar.');
      setAlertSeverity('error');
      setAlertOpen(true);
      return;
    }

    try {
      await Promise.all(parsedItems.map(async (item) => {
        const payload = {
          supplier: item.supplier,
          category: item.category,
          product: item.productId,
          quantity: Number(item.quantity),
          unit: item.unit,
          status: item.status,
          // avgPrice removido, pois não vai no estoque
        };
        await addItem(payload);
      }));

      setInvalidProducts([]);
      setAlertMessage('Importação concluída com sucesso!');
      setAlertSeverity('success');
      setAlertOpen(true);
      handleCloseImportDialog();
    } catch (err) {
      console.error('Erro ao importar itens:', err);
      setAlertMessage('Erro ao importar itens. Tente novamente.');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };


  // Função para atualizar um item editado
  const handleItemChange = (index, field, value) => {
    const newItems = [...parsedItems];
    newItems[index][field] = value;
    setParsedItems(newItems);
  };

  const [selectedAllSupplier, setSelectedAllSupplier] = useState('');
  const [selectedAllCategory, setSelectedAllCategory] = useState('');
  const [selectedAllUnit, setSelectedAllUnit] = useState('');


  function handleAssimilateSupplier(supplierId) {
    setAssimilateSupplier(supplierId);
    setParsedItems((items) =>
      items.map((item) => ({
        ...item,
        supplier: supplierId,
      }))
    );
  }




  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Gestão de Estoque</Typography>
          <Box>
            {user.role === 'admin' && (
              <Button variant="contained" onClick={openAdd}>
                Adicionar Item
              </Button>
            )}
            <Tooltip title="Importar via copiar e colar contagem de mensagem do Whatsapp">
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenImportDialog}
                sx={{ ml: 1 }}
              >
                Importar de Contagem
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {anyLoading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Filtros */}
            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
              <TextField
                label="Buscar por nome"
                value={filterName}
                onChange={e => setFilterName(e.target.value)}
                fullWidth
              />
              {/* ─── Campos de Data ─── */}
              <TextField
                label="Data Início"
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Data Fim"
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Categoria</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  label="Filtrar por Categoria"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {ctxCategories.map(cat => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Fornecedor</InputLabel>
                <Select
                  value={filterSupplier}
                  onChange={e => setFilterSupplier(e.target.value)}
                  label="Filtrar por Fornecedor"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {suppliers.map(sup => (
                    <MenuItem key={sup._id} value={sup._id}>
                      {sup.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>



              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Somente Baixo</InputLabel>
                <Select
                  value={showLowOnly ? 'yes' : 'no'}
                  onChange={e => setShowLowOnly(e.target.value === 'yes')}
                  label="Somente Baixo"
                >
                  <MenuItem value="no">Não</MenuItem>
                  <MenuItem value="yes">Sim</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Tabela */}
            {/* ─── Resumo de quantos registros cada filtro retornou ─── */}
            {/* Total de registros e soma de quantidades */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Typography variant="body2" color="textSecondary">
                Total Filtrado: {filteredStock.length} — Quantidade: {sumFilteredQuantity}
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      { field: 'updatedAt', label: 'Última Atualização' }, // ACRESCENTEI
                      { field: 'category', label: 'Categoria' },
                      { field: 'name', label: 'Nome' },
                      { field: 'quantity', label: 'Quantidade' },
                      { field: 'unit', label: 'Unidade' },
                      { field: 'status', label: 'Status' },
                      { field: 'supplier', label: 'Fornecedor' },
                    ].map(col => (
                      <TableCell key={col.field}>
                        <TableSortLabel
                          active={sortField === col.field}
                          direction={sortField === col.field ? sortOrder : 'asc'}
                          onClick={() => handleSort(col.field)}
                        >
                          {col.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell>Preço</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStock.map(item => {
                    const unitId =
                      typeof item.unit === 'string'
                        ? item.unit
                        : item.unit?._id;
                    const unitObj = ctxUnits.find(u => u._id === unitId);
                    const Icon = unitIcons[unitObj?.iconName] || unitIcons.default;
                    const catObj = ctxCategories.find(c => c._id === item.category?._id);
                    const lastDate = item.updatedAt || item.createdAt;

                    return (
                      <TableRow key={item._id}>
                        {/* NOVA CÉLULA */}
                        <TableCell>
                          <Tooltip title={getWeekday(lastDate)}>
                            <span>{formatDate(lastDate)}</span>
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          {item.category ? (
                            <Tooltip title={catObj?.description || ''}>
                              <Typography sx={{ cursor: 'pointer', color: 'primary.main' }}>
                                {item.category.name}
                              </Typography>
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{item.product?.name || '-'}</TableCell>
                        <TableCell>{item.quantity ?? '-'}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Icon fontSize="small" />
                            <Typography>{unitObj?.name || '-'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {item.status === 'N/A' ? 'Em Uso' : renderStatusBar(item.status)}
                        </TableCell>
                        <TableCell>{item.supplier?.name || '-'}</TableCell>
                        <TableCell>
                          {item.product?.avgPrice != null
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.product.avgPrice)
                            : '-'}
                        </TableCell>

                        <TableCell align="right">
                          {user.role === 'admin' ? (
                            <Box display="flex" justifyContent="flex-end" gap={1}>
                              <Tooltip title="Editar">
                                <Button
                                  size="small"
                                  onClick={() => openEdit(item)}
                                  sx={{ minWidth: 'auto', padding: '4px' }}
                                >
                                  <EditIcon fontSize="small" sx={{ color: '#1976d2 !important' }} />
                                </Button>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <Button
                                  size="small"
                                  onClick={() => openDelete(item)}
                                  sx={{ minWidth: 'auto', padding: '4px' }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ color: '#d32f2f !important' }} />
                                </Button>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Typography color="textSecondary">Acesso restrito</Typography>
                          )}
                        </TableCell>


                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginação */}
            {filteredStock.length > ITEMS_PER_PAGE && (
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

        {/* Dialog de adicionar/editar */}
        <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingItem ? 'Editar Item' : 'Adicionar Novo Item'}</DialogTitle>
          <DialogContent>
            {importLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                <CircularProgress />
                <Typography ml={2}>Analisando a contagem... Por favor aguarde.</Typography>
              </Box>
            )}
            {/* (todo o formulário original permanece) */}

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                name="category"
                value={formValues.category}
                onChange={handleChange}
                label="Categoria"
              >
                {ctxCategories.map(cat => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Produto: autocomplete para _id do Product */}
            <Autocomplete
              sx={{ mt: 2 }}
              options={products}                                // array de objetos Product
              getOptionLabel={(prod) => prod.name}             // exibe o name
              isOptionEqualToValue={(opt, val) => opt._id === val._id}
              value={products.find(p => p._id === formValues.product) || null}
              onChange={(_, selected) =>
                setFormValues(f => ({ ...f, product: selected ? selected._id : '' }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Produto"
                  fullWidth
                  required
                />
              )}
            />

            <TextField
              name="quantity"
              label="Quantidade"
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={formValues.quantity}
              onChange={handleChange}
            />

            <Autocomplete
              sx={{ mt: 2 }}
              options={ctxUnits}
              getOptionLabel={u => u.name}
              isOptionEqualToValue={(o, v) => o._id === v?._id}
              value={ctxUnits.find(u => u._id === formValues.unit) || null}
              onChange={(_, newVal) =>
                setFormValues(v => ({ ...v, unit: newVal ? newVal._id : '' }))
              }
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                const IconOpt = unitIcons[option.iconName] || unitIcons.default;
                return (
                  <li key={key} {...rest}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconOpt fontSize="small" />
                      <Typography>{option.name}</Typography>
                    </Box>
                  </li>
                );
              }}
              renderInput={params => {
                const sel = ctxUnits.find(u => u._id === formValues.unit);
                const IconSel = unitIcons[sel?.iconName] || unitIcons.default;
                return (
                  <TextField
                    {...params}
                    label="Unidade"
                    placeholder="Selecione uma unidade"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: formValues.unit ? (
                        <InputAdornment position="start">
                          <IconSel fontSize="small" />
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                );
              }}
            />

            <Autocomplete
              sx={{ mt: 2 }}
              options={suppliers}
              getOptionLabel={s => s.name}
              isOptionEqualToValue={(o, v) => o._id === v?._id}
              value={suppliers.find(s => s._id === formValues.supplier) || null}
              onChange={(_, newVal) =>
                setFormValues(v => ({
                  ...v,
                  supplier: newVal ? newVal._id : '',
                }))
              }
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li key={key} {...rest}>
                    <Typography>{option.name}</Typography>
                  </li>
                );
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Fornecedor"
                  placeholder="Selecione um fornecedor"
                  fullWidth
                />
              )}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formValues.status}
                onChange={handleChange}
                label="Status"
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
            <Button onClick={closeDialog}>Cancelar</Button>
            <Button variant="contained" onClick={handleSave}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmação de exclusão */}
        <Dialog open={confirmOpen} onClose={cancelDelete} maxWidth="xs" fullWidth>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir "<strong>
                {itemToDelete?.name}
              </strong>"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete}>Cancelar</Button>
            <Button color="error" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Importação */}
        <Dialog
          open={openImportDialog}
          onClose={() => setOpenImportDialog(false)}
          fullWidth
          maxWidth={false}
          sx={{ '& .MuiDialog-paper': { width: 1000, maxWidth: '95vw' } }}
        >
          <DialogTitle>Importar Estoque de Contagem</DialogTitle>
          <DialogContent>
            <TextField
              label="Cole aqui a contagem"
              multiline
              rows={10}
              fullWidth
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              sx={{ mt: 2 }}  // margem superior de 16px (padrão do MUI)
              variant="outlined"
            />
            <LoadingButton
              loading={importLoading}
              onClick={handleParseImportText}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Processar Contagem
            </LoadingButton>

            {parsedItems.length > 0 && (
              <>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 150 }} align="right">
                          <FormControl fullWidth variant="standard" size="small">
                            <InputLabel>Assimilar Categoria</InputLabel>
                            <Select
                              value={selectedAllCategory}
                              onChange={e => {
                                const val = e.target.value;
                                setSelectedAllCategory(val);
                                if (val) {
                                  setParsedItems(items => items.map(i => ({ ...i, category: val })));
                                }
                              }}
                              label="Assimilar Categoria"
                            >
                              <MenuItem value="">Nenhuma</MenuItem>
                              {ctxCategories.map(cat => (
                                <MenuItem key={cat._id} value={cat._id}>
                                  {cat.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell sx={{ minWidth: 150 }} align="right">
                          <FormControl fullWidth variant="standard" size="small">
                            <InputLabel>Assimilar Unidade</InputLabel>
                            <Select
                              value={selectedAllUnit}
                              onChange={e => {
                                const val = e.target.value;
                                setSelectedAllUnit(val);
                                if (val) {
                                  setParsedItems(items => items.map(i => ({ ...i, unit: val })));
                                }
                              }}
                              label="Assimilar Unidade"
                            >
                              <MenuItem value="">Nenhuma</MenuItem>
                              {ctxUnits.map(unit => (
                                <MenuItem key={unit._id} value={unit._id}>
                                  {unit.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell sx={{ minWidth: 150 }} align="right">
                          <FormControl fullWidth variant="standard" size="small">
                            <InputLabel>Assimilar Fornecedor</InputLabel>
                            <Select
                              value={selectedAllSupplier}
                              onChange={e => {
                                const val = e.target.value;
                                setSelectedAllSupplier(val);
                                if (val) {
                                  setParsedItems(items => items.map(i => ({ ...i, supplier: val })));
                                }
                              }}
                              label="Assimilar Fornecedor"
                            >
                              <MenuItem value="">Nenhuma</MenuItem>
                              {suppliers.map(sup => (
                                <MenuItem key={sup._id} value={sup._id}>
                                  {sup.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* Colunas vazias para alinhamento correto com a segunda linha */}
                        <TableCell />
                        <TableCell />
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ minWidth: 300 }}>Produto</TableCell>
                        <TableCell sx={{ minWidth: 150 }}>Categoria</TableCell>
                        <TableCell sx={{ minWidth: 150 }}>Unidade</TableCell>
                        <TableCell sx={{ minWidth: 150 }}>Fornecedor</TableCell>
                        <TableCell sx={{ minWidth: 50 }}>Qtde</TableCell>
                      </TableRow>
                    </TableHead>


                    <TableBody>
                      {parsedItems.map((item, index) => {
                        const selectedSupplier = suppliers.find(s => s._id === item.supplier);

                        return (
                          <TableRow key={index}>
                            {/* Produto */}
                            <TableCell sx={{ width: '30%' }}>
                              <Autocomplete
                                freeSolo
                                options={products.map(p => p.name)}
                                value={item.name}
                                onChange={(event, newValue) => {
                                  handleItemChange(index, 'name', newValue);
                                  const product = products.find(p => p.name === newValue);
                                  if (product) {
                                    handleItemChange(index, 'productId', product._id);
                                    handleItemChange(index, 'category', product.categoryId || '');
                                    handleItemChange(index, 'unit', product.unitId || '');
                                  } else {
                                    handleItemChange(index, 'productId', null);
                                    alert('Produto não encontrado. Por favor, crie o produto primeiro.');
                                  }
                                }}
                                renderInput={(params) => <TextField {...params} variant="standard" />}
                              />
                            </TableCell>

                            {/* Categoria */}
                            <TableCell sx={{ width: '15%' }}>
                              <FormControl fullWidth variant="standard">
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                  value={item.category}
                                  onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                >
                                  {ctxCategories.map(cat => (
                                    <MenuItem key={cat._id} value={cat._id}>
                                      {cat.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>

                            {/* Unidade */}
                            <TableCell sx={{ width: '15%' }}>
                              <FormControl fullWidth variant="standard">
                                <InputLabel>Unidade</InputLabel>
                                <Select
                                  value={item.unit || ''}
                                  onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                >
                                  {ctxUnits.map(unit => (
                                    <MenuItem key={unit._id} value={unit._id}>
                                      {unit.name}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>

                            {/* Fornecedor */}
                            <TableCell sx={{ width: '15%' }}>
                              <Autocomplete
                                options={suppliers}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedSupplier || null}
                                onChange={(_, newVal) => {
                                  handleItemChange(index, 'supplier', newVal ? newVal._id : '');
                                }}
                                renderInput={(params) => <TextField {...params} variant="standard" />}
                              />
                            </TableCell>

                            {/* Quantidade */}
                            <TableCell sx={{ width: '10%' }}>
                              <TextField
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  handleItemChange(index, 'quantity', val);
                                }}
                                variant="standard"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* aqui inserimos o componente que vai criar as saídas diárias */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <StockDailyCount
                    parsedCounts={parsedItems.map(item => ({
                      product: item.productId,
                      quantity: Number(item.quantity),
                      type: 'saida',
                      reason: 'Contagem diária'
                    }))}
                  />
                </Box>
              </>

            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenImportDialog(false)} color="secondary">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmImport}
              color="primary"
              variant="contained"
              disabled={importLoading || parsedItems.length === 0}
            >
              Confirmar Importação
            </Button>
          </DialogActions>
        </Dialog>

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
