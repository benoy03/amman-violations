const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, requireAdmin, auditController.getAuditLogs);

module.exports = router;
