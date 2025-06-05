// src/components/buildDailyStatusData.js
import dayjs from 'dayjs';

/**
 * Recebe um array de itens de estoque (cada um contendo: createdAt, status e, opcionalmente, unit ou category).
 * Retorna um array de objetos agrupados por dia (YYYY-MM-DD), contendo as propriedades:
 *  { date, Cheio, Meio, Baixo, Final, Vazio }
 */
export function buildDailyStatusData(stock) {
  const grouping = {};

  stock.forEach((item) => {
    // 1) Filtrar apenas “chope engatado”.
    //    Se você tiver salvo no item.unit o ID do documento “barril”:
    //       const isBarrel = item.unit === barrelUnitId; 
    //    Ou se for pela categoria (por exemplo, category.name === 'Chopes Engatados'):
    //       const isBarrel = item.category?.name === 'Chopes Engatados';
    //
    //    **Ajuste abaixo para sua modelagem específica**:
    const isBarrel = item.category?.name === 'Chopes Engatados'; 
    if (!isBarrel) return;

    // 2) Converter createdAt para dia (YYYY-MM-DD)
    const dateKey = dayjs(item.createdAt).format('YYYY-MM-DD');

    if (!grouping[dateKey]) {
      grouping[dateKey] = { 
        date: dateKey,
        Cheio: 0, 
        Meio: 0, 
        Baixo: 0, 
        Final: 0, 
        Vazio: 0 
      };
    }

    const status = item.status || 'N/A';
    // Se o status estiver fora dos esperados, podemos agrupar em Vazio ou ignorar.
    if (['Cheio', 'Meio', 'Baixo', 'Final', 'Vazio'].includes(status)) {
      grouping[dateKey][status] += 1;
    }
  });

  // Converter para array e ordenar por data
  return Object.values(grouping).sort((a, b) => (a.date > b.date ? 1 : -1));
}
