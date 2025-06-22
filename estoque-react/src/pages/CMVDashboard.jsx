import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import {
  Container,
  Typography,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Divider,
} from '@mui/material';
import { NumericFormat } from 'react-number-format';

function NumberFormatCustom(props) {
  const { inputRef, onChange, name, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name,
            value: values.value,
          },
        });
      }}
      thousandSeparator="."
      decimalSeparator=","
      valueIsNumericString={true}
      prefix="R$ "
      decimalScale={2}
      fixedDecimalScale
    />
  );
}

export default function CMVDashboard() {
  const { stock } = useStock();

  const [faturamentoTotal, setFaturamentoTotal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtra estoque pelo período
  const filteredStock = stock.filter((item) => {
    const createdAt = new Date(item.createdAt);
    if (startDate && createdAt < new Date(startDate)) return false;
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (createdAt > endOfDay) return false;
    }
    return true;
  });

  // Calcula custo total do estoque filtrado considerando status e categoria
  const custoTotalEstoque = filteredStock.reduce((acc, item) => {
    const precoUnit = item.product?.avgPrice ?? 0;
    const quantidade = item.quantity ?? 0;
    const categoriaNome = item.category?.name || '';
    const status = (item.status || '').toLowerCase();

    let peso = 1; // padrão 100%

    if (
      categoriaNome === 'Chopes Engatados' ||
      categoriaNome === 'Estoque de Chope'
    ) {
      switch (status) {
        case 'final':
          peso = 0.05;
          break;
        case 'baixo':
          peso = 0.25;
          break;
        case 'meio':
          peso = 0.5;
          break;
        case 'cheio':
          peso = 1;
          break;
        default:
          peso = 1;
      }
    }

    return acc + precoUnit * quantidade * peso;
  }, 0);

  const faturamentoNum = Number(faturamentoTotal);

  const cmvPercent = faturamentoNum
    ? ((custoTotalEstoque / faturamentoNum) * 100).toFixed(2)
    : null;

  const formatCurrency = (val) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr) => {
    if (!dateStr) return '...';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          CMV - Custo da Mercadoria Vendida
        </Typography>

        <br />

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Data Início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& input': {
                height: 40,
                padding: '10px 14px',
                boxSizing: 'border-box',
              },
            }}
          />

          <TextField
            label="Data Fim"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& input': {
                height: 40,
                padding: '10px 14px',
                boxSizing: 'border-box',
              },
            }}
          />

          <TextField
            label="Faturamento Total (R$)"
            type="text"
            value={faturamentoTotal}
            onChange={(e) => setFaturamentoTotal(e.target.value)}
            InputProps={{
              inputComponent: NumberFormatCustom,
            }}
            sx={{
              '& input': {
                height: 40,
                padding: '10px 14px',
                boxSizing: 'border-box',
              },
              maxWidth: 220,
            }}
          />
        </Box>

        <Typography variant="body1" gutterBottom>
          Itens cadastrados entre:{' '}
          <strong>{formatDate(startDate)}</strong> e <strong>{formatDate(endDate)}</strong>
        </Typography>

        <Typography variant="body1" gutterBottom>
          Custo Total do Estoque no Período:{' '}
          <strong>{formatCurrency(custoTotalEstoque)}</strong>
        </Typography>

        <Typography variant="body1" gutterBottom>
          {cmvPercent !== null
            ? `CMV em relação ao faturamento: ${cmvPercent}%`
            : 'Informe o faturamento para calcular o CMV %'}
        </Typography>

        {/* Seção explicativa discreta e charmosa */}
        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: 3,
            backgroundColor: '#f3f4f6',
            color: '#333',
            fontSize: 14,
            borderRadius: 2,
            lineHeight: 1.6,
            maxWidth: 620,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          }}
          elevation={0}
        >
          <Typography variant="subtitle1" sx={{color: "#000"}} fontWeight="600" gutterBottom>
            Como calculamos o CMV?
          </Typography>
          <Typography variant="body2" gutterBottom>
            O CMV considera o custo do estoque registrado entre as datas selecionadas, calculado pelo preço médio e quantidade de cada produto.
          </Typography>
          <Typography variant="body2" gutterBottom>
            Para os produtos nas categorias <strong>Chopes Engatados</strong> e <strong>Estoque de Chope</strong>, aplicamos uma ponderação baseada no status atual do estoque para refletir o volume real disponível:
          </Typography>
          <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
            <li><strong>Final:</strong> considera 5% do valor total</li>
            <li><strong>Baixo:</strong> considera 25% do valor total</li>
            <li><strong>Meio:</strong> considera 50% do valor total</li>
            <li><strong>Cheio:</strong> considera 100% do valor total</li>
          </ul>
          <Typography variant="body2">
            Assim, garantimos que o CMV reflita com mais precisão o custo real do estoque disponível para venda.
          </Typography>
        </Paper>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Itens no Período Selecionado
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Preço Médio Unitário (R$)</TableCell>
              <TableCell align="right">Custo Total (R$)</TableCell>
              <TableCell align="right">Data Cadastro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStock.map((item) => {
              const precoUnit = item.product?.avgPrice ?? 0;
              const quantidade = item.quantity ?? 0;
              const createdAt = new Date(item.createdAt);
              return (
                <TableRow key={item._id}>
                  <TableCell>{item.product?.name || '-'}</TableCell>
                  <TableCell align="right">{quantidade}</TableCell>
                  <TableCell align="right">{formatCurrency(precoUnit)}</TableCell>
                  <TableCell align="right">{formatCurrency(precoUnit * quantidade)}</TableCell>
                  <TableCell align="right">{createdAt.toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
