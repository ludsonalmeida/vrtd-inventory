// src/components/CategoryBarChartHorizontal.jsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { useStock } from '../contexts/StockContext';
import { useCategory } from '../contexts/CategoryContext';

/**
 * Prepara os dados no formato:
 * [
 *   { name: 'Bebidas Não Alcoólicas', count: 12 },
 *   { name: 'Temperos e Complementos', count: 8 },
 *   // ...
 * ]
 */
function buildData(categories, stock) {
  return categories.map((cat) => ({
    name: cat.name,
    count: stock.filter((item) => item.category?.name === cat.name).length,
  }));
}

export default function CategoryBarChartHorizontal() {
  const { stock } = useStock();
  const { categories } = useCategory();

  const data = buildData(categories, stock);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical" 
        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
      >
        {/* Eixo horizontal (quantidade) */}
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: '#ddd' }}
          axisLine={{ stroke: '#555' }}
          tickLine={{ stroke: '#555' }}
        />
        {/* Eixo vertical (nomes das categorias) */}
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: '#ddd', fontSize: 14 }}
          width={160}            // espaço para nomes longos
          axisLine={{ stroke: '#555' }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
          contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#aaa' }}
        />
        <Bar dataKey="count" fill="#ffc107" barSize={20} radius={[4, 4, 4, 4]}>
          {/* Exibe o valor ao final de cada barra */}
          <LabelList dataKey="count" position="right" fill="#fff" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
