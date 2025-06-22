const express = require('express');
const router = express.Router();
const Estoque = require('../models/StockItem');

// Registrar novo estoque
router.post('/', async (req, res) => {
  const { produtoId, quantidade } = req.body;
  try {
    await Estoque.create({ produtoId, quantidade, dataRegistro: new Date() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar estoque.' });
  }
});

// Calcular CMV
router.get('/cmv', async (req, res) => {
  try {
    const totalEntradas = await Estoque.aggregate([
      { $group: { _id: null, total: { $sum: '$quantidade' } } }
    ]);

    const estoqueAtual = await Estoque.aggregate([
      { $sort: { dataRegistro: -1 } },
      { $group: { _id: '$produtoId', quantidade: { $first: '$quantidade' } } },
      { $group: { _id: null, total: { $sum: '$quantidade' } } }
    ]);

    const cmv = totalEntradas[0]?.total - estoqueAtual[0]?.total;
    res.json({ cmv });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular CMV.' });
  }
});

// Obter estoque atual
router.get('/atual', async (req, res) => {
  try {
    const estoqueAtual = await Estoque.aggregate([
      { $sort: { dataRegistro: -1 } },
      { $group: { _id: '$produtoId', quantidade: { $first: '$quantidade' } } },
      {
        $lookup: {
          from: 'produtos',
          localField: '_id',
          foreignField: '_id',
          as: 'produto'
        }
      },
      { $unwind: '$produto' },
      { $project: { produtoId: '$_id', quantidade: 1, nome: '$produto.nome' } }
    ]);
    res.json(estoqueAtual);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter estoque atual.' });
  }
});

module.exports = router;
