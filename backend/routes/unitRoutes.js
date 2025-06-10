// backend/routes/unitRoutes.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const unitController = require('../controllers/unitController');
const router = express.Router();

// Validação de campos
const unitValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome da unidade é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome pode ter até 100 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 300 }).withMessage('Descrição pode ter até 300 caracteres'),
  body('iconName')
    .trim()
    .notEmpty().withMessage('Ícone é obrigatório')
    .isLength({ max: 100 }).withMessage('Ícone pode ter até 100 caracteres'),
];

router.get('/', unitController.getAllUnits);
router.get('/:id', unitController.getUnitById);

// POST exigindo nome + iconName
router.post(
  '/',
  unitValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  unitController.createUnit
);

// PUT: campos opcionais, mas, se vierem, iconName não pode ficar vazio
router.put(
  '/:id',
  unitValidation.map((rule) => rule.optional({ checkFalsy: true })),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  unitController.updateUnit
);

router.delete('/:id', unitController.deleteUnit);

module.exports = router;
