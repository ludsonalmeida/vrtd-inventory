// backend/controllers/stockController.js
const StockItem = require('../models/StockItem');
const Category = require('../models/Category');

/**
 * GET /api/stock
 * Retorna todos os itens, com categoria “populada” (apenas o nome).
 */
async function getAllItems(req, res) {
  try {
    const items = await StockItem.find()
      .populate('category', 'name')
      .sort({ 'category.name': 1, name: 1 });
    res.json(items);
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    res.status(500).json({ error: 'Erro ao buscar itens' });
  }
}

/**
 * GET /api/stock/:id
 * Retorna um item específico, com categoria populada.
 */
async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const item = await StockItem.findById(id).populate('category', 'name');
    if (!item) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item' });
  }
}

/**
 * POST /api/stock
 * Cria um novo item de estoque. Recebe category como ObjectId (string).
 */
async function createItem(req, res) {
  try {
    const { category, name, quantity, unit, status } = req.body;

    // Validação básica
    if (!category || !name) {
      return res.status(400).json({ error: 'Categoria e nome são obrigatórios' });
    }
    // Verifica se a categoria existe
    const catExists = await Category.findById(category);
    if (!catExists) {
      return res.status(400).json({ error: 'Categoria inválida' });
    }

    // Cria e salva o novo item
    const newItem = new StockItem({ category, name, quantity, unit, status });
    const saved = await newItem.save();

    // Rebusca pelo ID e popula categoria
    const populated = await StockItem.findById(saved._id).populate('category', 'name');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ error: 'Erro ao criar item' });
  }
}

/**
 * PUT /api/stock/:id
 * Atualiza um item. Pode atualizar category, name, quantity, etc.
 */
async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Se category estiver no body, verifique se existe
    if (updates.category) {
      const catExists = await Category.findById(updates.category);
      if (!catExists) {
        return res.status(400).json({ error: 'Categoria inválida' });
      }
    }

    const updated = await StockItem.findByIdAndUpdate(id, updates, {
      new: true
    }).populate('category', 'name');

    if (!updated) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
}

/**
 * DELETE /api/stock/:id
 */
async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const removed = await StockItem.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ message: 'Item removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
