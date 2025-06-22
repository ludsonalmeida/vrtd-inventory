// src/pages/StockMovements.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { useStock } from '../contexts/StockContext';
import { useStockMovements } from '../contexts/StockMovementsContext';

export default function StockMovements() {
  const { stock } = useStock();
  const { movements, loading: movLoading, addMovement, fetchMovements } = useStockMovements();

  const [dailyCount, setDailyCount] = useState([]);
  const [sending, setSending] = useState(false);

  // Snackbar state
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  // Ao montar, busca histórico
  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Monta a lista de dailyCount apenas se ainda não contou hoje
  useEffect(() => {
    if (movLoading) return;
    const today = new Date().toDateString();
    const jaContouHoje = movements.some(
      mov =>
        mov.reason === 'Contagem diária' &&
        new Date(mov.date).toDateString() === today
    );

    if (!jaContouHoje) {
      setDailyCount(
        stock.map(item => ({
          productId: item.product?._id,
          name: item.product?.name || '',
          categoryName: item.category?.name || '—',
          quantityContada: item.quantity || 0,
          status: item.status || 'N/A',
        }))
      );
    } else {
      setDailyCount([]);
    }
  }, [movLoading, movements, stock]);

  // Envia cada item como saída e dispara Snackbar
  async function enviarContagem() {
    setSending(true);
    try {
      for (let item of dailyCount) {
        const qty = Number(item.quantityContada);
        if (qty <= 0) continue;

        await addMovement({
          product: item.productId,
          quantity: qty,
          type: 'saida',
          reason: 'Contagem diária',
        });
      }
      setSnackSeverity('success');
      setSnackMsg('Contagem enviada com sucesso!');
      setSnackOpen(true);
      await fetchMovements();
      setDailyCount([]);
    } catch (err) {
      console.error('Erro ao enviar contagem:', err);
      setSnackSeverity('error');
      setSnackMsg(
        'Erro ao enviar contagem: ' +
          (err.response?.data?.error || err.message)
      );
      setSnackOpen(true);
    } finally {
      setSending(false);
    }
  }

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Contagem Diária de Chopes
      </Typography>

      {dailyCount.length > 0 ? (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Categoria</TableCell>
                <TableCell>Produto</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyCount.map((item, idx) => (
                <TableRow key={`${item.productId}-${idx}`}>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right" sx={{ maxWidth: 120 }}>
                    <TextField
                      type="number"
                      value={item.quantityContada}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setDailyCount(dc => {
                          const copy = [...dc];
                          copy[idx].quantityContada = val;
                          return copy;
                        });
                      }}
                      inputProps={{ min: 0 }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={item.status}
                        onChange={e => {
                          const val = e.target.value;
                          setDailyCount(dc => {
                            const copy = [...dc];
                            copy[idx].status = val;
                            return copy;
                          });
                        }}
                      >
                        <MenuItem value="N/A">Em Uso</MenuItem>
                        <MenuItem value="Cheio">Cheio</MenuItem>
                        <MenuItem value="Meio">Meio</MenuItem>
                        <MenuItem value="Baixo">Baixo</MenuItem>
                        <MenuItem value="Final">Final</MenuItem>
                        <MenuItem value="Vazio">Vazio</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button
              variant="contained"
              onClick={enviarContagem}
              disabled={sending}
            >
              {sending ? 'Enviando...' : 'Enviar Contagem'}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Typography sx={{ mb: 4 }} color="textSecondary">
          {movLoading
            ? 'Carregando movimentos...'
            : 'Você já enviou a contagem hoje.'}
        </Typography>
      )}

      <Typography variant="h6" gutterBottom>
        Histórico de Movimentações (Saídas e Entradas)
      </Typography>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Categoria</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Motivo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(movLoading ? [] : movements).map(mov => (
              <TableRow key={mov._id}>
                <TableCell>{mov.product?.category?.name || '—'}</TableCell>
                <TableCell>{mov.product?.name}</TableCell>
                <TableCell>{mov.quantity}</TableCell>
                <TableCell>{mov.type}</TableCell>
                <TableCell>
                  {new Date(mov.date).toLocaleString('pt-BR')}
                </TableCell>
                <TableCell>{mov.reason || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Snackbar para notificações elegantes */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: '100%' }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
