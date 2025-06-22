// =================================
// backend/routes/reservationRoutes.js
// =================================
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservationController');

router.get('/', ctrl.getAllReservations);
router.get('/:id', ctrl.getReservationById);
router.post('/', ctrl.createReservation);
router.put('/:id', ctrl.updateReservation);
router.delete('/:id', ctrl.deleteReservation);

module.exports = router;