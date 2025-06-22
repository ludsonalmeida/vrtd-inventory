// backend/controllers/stockMovementController.js
const StockMovement = require('../models/StockMovement');
const Product       = require('../models/Product');
const User          = require('../models/User'); // para popular o usuário

/**
 * POST /api/stock/movements
 * Cria uma nova movimentação de estoque (entrada ou saída).
 */
async function createMovement(req, res) {
  try {
    const { product, quantity, type, reason } = req.body;
    const userId = req.user._id; // fornecido pelo authenticate middleware

    // 1) valida produto
    const foundProduct = await Product.findById(product);
    if (!foundProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // 2) cria a movimentação diretamente
    const newMovement = await StockMovement.create({
      product,
      quantity,
      type,    // 'entrada' ou 'saida'
      reason,  // opcional
      user: userId,
    });

    // 3) busca novamente essa movimentação já populada
    const populated = await StockMovement.findById(newMovement._id)
      .populate({ path: 'product', select: 'name avgPrice' })
      .populate({ path: 'user',    select: 'name email' });

    return res.status(201).json(populated);
  } catch (err) {
    console.error('Erro ao criar movimento:', err);
    return res.status(500).json({ error: 'Erro ao criar movimento' });
  }
}

/**
 * GET /api/stock/movements
 * Retorna todas as movimentações, ordenadas da mais recente para a mais antiga.
 */
async function getAllMovements(req, res) {
  try {
    const list = await StockMovement.find()
      .sort({ date: -1 })
      .populate({ path: 'product', select: 'name avgPrice' })
      .populate({ path: 'user',    select: 'name email' });

    return res.json(list);
  } catch (err) {
    console.error('Erro ao listar movimentos:', err);
    return res.status(500).json({ error: 'Erro ao listar movimentos' });
  }
}

module.exports = {
  createMovement,
  getAllMovements,
};
