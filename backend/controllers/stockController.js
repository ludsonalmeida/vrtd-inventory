// src/controllers/stockController.js
// Importe seu modelo de movimentação de estoque (criar depois)
const StockMovement = require('../models/StockMovement');
const StockItem = require('../models/StockItem');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Unit = require('../models/Unit');

/**
 * GET /api/stock
 * Retorna todos os itens de estoque, populando 'category', 'supplier' e 'unit'.
 */
async function getAllItems(req, res) {
  try {
    const items = await StockItem.find()
      .populate('category', 'name')
      .populate('unit', 'name iconName')
      .populate({
        path: 'product',
         select: 'name avgPrice supplier',
        populate: { path: 'supplier', select: 'name cnpj' },
      })
      .populate('supplier', 'name cnpj');  // ← Incluindo o supplier direto no StockItem (se tiver)
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
      .populate('unit', 'name iconName')
      .populate({
        path: 'product',
        select: 'name supplier',
        populate: { path: 'supplier', select: 'name cnpj' },
      })
      .populate('supplier', 'name cnpj');
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
      product,
      quantity,
      stockMin,
      stockMax,
      unit,
      status,
      //avgPrice,
    } = req.body;

    if (!product) {
      return res.status(400).json({ error: 'Produto é obrigatório' });
    }

    const foundSupplier = await Supplier.findById(supplier);
    if (!foundSupplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    if (unit) {
      const foundUnit = await Unit.findById(unit);
      if (!foundUnit) {
        return res.status(404).json({ error: 'Unidade não encontrada' });
      }
    }

    const newItem = await StockItem.create({
      supplier,
      category,
      product,
      quantity: quantity ?? 0,
      stockMin: stockMin ?? 0,
      stockMax: stockMax ?? 0,
      unit: unit || null,
      status: status || 'N/A',
      //avgPrice: avgPrice !== undefined && avgPrice !== '' ? Number(avgPrice) : undefined,
    });

    const populated = await StockItem.findById(newItem._id)
      .populate('category', 'name')
      .populate('unit', 'name iconName')
      .populate({
        path: 'product',
        select: 'name avgPrice supplier',
        populate: { path: 'supplier', select: 'name cnpj' },
      })
      .populate('supplier', 'name cnpj');

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

    if (req.body.product !== undefined) updateData.product = req.body.product;
    if (req.body.quantity !== undefined) updateData.quantity = req.body.quantity;
    if (req.body.stockMin !== undefined) updateData.stockMin = req.body.stockMin;
    if (req.body.stockMax !== undefined) updateData.stockMax = req.body.stockMax;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    //if (req.body.avgPrice !== undefined) updateData.avgPrice = Number(req.body.avgPrice);

    const updated = await StockItem.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name')
      .populate('unit', 'name iconName')
      .populate({
        path: 'product',
        select: 'name avgPrice supplier',
        populate: { path: 'supplier', select: 'name cnpj' },
      })
      .populate('supplier', 'name cnpj');

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


async function processDailyCount(req, res) {
  try {
    const dailyCounts = req.body; // Array de { productId, quantityContada, status }

    if (!Array.isArray(dailyCounts)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    // Iterar por cada produto contado
    for (const countItem of dailyCounts) {
      const { productId, quantityContada, status } = countItem;

      // Buscar estoque atual pelo productId
      const stockItem = await StockItem.findOne({ product: productId });

      if (!stockItem) {
        // Produto não está no estoque, ignore ou crie novo item
        continue;
      }

      // Calcular diferença
      const diff = quantityContada - stockItem.quantity;

      // Registrar movimentação só se houver diferença
      if (diff !== 0) {
        const movementType = diff < 0 ? 'saida' : 'entrada';

        // Grava movimentação
        await StockMovement.create({
          product: productId,
          quantity: Math.abs(diff),
          type: movementType,
          reason: 'Contagem diária',
          date: new Date(),
          status: status || stockItem.status,
        });

        // Atualiza estoque para quantidade contada
        stockItem.quantity = quantityContada;
        stockItem.status = status || stockItem.status;
        await stockItem.save();
      }
    }

    return res.json({ message: 'Contagem diária processada com sucesso' });
  } catch (err) {
    console.error('Erro no processamento da contagem diária:', err);
    return res.status(500).json({ error: 'Erro interno ao processar contagem diária' });
  }
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  processDailyCount,
};