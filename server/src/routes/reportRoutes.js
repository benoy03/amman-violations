const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/statistics', authenticateToken, reportController.getStatistics);

module.exports = router;
