// src/components/buildDailyCategoryData.js
import dayjs from 'dayjs';

/**
 * Recebe:
 *   - stock: array de itens de estoque (cada um com fields: category, createdAt, etc.)
 *   - engatadosId: _id da categoria “Chopes Engatados”
 *   - estoqueId:     _id da categoria “Estoque de Chopes”
 *
 * Retorna um array de objetos, ordenado por data, com a forma:
 * [
 *   { date: '2023-10-01', engatadosCount: 5, estoqueCount: 3 },
 *   { date: '2023-10-02', engatadosCount: 2, estoqueCount: 4 },
 *   ...
 * ]
 */
export function buildDailyCategoryData(stock, engatadosId, estoqueId) {
  const grouping = {};

  stock.forEach((item) => {
    const catId = item.category?._id;
    // Só interessa se for Engatados ou Estoque de Chopes
    if (![engatadosId, estoqueId].includes(String(catId))) {
      return;
    }

    // Pega a data de createdAt em YYYY-MM-DD
    const dateKey = dayjs(item.createdAt).format('YYYY-MM-DD');
    if (!grouping[dateKey]) {
      grouping[dateKey] = {
        date: dateKey,
        engatadosCount: 0,
        estoqueCount: 0,
      };
    }

    // Incrementa a contagem adequada
    if (String(catId) === String(engatadosId)) {
      grouping[dateKey].engatadosCount += 1;
    } else if (String(catId) === String(estoqueId)) {
      grouping[dateKey].estoqueCount += 1;
    }
  });

  // Converte para array ordenado cronologicamente
  return Object.values(grouping).sort((a, b) => (a.date > b.date ? 1 : -1));
}
