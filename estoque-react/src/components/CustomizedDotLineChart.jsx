// src/components/CustomizedDotLineChart.jsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useStock } from '../contexts/StockContext';
import dayjs from 'dayjs';

/**
 * Mapea status para cores no gráfico
 */
const STATUS_COLORS = {
  Cheio: '#4caf50',
  Meio: '#2196f3',
  Baixo: '#ff9800',
  Final: '#f44336',
  Vazio: '#757575',
};

/**
 * Agrupa todos os itens de “barril” do estoque por data de createdAt
 * e soma quantos, naquela data, tinham status “Cheio” / “Meio” / “Baixo” / “Final” / “Vazio”.
 *
 * Retorna um array ordenado por data, no formato:
 * [
 *   { date: '2025-06-01', Cheio: 2, Meio: 1, Baixo: 0, Final: 0, Vazio: 1 },
 *   { date: '2025-06-03', Cheio: 3, Meio: 0, Baixo: 1, Final: 0, Vazio: 0 },
 *   ...
 * ]
 */
function buildDateStatusSeries(stock) {
  // Filtra apenas itens cuja unidade seja “barril”.
  // Aqui assumimos que `unit` armazena o ID do documento “barril” do collection Unit.
  // Caso você queira filtrar pela categoria, basta trocar `item.unit === 'ID_DO_BARRIL'`
  // por `item.category?.name === 'Chopes Engatados'` ou o nome exato que você use.
  const BARREL_UNIT_NAME = 'barril'; // ajuste se o campo `unit` for o _id ou string “barril”
  // Se no seu backend você salvou `item.unit` como _id, use obj de unidades do contexto:
  //   const barrelUnitId = units.find(u => u.name.toLowerCase() === 'barril')._id;

  // Aqui faremos agrupamento em objeto temporário:
  const grouping = {};

  stock.forEach((item) => {
    // Se não for barril, ignora
    if (!item.unit) return;
    // Para este exemplo, vou supor que `item.unit` é exatamente a string `"barril"` ou o _id que você
    // usaria para barril. Ajuste conforme sua modelagem.
    if (String(item.unit).toLowerCase() !== BARREL_UNIT_NAME) return;

    // Extrai a data (YYYY-MM-DD) do createdAt
    const dateKey = dayjs(item.createdAt).format('YYYY-MM-DD');

    // Cria se ainda não existir
    if (!grouping[dateKey]) {
      grouping[dateKey] = {
        date: dateKey,
        Cheio: 0,
        Meio: 0,
        Baixo: 0,
        Final: 0,
        Vazio: 0,
      };
    }

    const status = item.status || 'N/A';
    // Se o status for diferente de “Cheio”, “Meio”, “Baixo”, “Final” ou “Vazio”, podemos pular ou contar em “Vazio”
    if (['Cheio', 'Meio', 'Baixo', 'Final', 'Vazio'].includes(status)) {
      grouping[dateKey][status] += 1;
    }
  });

  // Converta o objeto de agrupamento em array, ordene por data
  const seriesArray = Object.values(grouping).sort((a, b) =>
    a.date > b.date ? 1 : -1
  );

  return seriesArray;
}

export default function CustomizedDotLineChart() {
  const { stock } = useStock();

  // Gera a série somente quando o estoque mudar
  const data = useMemo(() => buildDateStatusSeries(stock), [stock]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        {/* Eixo X: datas (YYYY-MM-DD) */}
        <XAxis
          dataKey="date"
          tick={{ fill: '#ddd', fontSize: 12 }}
          axisLine={{ stroke: '#555' }}
          tickLine={{ stroke: '#555' }}
        />
        {/* Eixo Y: quantidade de itens */}
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#ddd', fontSize: 12 }}
          axisLine={{ stroke: '#555' }}
          tickLine={{ stroke: '#555' }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e1e1e', border: 'none' }}
          itemStyle={{ color: '#fff' }}
          labelStyle={{ color: '#aaa' }}
        />
        <Legend
          wrapperStyle={{ color: '#ddd', marginTop: 10 }}
          iconType="circle"
        />

        {/* Desenha uma linha distinta para cada status */}
        {['Cheio', 'Meio', 'Baixo', 'Final', 'Vazio'].map((status) => (
          <Line
            key={status}
            type="monotone"
            dataKey={status}
            stroke={STATUS_COLORS[status]}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
