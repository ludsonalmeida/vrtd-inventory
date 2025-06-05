// backend/controllers/categoryController.js
const Category = require('../models/Category');

/**
 * GET /api/categories
 * Retorna todas as categorias, ordenadas por nome.
 */
async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
}

/**
 * GET /api/categories/:id
 * Retorna uma categoria pelo ID.
 */
async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    return res.json(category);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
}

/**
 * POST /api/categories
 * Cria uma nova categoria.
 * Body JSON: { name: String, description?: String }
 */
async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }
    // Verifica duplicidade
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Categoria com esse nome já existe' });
    }

    const newCat = new Category({
      name: name.trim(),
      description: description?.trim() || ''
    });
    const saved = await newCat.save();
    return res.status(201).json(saved);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({ error: 'Erro ao criar categoria' });
  }
}

/**
 * PUT /api/categories/:id
 * Atualiza uma categoria existente.
 * Body JSON pode ter { name?: String, description?: String }
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const toUpdate = {};
    if (name !== undefined) {
      if (name.trim() === '') {
        return res.status(400).json({ error: 'Nome da categoria não pode ser vazio' });
      }
      // Se mudou o nome, verifica duplicidade
      const existing = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ error: 'Outra categoria com esse nome já existe' });
      }
      toUpdate.name = name.trim();
    }
    if (description !== undefined) {
      toUpdate.description = description.trim();
    }

    const updated = await Category.findByIdAndUpdate(id, toUpdate, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
}

/**
 * DELETE /api/categories/:id
 * Deleta uma categoria pelo ID.
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const removed = await Category.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    return res.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    return res.status(500).json({ error: 'Erro ao remover categoria' });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
