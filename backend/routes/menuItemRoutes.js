// backend/routes/menuItemRoutes.js
const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/menuItemController');

const router = express.Router();

// Validações básicas para criação/atualização
const baseValidations = [
  body('unit').notEmpty().withMessage('unit é obrigatório'),
  body('title').isString().trim().notEmpty().withMessage('title é obrigatório'),
  body('price').isFloat({ min: 0 }).withMessage('price inválido'),
  body('section').isIn(['items','promos','chopes']).withMessage('section inválida'),
];

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', baseValidations, controller.create);
router.put('/:id', baseValidations, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
