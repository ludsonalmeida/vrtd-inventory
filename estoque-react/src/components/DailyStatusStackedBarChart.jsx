// src/components/DailyStatusStackedBarChart.jsx
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useStock } from '../contexts/StockContext';
import { buildDailyStatusData } from './buildDailyStatusData';

/**
 * Cores para cada status (pode ajustar conforme a identidade visual)
 */
const STATUS_COLORS = {
  Cheio: '#4caf50',   // verde
  Meio: '#2196f3',    // azul
  Baixo: '#ff9800',   // laranja
  Final: '#f44336',   // vermelho
  Vazio: '#757575',   // cinza
};

export default function DailyStatusStackedBarChart() {
  const { stock } = useStock();

  // Agrupa o stock por dia e status
  const data = useMemo(() => buildDailyStatusData(stock), [stock]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis 
          dataKey="date" 
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
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }} 
          labelStyle={{ color: '#aaa' }} 
          itemStyle={{ color: '#fff' }} 
        />
        <Legend wrapperStyle={{ color: '#ddd', marginTop: 10 }} />

        {['Cheio', 'Meio', 'Baixo', 'Final', 'Vazio'].map((status) => (
          <Bar
            key={status}
            dataKey={status}
            stackId="a"
            fill={STATUS_COLORS[status]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
