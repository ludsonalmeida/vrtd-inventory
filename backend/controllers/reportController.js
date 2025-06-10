// backend/controllers/reportController.js

const StockItem = require('../models/StockItem');
const mongoose  = require('mongoose');

/**
 * COLOQUE AQUI OS _IDs_ reais (24 caracteres hexadecimais) das suas categorias:
 *   - const ENGATADOS_CAT_ID = '644a1f73e1d3c9a7b1234567';
 *   - const ESTOQUE_CAT_ID   = '644a1f75e1d3c9a7b7654321';
 *
 * Se você deixar os placeholders (strings não válidas), a validação abaixo disparará erro
 * e devolverá mensagem clara ao frontend.
 */
const ENGATADOS_CAT_ID = '6841a372376d6b1b2af433d0'; // <— substitua pelo _id_ correto
const ESTOQUE_CAT_ID   = '6841a330376d6b1b2af433bf'; // <— substitua pelo _id_ correto

async function getDailyChopes(req, res) {
  try {
    // 1) Validação: garanta que ambos os IDs sejam ObjectId válidos
    if (!mongoose.isValidObjectId(ENGATADOS_CAT_ID) || !mongoose.isValidObjectId(ESTOQUE_CAT_ID)) {
      return res.status(500).json({
        error:
          'ID inválido para categoria. Verifique as constantes ENGATADOS_CAT_ID e ESTOQUE_CAT_ID em reportController.js:\n' +
          'elas devem ser strings de 24 caracteres hexadecimais que correspondam exatamente aos _id_ de “Chopes Engatados” e “Estoque de Chopes”.'
      });
    }

    // 2) Use 'new' ao criar ObjectId:
    const engatadosId = new mongoose.Types.ObjectId(ENGATADOS_CAT_ID);
    const estoqueId   = new mongoose.Types.ObjectId(ESTOQUE_CAT_ID);

    // 3) Pipeline de agregação:
    const pipeline = [
      {
        $match: {
          category: { $in: [engatadosId, estoqueId] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          engatadosCount: {
            $sum: {
              $cond: [{ $eq: ['$category', engatadosId] }, 1, 0]
            }
          },
          estoqueCount: {
            $sum: {
              $cond: [{ $eq: ['$category', estoqueId] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          engatadosCount: 1,
          estoqueCount: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ];

    const resultados = await StockItem.aggregate(pipeline);
    return res.json(resultados);
  } catch (err) {
    console.error('>>> ERRO DETALHADO AO GERAR RELATÓRIO DIÁRIO:', err);
    return res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

module.exports = { getDailyChopes };
