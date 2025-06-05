// backend/routes/unitRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
} = require('../controllers/unitController');

// (Opcional) se quiser proteger rotas, importe o middleware `authenticate` e faça algo como:
// const { authenticate, authorizeAdmin } = require('../controllers/authController');
// router.use(authenticate);

router.get('/', getAllUnits);
router.get('/:id', getUnitById);
router.post('/', createUnit);       // create
router.put('/:id', updateUnit);     // update
router.delete('/:id', deleteUnit);  // delete

module.exports = router;
