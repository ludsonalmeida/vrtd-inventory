const express = require('express');
const router = express.Router();
const { 
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { authenticate } = require('../controllers/authController');

// Todas essas rotas devem exigir autenticação:
router.get('/', authenticate, getAllSuppliers);
router.get('/:id', authenticate, getSupplierById);
router.post('/', authenticate, createSupplier);
router.put('/:id', authenticate, updateSupplier);
router.delete('/:id', authenticate, deleteSupplier);

module.exports = router;
