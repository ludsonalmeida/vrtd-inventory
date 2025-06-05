// src/components/StatusPieChart.jsx
import React from 'react';
import { useStock } from '../contexts/StockContext';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, CircularProgress } from '@mui/material';

export default function StatusPieChart() {
  const { stock, loading } = useStock();

  // Enquanto os dados do estoque estão carregando, exibimos um spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  // Agrupa a quantidade de itens por status
  const statusCounts = stock.reduce((acc, item) => {
    const status = item.status || 'N/A';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Converte em array no formato que o Recharts espera
  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Define cores para cada segmento (você pode ajustá-las à vontade)
  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#757575', '#9e9e9e'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
