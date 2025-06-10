const express = require('express');
const { body, validationResult } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// Validações de nome e description
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome da categoria é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome pode ter até 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 300 }).withMessage('Descrição pode ter até 300 caracteres')
];

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

router.post(
  '/',
  categoryValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  categoryController.createCategory
);

router.put(
  '/:id',
  categoryValidation.map(rule => rule.optional({ checkFalsy: true })),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  categoryController.updateCategory
);

// DELETE: não remove se existir StockItem referenciando esta categoria
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
