// backend/controllers/stockController.js
const StockItem = require('../models/StockItem');
const Category  = require('../models/Category');
const Supplier  = require('../models/Supplier');
const Unit      = require('../models/Unit');

/**
 * GET /api/stock
 * Retorna todos os itens de estoque, populando 'category', 'supplier' e 'unit'.
 */
async function getAllItems(req, res) {
  try {
    const items = await StockItem.find()
      .populate('category', 'name')
      .populate('supplier', 'name cnpj')
      .populate('unit', 'name iconName');
    return res.json(items);
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return res.status(500).json({ error: 'Erro ao buscar itens' });
  }
}

/**
 * GET /api/stock/:id
 * Retorna um único item de estoque, populando category, supplier e unit.
 */
async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const item = await StockItem.findById(id)
      .populate('category', 'name')
      .populate('supplier', 'name cnpj')
      .populate('unit', 'name iconName');
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    return res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return res.status(500).json({ error: 'Erro ao buscar item' });
  }
}

/**
 * POST /api/stock
 * Cria um novo item de estoque. Exige supplier, category, name no body.
 */
async function createItem(req, res) {
  try {
    const {
      supplier,
      category,
      name,
      quantity,
      stockMin,
      stockMax,
      unit,
      status,
      avgPrice, // Novo campo
    } = req.body;

    // 1) Verifica se o fornecedor existe
    const foundSupplier = await Supplier.findById(supplier);
    if (!foundSupplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    // 2) Verifica se a categoria existe
    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // 3) Verifica se a unidade existe (se fornecida)
    if (unit) {
      const foundUnit = await Unit.findById(unit);
      if (!foundUnit) {
        return res.status(404).json({ error: 'Unidade não encontrada' });
      }
    }

    // 4) Cria o novo item de estoque, incluindo avgPrice se presente
    const newItem = await StockItem.create({
      supplier,
      category,
      name: name.trim(),
      quantity: quantity ?? 0,
      stockMin: stockMin ?? 0,
      stockMax: stockMax ?? 0,
      unit: unit || null,
      status: status || 'N/A',
      avgPrice: avgPrice !== undefined ? Number(avgPrice) : undefined,
    });

    // 5) Retorna o item populado
    const populated = await StockItem.findById(newItem._id)
      .populate('category', 'name')
      .populate('supplier', 'name cnpj')
      .populate('unit', 'name iconName');

    return res.status(201).json(populated);
  } catch (error) {
    console.error('Erro ao criar item de estoque:', error);
    return res.status(500).json({ error: 'Erro ao criar item de estoque' });
  }
}

/**
 * PUT /api/stock/:id
 * Atualiza um item de estoque. Pode atualizar supplier, category, name, etc.
 */
async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const updateData = {};

    if (req.body.supplier) {
      const sup = await Supplier.findById(req.body.supplier);
      if (!sup) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }
      updateData.supplier = req.body.supplier;
    }
    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (!cat) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      updateData.category = req.body.category;
    }
    if (req.body.unit) {
      const u = await Unit.findById(req.body.unit);
      if (!u) {
        return res.status(404).json({ error: 'Unidade não encontrada' });
      }
      updateData.unit = req.body.unit;
    }
    if (req.body.name !== undefined)      updateData.name = req.body.name.trim();
    if (req.body.quantity !== undefined)  updateData.quantity = req.body.quantity;
    if (req.body.stockMin !== undefined)  updateData.stockMin = req.body.stockMin;
    if (req.body.stockMax !== undefined)  updateData.stockMax = req.body.stockMax;
    if (req.body.status !== undefined)    updateData.status = req.body.status;
    if (req.body.avgPrice !== undefined)  updateData.avgPrice = Number(req.body.avgPrice);

    const updated = await StockItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name')
      .populate('supplier', 'name cnpj')
      .populate('unit', 'name iconName');

    if (!updated) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return res.status(500).json({ error: 'Erro ao atualizar item' });
  }
}

/**
 * DELETE /api/stock/:id
 * Remove um item de estoque.
 */
async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const removed = await StockItem.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    return res.json({ message: 'Item removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return res.status(500).json({ error: 'Erro ao remover item' });
  }
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
