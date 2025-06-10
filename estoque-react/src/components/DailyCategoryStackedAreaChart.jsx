import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';
import api from '../services/api';

export default function DailyCategoryStackedAreaChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await api.get('/reports/daily-chopes');
        setData(response.data);
      } catch (err) {
        console.error('Erro ao carregar dados diários:', err);
        const msg =
          err.response?.data?.error ||
          'Não foi possível carregar os dados de evolução diária';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        Nenhum dado disponível para “Chopes Engatados” ou “Estoque de Chopes”.
      </Box>
    );
  }

  const COLORS = { engatados: '#8884d8', estoque: '#82ca9d' };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 16, right: 40, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => dayjs(date).format('DD/MM')}
          minTickGap={15}
        />
        <YAxis allowDecimals={false} />
        <Tooltip
          labelFormatter={(label) => `Data: ${dayjs(label).format('DD/MM/YYYY')}`}
        />
        <Legend verticalAlign="top" height={36} />

        <Area
          type="monotone"
          dataKey="engatadosCount"
          name="Chopes Engatados"
          stackId="1"
          stroke={COLORS.engatados}
          fill={COLORS.engatados}
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="estoqueCount"
          name="Estoque de Chopes"
          stackId="1"
          stroke={COLORS.estoque}
          fill={COLORS.estoque}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
