import React, { useEffect, useState } from 'react';
import { useStock } from '../contexts/StockContext';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert
} from '@mui/material';

export default function StockDailyCount() {
  const { stock } = useStock();
  const [quantities, setQuantities] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

  // Inicializar quantidades e status para cada item do estoque
  useEffect(() => {
    const initQuantities = {};
    const initStatus = {};
    stock.forEach(item => {
      initQuantities[item.product._id] = item.quantity || 0;
      initStatus[item.product._id] = item.status || 'N/A';
    });
    setQuantities(initQuantities);
    setStatusMap(initStatus);
  }, [stock]);

  const handleQuantityChange = (productId, value) => {
    const valNum = parseInt(value);
    if (isNaN(valNum) || valNum < 0) return;
    setQuantities(prev => ({ ...prev, [productId]: valNum }));
  };

  const handleStatusChange = (productId, value) => {
    setStatusMap(prev => ({ ...prev, [productId]: value }));
  };

  async function handleSubmit() {
    setLoading(true);
    const payload = Object.keys(quantities).map(productId => ({
      productId,
      quantityContada: quantities[productId],
      status: statusMap[productId],
    }));

    try {
      const token = localStorage.getItem('token'); // ou seu método de auth
      const res = await fetch('/api/stock/daily-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Erro ao enviar contagem');
      setAlert({ open: true, message: 'Contagem enviada com sucesso!', severity: 'success' });
    } catch (err) {
      setAlert({ open: true, message: err.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Contagem Diária de Chopes
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell align="right">Quantidade Atual</TableCell>
              <TableCell align="right">Quantidade Contada</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stock.map(item => (
              <TableRow key={item._id}>
                <TableCell>{item.product?.name}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">
                  <TextField
                    type="number"
                    size="small"
                    value={quantities[item.product._id] ?? 0}
                    onChange={e => handleQuantityChange(item.product._id, e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    value={statusMap[item.product._id] ?? ''}
                    onChange={e => handleStatusChange(item.product._id, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Contagem'}
        </Button>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={alert.severity} onClose={() => setAlert(prev => ({ ...prev, open: false }))}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
