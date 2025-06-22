// backend/routes/stockRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const stockController = require('../controllers/stockController');
const { authenticate } = require('../controllers/authController');
const StockMovement = require('../models/StockMovement');
const authMiddleware = require('../middlewares/authMiddleware');

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


// POST /api/stock/daily-count
// Recebe array de contagem diária [{ productId, quantityContada, status }]
router.post('/stock/daily-count', async (req, res) => {
  const contagem = req.body; // array

  try {
    for (const item of contagem) {
      // Buscar estoque atual do produto
      const stockItem = await StockItem.findOne({ product: item.productId });
      const qtdAnterior = stockItem ? stockItem.quantity : 0;
      const diferenca = qtdAnterior - item.quantityContada;

      if (diferenca > 0) {
        // Registrar saída
        await StockMovement.create({
          product: item.productId,
          quantity: -diferenca, // negativo = saída
          type: 'saida',
          date: new Date(),
          reason: 'Consumo diário via contagem',
        });
      }

      // Atualizar estoque atual
      if (stockItem) {
        stockItem.quantity = item.quantityContada;
        await stockItem.save();
      } else {
        // Caso não exista estoque, criar novo
        await StockItem.create({
          product: item.productId,
          quantity: item.quantityContada,
          // preencher demais campos como necessário
        });
      }
    }

    res.json({ message: 'Contagem processada com sucesso' });
  } catch (error) {
    console.error('Erro ao processar contagem diária:', error);
    res.status(500).json({ error: 'Erro ao processar contagem diária' });
  }
});

// Rota para processar contagem diária (POST)
router.post('/daily-count', authMiddleware, stockController.processDailyCount);

// GET /api/stock/movements?productId=xxx&startDate=yyyy-mm-dd&endDate=yyyy-mm-dd
router.get('/stock/movements', async (req, res) => {
  const { productId, startDate, endDate } = req.query;

  const filter = {};
  if (productId) filter.product = productId;
  if (startDate || endDate) filter.date = {};
  if (startDate) filter.date.$gte = new Date(startDate);
  if (endDate) filter.date.$lte = new Date(endDate);

  try {
    const movements = await StockMovement.find(filter)
      .populate('product', 'name')
      .sort({ date: -1 });

    res.json(movements);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({ error: 'Erro ao buscar movimentações' });
  }
});

module.exports = router;
