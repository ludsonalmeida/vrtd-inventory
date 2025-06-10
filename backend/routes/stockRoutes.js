// backend/routes/stockRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const stockController = require('../controllers/stockController');
const { authenticate } = require('../controllers/authController');

const router = express.Router();

const itemValidation = [
  body('supplier')
    .notEmpty().withMessage('Fornecedor é obrigatório')
    .isMongoId().withMessage('ID de fornecedor inválido'),
  body('category')
    .notEmpty().withMessage('Categoria é obrigatória')
    .isMongoId().withMessage('ID de categoria inválido'),
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome pode ter até 100 caracteres'),
  body('quantity')
    .optional()
    .isNumeric().withMessage('Quantidade deve ser número'),
  body('stockMin')
    .optional()
    .isNumeric().withMessage('stockMin deve ser número'),
  body('stockMax')
    .optional()
    .isNumeric().withMessage('stockMax deve ser número'),
  body('unit')
    .optional()
    .isMongoId().withMessage('ID de unidade inválido'),
  body('status')
    .optional()
    .isIn(['Cheio', 'Meio', 'Final', 'Baixo', 'Vazio', 'N/A'])
    .withMessage('Status inválido'),
  // Validação do novo campo avgPrice:
  body('avgPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Preço médio deve ser número não negativo'),
];

// GET /api/stock
router.get('/', authenticate, stockController.getAllItems);

// GET /api/stock/:id
router.get('/:id', authenticate, stockController.getItemById);

// POST /api/stock
router.post(
  '/',
  authenticate,
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

// PUT /api/stock/:id
router.put(
  '/:id',
  authenticate,
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
router.delete('/:id', authenticate, stockController.deleteItem);

module.exports = router;
