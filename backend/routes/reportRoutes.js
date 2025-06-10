// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// GET /api/reports/daily-chopes
router.get('/daily-chopes', reportController.getDailyChopes);

module.exports = router;
