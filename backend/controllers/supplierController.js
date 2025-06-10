// backend/controllers/supplierController.js
const Supplier = require('../models/Supplier');
const StockItem = require('../models/StockItem');

/**
 * GET /api/suppliers
 * Lista todos os fornecedores (sem itens).
 */
async function getAllSuppliers(req, res) {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    return res.json(suppliers);
  } catch (err) {
    console.error('Erro ao buscar fornecedores:', err);
    return res.status(500).json({ error: 'Erro ao buscar fornecedores' });
  }
}

/**
 * GET /api/suppliers/:id
 * Retorna apenas um fornecedor (sem itens).
 */
async function getSupplierById(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    return res.json(supplier);
  } catch (err) {
    console.error('Erro ao buscar fornecedor:', err);
    return res.status(500).json({ error: 'Erro ao buscar fornecedor' });
  }
}

/**
 * POST /api/suppliers
 * Cria um novo fornecedor.
 */
async function createSupplier(req, res) {
  try {
    const { name, cnpj, email, phone } = req.body;
    const existing = await Supplier.findOne({ cnpj });
    if (existing) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }
    const novo = await Supplier.create({ name, cnpj, email, phone });
    return res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar fornecedor:', err);
    return res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
}

/**
 * PUT /api/suppliers/:id
 * Atualiza um fornecedor existente.
 */
async function updateSupplier(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Supplier.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    return res.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar fornecedor:', err);
    return res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
  }
}

/**
 * DELETE /api/suppliers/:id
 * Remove um fornecedor, desde que não haja itens vinculados.
 */
async function deleteSupplier(req, res) {
  try {
    const { id } = req.params;
    // Verifica se existem itens vinculados a este fornecedor
    const itemsCount = await StockItem.countDocuments({ supplier: id });
    if (itemsCount > 0) {
      return res.status(400).json({
        error: 'Não é possível remover: existem itens de estoque vinculados a este fornecedor',
      });
    }

    const removed = await Supplier.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    return res.json({ message: 'Fornecedor removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover fornecedor:', err);
    return res.status(500).json({ error: 'Erro ao remover fornecedor' });
  }
}

/**
 * GET /api/suppliers/:id/stock
 * Retorna todos os itens vinculados a um fornecedor específico.
 */
async function getStockBySupplier(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }
    const items = await StockItem.find({ supplier: id })
      .populate('category', 'name')
      .populate('unit', 'name');
    return res.json({ supplier, items });
  } catch (err) {
    console.error('Erro ao buscar itens por fornecedor:', err);
    return res.status(500).json({ error: 'Erro ao buscar itens por fornecedor' });
  }
}

/**
 * GET /api/suppliers/report
 * Retorna um relatório geral: para cada fornecedor, quantos itens e somatório de quantidade.
 */
async function getSuppliersReport(req, res) {
  try {
    // 1) Agregação: agrupa StockItem por supplier, contando itens e somando quantidades
    const report = await StockItem.aggregate([
      {
        $group: {
          _id: '$supplier',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'suppliers',       // collection de Supplier
          localField: '_id',       // _id do grupo == supplierId
          foreignField: '_id',
          as: 'supplierInfo',
        },
      },
      { $unwind: '$supplierInfo' },
      {
        $project: {
          supplierId: '$_id',
          supplierName: '$supplierInfo.name',
          cnpj: '$supplierInfo.cnpj',
          totalItems: 1,
          totalQuantity: 1,
        },
      },
      {
        $sort: { supplierName: 1 },
      },
    ]);

    // 2) Trazer todos os fornecedores para incluir aqueles sem itens
    const allSuppliers = await Supplier.find({}, 'name cnpj').lean();
    const finalReport = allSuppliers.map(sup => {
      const joined = report.find(r => String(r.supplierId) === String(sup._id));
      if (joined) {
        return {
          supplierId: sup._id,
          supplierName: sup.name,
          cnpj: sup.cnpj,
          totalItems: joined.totalItems,
          totalQuantity: joined.totalQuantity,
        };
      } else {
        return {
          supplierId: sup._id,
          supplierName: sup.name,
          cnpj: sup.cnpj,
          totalItems: 0,
          totalQuantity: 0,
        };
      }
    });

    return res.json(finalReport);
  } catch (err) {
    console.error('Erro ao gerar relatório de fornecedores:', err);
    return res.status(500).json({ error: 'Erro ao gerar relatório de fornecedores' });
  }
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getStockBySupplier,
  getSuppliersReport,
};
