// src/pages/DashboardPage.jsx
import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStock } from '../contexts/StockContext';
import { useCategory } from '../contexts/CategoryContext';
import { useNavigate } from 'react-router-dom';
import NavBarRestrita from '../components/NavBarRestrita';

import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';

import CategoryBarChartHorizontal from '../components/CategoryBarChartHorizontal';
import StatusPieChart from '../components/StatusPieChart';
import DailyCategoryStackedAreaChart from '../components/DailyCategoryStackedAreaChart';

export default function DashboardPage() {
  // ─── Hooks no topo ───
  const { user, signOut } = useAuth();
  const { stock, loading: stockLoading } = useStock();
  const { categories, loading: catLoading } = useCategory();
  const navigate = useNavigate();
  // ──────────────────────

  // 1) Total de itens no estoque
  const totalItems = stock.length;

  // 2) Quantos estão “Baixo” (status = 'Baixo' OU quantity <= 0)
  const lowItems = useMemo(
    () =>
      stock.filter((item) => {
        if (item.status === 'Baixo') return true;
        if (typeof item.quantity === 'number' && item.quantity <= 0) return true;
        return false;
      }).length,
    [stock]
  );

  // 3) Contagem de itens por categoria (para o CategoryBarChartHorizontal)
  const itemsByCategory = useMemo(() => {
    return stock.reduce((acc, item) => {
      const catName = item.category?.name || 'Sem Categoria';
      acc[catName] = (acc[catName] || 0) + 1;
      return acc;
    }, {});
  }, [stock]);

  // 4) Total de categorias (para exibir no card)
  const totalCategories = categories.length;

  // Se ainda estiver carregando estoque ou categorias, mostramos um spinner simples
  if (stockLoading || catLoading) {
    return (
      <>
        <NavBarRestrita />
        <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Carregando dados...
          </Typography>
        </Container>
      </>
    );
  }

  function handleLogout() {
    signOut();
    navigate('/login');
  }

  return (
    <>
      {/* NavBar restrita para usuários logados */}
      <NavBarRestrita />

      {/* Conteúdo principal */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Boas-vindas e botões: sem fundo, com contorno laranja */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            p: 3,
            border: '2px solid #FFA500',
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Bem-vindo, {user.email}!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Esse é o painel de controle do seu sistema de estoque.
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/estoque')}
            >
              Ir para Estoque
            </Button>

            {user.role === 'admin' && (
              <>
                <Button variant="outlined" onClick={() => navigate('/categories')}>
                  Gerenciar Categorias
                </Button>
                <Button variant="outlined" onClick={() => navigate('/register')}>
                  Cadastrar Usuário
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Grid de métricas (cards) */}
        <Grid container spacing={3}>
          {/* 1) Card: Total de Itens */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total de Itens
                </Typography>
                <Typography variant="h3" color="primary">
                  {totalItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 2) Card: Estoque Baixo */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Estoque Baixo
                </Typography>
                <Typography variant="h3" color="error">
                  {lowItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 3) Card: Total de Categorias */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total de Categorias
                </Typography>
                <Typography variant="h3" color="secondary">
                  {totalCategories}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 4) Cards: Quantidade por Categoria (usado no gráfico de barras horizontal) */}
          {Object.entries(itemsByCategory).map(([categoryName, count]) => (
            <Grid item xs={12} sm={6} lg={3} key={categoryName}>
              <Card sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {categoryName}
                  </Typography>
                  <Typography variant="h4">{count}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Seção de Gráficos */}
        <Box sx={{ mt: 6 }}>
          <Grid container spacing={4}>
            {/* 1) Evolução Diária: Engatados vs Estoque de Chopes (Stacked AreaChart) ─── ocupa toda largura */}
            <Grid item xs={12}>
              <Card
                sx={{
                  p: 2,
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Evolução Diária de Chopes Engatados vs Estoque de Chopes
                </Typography>
                <Box sx={{ width: '100%', flexGrow: 1 }}>
                  <DailyCategoryStackedAreaChart />
                </Box>
              </Card>
            </Grid>

            {/* 2) Itens por Categoria (Gráfico de barras horizontal) ─── metade da largura em md */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 2,
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Itens por Categoria (Barras Horizontais)
                </Typography>
                <Box sx={{ width: '100%', flexGrow: 1 }}>
                  <CategoryBarChartHorizontal />
                </Box>
              </Card>
            </Grid>

            {/* 3) Distribuição por Status (Gráfico de Pizza) ─── metade da largura em md */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 2,
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Distribuição por Status
                </Typography>
                <Box sx={{ width: '100%', flexGrow: 1 }}>
                  <StatusPieChart />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
