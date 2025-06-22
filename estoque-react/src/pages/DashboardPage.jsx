// src/pages/DashboardPage.jsx

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useUnit } from '../contexts/UnitContext';

import { useAuth } from '../contexts/AuthContext';
import { useStock } from '../contexts/StockContext';
import { useCategory } from '../contexts/CategoryContext';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Stack,
} from '@mui/material';

import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CategoryIcon from '@mui/icons-material/Category';
import LocalBarIcon from '@mui/icons-material/LocalBar';

import CategoryBarChartHorizontal from '../components/CategoryBarChartHorizontal';
import StatusPieChart from '../components/StatusPieChart';
import DailyCategoryStackedAreaChart from '../components/DailyCategoryStackedAreaChart';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { stock, loading: stockLoading } = useStock();
  const { categories, loading: catLoading } = useCategory();
  const navigate = useNavigate();
  const { units } = useUnit();

  // Filtra itens da data mais recente
  const latestStock = useMemo(() => {
    if (!stock.length) return [];
    const latestISO = stock.reduce(
      (max, item) => (item.createdAt > max ? item.createdAt : max),
      stock[0].createdAt
    );
    const latestDateStr = dayjs(latestISO).format('YYYY-MM-DD');
    return stock.filter(
      (item) => dayjs(item.createdAt).format('YYYY-MM-DD') === latestDateStr
    );
  }, [stock]);

  // Cálculos com quantity
  const totalItems = useMemo(
    () => latestStock.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [latestStock]
  );
  const lowItems = useMemo(
    () =>
      latestStock
        .filter((item) => item.status === 'Baixo' || item.status === 'Final')
        .reduce((sum, item) => sum + (item.quantity || 0), 0),
    [latestStock]
  );
  const itemsByCategory = useMemo(
    () =>
      latestStock.reduce((acc, item) => {
        const name = item.category?.name || 'Sem Categoria';
        acc[name] = (acc[name] || 0) + (item.quantity || 0);
        return acc;
      }, {}),
    [latestStock]
  );
  const totalCategories = categories.length;

  // Agrupa por fornecedor
  const itemsBySupplier = useMemo(
    () =>
      latestStock.reduce((acc, item) => {
        const name = item.supplier?.name || 'Sem Fornecedor';
        acc[name] = (acc[name] || 0) + (item.quantity || 0);
        return acc;
      }, {}),
    [latestStock]
  );

  // Cálculos específicos para Chope
  const estoqueChope = useMemo(
    () =>
      latestStock
        .filter((item) => item.category?.name === 'Chope')
        .reduce((sum, item) => sum + (item.quantity || 0), 0),
    [latestStock]
  );
  const chopesEngatados = useMemo(
    () =>
      latestStock
        .filter((item) => item.category?.name === 'Engatado')
        .reduce((sum, item) => sum + (item.quantity || 0), 0),
    [latestStock]
  );
  const totalChopes = estoqueChope + chopesEngatados;

  if (stockLoading || catLoading) {
    return (
      <>
        <Container sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Carregando dados...
          </Typography>
        </Container>
      </>
    );
  }

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <>
     
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ p: 3, border: '2px solid #FFA500', borderRadius: 2, mb: 4 }} textAlign="center">
          <Typography variant="h4">Bem-vindo, {user.email}!</Typography>
          <Typography color="textSecondary" sx={{ mb: 3 }}>
            Esse é o painel de controle do seu sistema de estoque.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={() => navigate('/estoque')}>Ir para Estoque</Button>
            {user.role === 'admin' && (
              <>
                <Button variant="outlined" onClick={() => navigate('/categories')}>Gerenciar Categorias</Button>
                <Button variant="outlined" onClick={() => navigate('/register')}>Cadastrar Usuário</Button>
              </>
            )}
            <Button color="error" onClick={handleLogout}>Sair</Button>
          </Stack>
        </Box>

        {/* Principais Métricas */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Inventory2Icon fontSize="large" color="primary" />
                  <Typography>Total de Itens</Typography>
                </Stack>
                <Typography variant="h3" color="primary">{totalItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <WarningAmberIcon fontSize="large" color="error" />
                  <Typography>Estoque Baixo</Typography>
                </Stack>
                <Typography variant="h3" color="error">{lowItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CategoryIcon fontSize="large" color="secondary" />
                  <Typography>Total Categorias</Typography>
                </Stack>
                <Typography variant="h3" color="secondary">{totalCategories}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocalBarIcon fontSize="large" color="primary" />
                  <Typography>Total Chope</Typography>
                </Stack>
                <Typography variant="h3" color="primary">{totalChopes}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Estoque ({estoqueChope}) + Engatado ({chopesEngatados})
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Cards por Fornecedor */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" gutterBottom>Itens por Fornecedor</Typography>
          <Grid container spacing={2}>
            {Object.entries(itemsBySupplier).map(([name, qty]) => (
              <Grid key={name} item xs={6} sm={4} md={2}>
                <Card sx={{ bgcolor: 'grey.900', color: 'common.white', textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{name}</Typography>
                    <Typography variant="h4">{qty}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Gráficos */}
        <Box sx={{ mt: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card sx={{ p: 2, minHeight: 400 }}>
                <Typography mb={2} variant="h6">Evolução Diária de Itens</Typography>
                <DailyCategoryStackedAreaChart />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, minHeight: 400 }}>
                <Typography mb={2} variant="h6">Itens por Categoria</Typography>
                <CategoryBarChartHorizontal />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, minHeight: 400 }}>
                <Typography mb={2} variant="h6">Distribuição por Status</Typography>
                <StatusPieChart />
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
