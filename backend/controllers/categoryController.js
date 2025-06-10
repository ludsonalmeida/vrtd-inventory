// backend/controllers/categoryController.js

const Category  = require('../models/Category');
const StockItem = require('../models/StockItem');

/**
 * GET /api/categories
 * Lista todas as categorias.
 */
async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json(categories);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    return res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
}

/**
 * GET /api/categories/:id
 * Retorna uma categoria específica.
 */
async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    return res.json(category);
  } catch (err) {
    console.error('Erro ao buscar categoria:', err);
    return res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
}

/**
 * POST /api/categories
 * Cria uma nova categoria.
 */
async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    // name já valido pelo express-validator em categoryRoutes
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Já existe uma categoria com esse nome' });
    }
    const newCat = await Category.create({
      name: name.trim(),
      description: description?.trim() || '',
    });
    return res.status(201).json(newCat);
  } catch (err) {
    console.error('Erro ao criar categoria:', err);
    return res.status(500).json({ error: 'Erro ao criar categoria' });
  }
}

/**
 * PUT /api/categories/:id
 * Atualiza uma categoria.
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    // Caso enviem name vazio, express-validator já rejeitou antes de entrar aqui

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() })
      },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    return res.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    return res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
}

/**
 * DELETE /api/categories/:id
 * Remove uma categoria somente se nenhum StockItem referenciar essa categoria.
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // 1) Verificar existência de StockItem com esta categoria
    const countItems = await StockItem.countDocuments({ category: id });
    if (countItems > 0) {
      return res.status(400).json({
        error: 'Não é possível remover: existem itens de estoque vinculados a esta categoria'
      });
    }

    // 2) Se não houver itens, remover a categoria
    const removed = await Category.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    return res.json({ message: 'Categoria removida com sucesso' });
  } catch (err) {
    console.error('Erro ao remover categoria:', err);
    return res.status(500).json({ error: 'Erro ao remover categoria' });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
