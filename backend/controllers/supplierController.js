const Supplier = require('../models/Supplier');

// GET /api/suppliers
async function getAllSuppliers(req, res) {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    console.error('Erro ao buscar fornecedores:', err);
    res.status(500).json({ error: 'Erro ao buscar fornecedores' });
  }
}

// GET /api/suppliers/:id
async function getSupplierById(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json(supplier);
  } catch (err) {
    console.error('Erro ao buscar fornecedor:', err);
    res.status(500).json({ error: 'Erro ao buscar fornecedor' });
  }
}

// POST /api/suppliers
async function createSupplier(req, res) {
  try {
    const { name, email, phone, address, notes } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nome do fornecedor é obrigatório' });
    }
    const newSupplier = new Supplier({ name, email, phone, address, notes });
    const saved = await newSupplier.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Erro ao criar fornecedor:', err);
    res.status(500).json({ error: 'Erro ao criar fornecedor' });
  }
}

// PUT /api/suppliers/:id
async function updateSupplier(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Supplier.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json(updated);
  } catch (err) {
    console.error('Erro ao atualizar fornecedor:', err);
    res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
  }
}

// DELETE /api/suppliers/:id
async function deleteSupplier(req, res) {
  try {
    const { id } = req.params;
    const removed = await Supplier.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json({ message: 'Fornecedor removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover fornecedor:', err);
    res.status(500).json({ error: 'Erro ao remover fornecedor' });
  }
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
