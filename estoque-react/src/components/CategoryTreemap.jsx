// src/components/CategoryTreemap.jsx
import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useCategory } from '../contexts/CategoryContext';
import { useStock } from '../contexts/StockContext';

/**
 * Constrói dados no formato:
 * [
 *   { name: 'Bebidas Não Alcoólicas', value: 12 },
 *   { name: 'Temperos e Complementos', value: 8 },
 *   // ...
 * ]
 */
function buildData(categories, stock) {
  return categories.map(cat => ({
    name: cat.name,
    value: stock.filter(item => item.category?.name === cat.name).length
  }));
}

export default function CategoryTreemap() {
  const { categories } = useCategory();
  const { stock } = useStock();

  const data = buildData(categories, stock);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="value"
        nameKey="name"
        stroke="#fff"
        fill="#ffc107"
        ratio={4 / 3}
        // padding interno entre retângulos
        innerPadding={4}
        outerPadding={4}
        content={<CustomizedContent />}
      >
        <Tooltip
          formatter={(value, name) => [`${value}`, `${name}`]}
          cursor={{ stroke: '#888', strokeWidth: 2, fill: 'none' }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}

/**
 * Esse componente personalizado desenha os retângulos e o rótulo de cada categoria.
 */
function CustomizedContent(props) {
  const {
    x, y, width, height, name, value, index, colors
  } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: '#ffc107',
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      {width > 60 && height > 40 ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#000"
          fontSize={14}
          fontWeight="bold"
        >
          {name} ({value})
        </text>
      ) : null}
    </g>
  );
}
