const express                   = require('express');
const router                    = express.Router();
const authenticate              = require('../middlewares/authMiddleware');
const stockMovementController   = require('../controllers/stockMovementController');

// GET  /api/stock/movements
router.get('/',    authenticate, stockMovementController.getAllMovements);

// POST /api/stock/movements
router.post('/',   authenticate, stockMovementController.createMovement);

module.exports = router;
