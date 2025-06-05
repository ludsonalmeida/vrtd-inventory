// src/components/CategoryBarChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { useCategory } from '../contexts/CategoryContext';
import { useStock } from '../contexts/StockContext';

export default function CategoryBarChart() {
  const { categories } = useCategory();
  const { stock } = useStock();

  // Monta um array [{ name: 'Bebidas', count: 12 }, ...]
  const data = categories.map(cat => ({
    name: cat.name,
    count: stock.filter(item => item.category?.name === cat.name).length
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#ffc107">
          <LabelList dataKey="count" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
