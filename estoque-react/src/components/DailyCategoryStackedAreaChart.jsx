// src/components/DailyCategoryStackedAreaChart.jsx
import React, { useMemo } from 'react';
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
import { useStock } from '../contexts/StockContext';
import { useCategory } from '../contexts/CategoryContext';
import { buildDailyCategoryData } from './buildDailyCategoryData';

export default function DailyCategoryStackedAreaChart() {
  const { stock } = useStock();
  const { categories } = useCategory();

  // 1) Pega o _id das categorias “Chopes Engatados” e “Estoque de Chopes”
  const engatadosId = useMemo(() => {
    const found = categories.find((c) => c.name === 'Chopes Engatados');
    return found ? found._id : null;
  }, [categories]);

  const estoqueId = useMemo(() => {
    const found = categories.find((c) => c.name === 'Estoque de Chopes');
    return found ? found._id : null;
  }, [categories]);

  // 2) Constrói array de { date, engatadosCount, estoqueCount } apenas se ambos os IDs existirem
  const data = useMemo(() => {
    if (!engatadosId || !estoqueId) return [];
    return buildDailyCategoryData(stock, engatadosId, estoqueId);
  }, [stock, engatadosId, estoqueId]);

  // Cores para cada área
  const COLORS = {
    engatados: '#42a5f5', // azul claro
    estoque: '#ffa726',   // laranja
  };

  // Função que converte "YYYY-MM-DD" → "DD/MM/YYYY"
  const formatDate = (isoString) => dayjs(isoString, 'YYYY-MM-DD').format('DD/MM/YYYY');

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />

        {/* XAxis agora formata a data para 'DD/MM/YYYY' */}
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: '#ddd', fontSize: 12 }}
          axisLine={{ stroke: '#555' }}
          tickLine={{ stroke: '#555' }}
        />

        <YAxis
          allowDecimals={false}
          tick={{ fill: '#ddd', fontSize: 12 }}
          axisLine={{ stroke: '#555' }}
          tickLine={{ stroke: '#555' }}
        />

        {/* Tooltip também precisa formatar a label */}
        <Tooltip
          labelFormatter={(value) => formatDate(value)}
          contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }}
          labelStyle={{ color: '#aaa' }}
          itemStyle={{ color: '#fff' }}
        />

        <Legend wrapperStyle={{ color: '#ddd', marginTop: 10 }} />

        {/* Área para “Chopes Engatados” */}
        <Area
          type="monotone"
          dataKey="engatadosCount"
          name="Chopes Engatados"
          stackId="1"
          stroke={COLORS.engatados}
          fill={COLORS.engatados}
          fillOpacity={0.6}
        />

        {/* Área para “Estoque de Chopes” */}
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
