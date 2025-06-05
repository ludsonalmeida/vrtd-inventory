// src/components/StockTrendChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStockHistory } from '../contexts/StockHistoryContext'; // hipotético

export default function StockTrendChart() {
  const { stockHistory } = useStockHistory();

  // Exemplo de stockHistory: [{ date: '2025-05-01', change: 10 }, ...]
  // Precisamos acumular as mudanças cumulativas:
  const data = stockHistory.reduce((acc, curr) => {
    const lastTotal = acc.length ? acc[acc.length - 1].total : 0;
    acc.push({ date: curr.date, total: lastTotal + curr.change });
    return acc;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} /> 
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#ffc107" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
