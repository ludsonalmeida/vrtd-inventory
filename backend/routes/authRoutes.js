const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Validações para login (preserva pontos em e-mails Gmail)
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
];

router.post(
  '/login',
  loginValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Retorna o primeiro erro de validação (400)
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  authController.login
);

// Validações para registro
const registerValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Role inválido')
];

router.post(
  '/register',
  registerValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  authController.register
);

module.exports = router;
