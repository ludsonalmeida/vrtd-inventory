// backend/routes/stockRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const stockController = require('../controllers/stockController');
const router = express.Router();

// Validações básicas: category (ObjectId), name, etc.
const itemValidation = [
  body('category')
    .notEmpty().withMessage('Categoria é obrigatória')
    .isMongoId().withMessage('ID de categoria inválido'),
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome pode ter até 100 caracteres'),
  body('quantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Quantidade deve ser número inteiro ≥ 0'),
  body('unit')
    .optional()
    .isLength({ max: 50 }).withMessage('Unidade pode ter até 50 caracteres'),
  body('status')
    .optional()
    .isIn(['Cheio', 'Meio', 'Final', 'Baixo', 'N/A']).withMessage('Status inválido')
];

// GET    /api/stock
router.get('/', stockController.getAllItems);

// GET    /api/stock/:id
router.get('/:id', stockController.getItemById);

// POST   /api/stock
router.post(
  '/',
  itemValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  stockController.createItem
);

// PUT    /api/stock/:id
router.put(
  '/:id',
  itemValidation.map(rule => rule.optional({ checkFalsy: true })),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  stockController.updateItem
);

// DELETE /api/stock/:id
router.delete('/:id', stockController.deleteItem);

module.exports = router;
