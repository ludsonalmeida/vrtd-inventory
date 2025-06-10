// backend/routes/supplierRoutes.js

const express = require('express');
const {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getStockBySupplier,
  getSuppliersReport,
} = require('../controllers/supplierController');
const { authenticate } = require('../controllers/authController');

const router = express.Router();

// ─── Rotas de relatório e agregações (devem vir antes de "/:id") ───

// GET /api/suppliers/report
// Retorna, para cada fornecedor, total de itens e quantidade total em estoque.
router.get('/report', authenticate, getSuppliersReport);

// GET /api/suppliers/:id/stock
// Retorna todos os itens vinculados a um fornecedor específico.
router.get('/:id/stock', authenticate, getStockBySupplier);

// ─── Rotas CRUD de Supplier ───

// GET /api/suppliers
router.get('/', authenticate, getAllSuppliers);

// GET /api/suppliers/:id
// Para evitar CastError, validamos se :id é um ObjectId antes de chamar o controller.
router.get('/:id', authenticate, (req, res, next) => {
  const { id } = req.params;
  // RegEx simples para ObjectId (24 hexadecimais)
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ error: 'ID de fornecedor inválido' });
  }
  next();
}, getSupplierById);

// POST /api/suppliers
router.post('/', authenticate, createSupplier);

// PUT /api/suppliers/:id
router.put('/:id', authenticate, (req, res, next) => {
  const { id } = req.params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ error: 'ID de fornecedor inválido' });
  }
  next();
}, updateSupplier);

// DELETE /api/suppliers/:id
router.delete('/:id', authenticate, (req, res, next) => {
  const { id } = req.params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ error: 'ID de fornecedor inválido' });
  }
  next();
}, deleteSupplier);

module.exports = router;
