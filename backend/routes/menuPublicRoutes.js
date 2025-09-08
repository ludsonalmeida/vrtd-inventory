// backend/routes/menuPublicRoutes.js
const express = require('express');
const controller = require('../controllers/menuItemController');

const router = express.Router();

// GET /api/menu  (?unitName=Sobradinho, Distrito Federal)  ou (?unitId=<ObjectId>)
router.get('/', controller.publicMenu);

module.exports = router;
