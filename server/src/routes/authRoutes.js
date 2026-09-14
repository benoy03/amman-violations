const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

// مسارات إدارة المستخدمين وصلاحيات المرور (للمدير فقط)
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.post('/users', authenticateToken, requireAdmin, authController.createUser);
router.put('/users/:id/password', authenticateToken, requireAdmin, authController.adminResetPassword);
router.put('/users/:id', authenticateToken, requireAdmin, authController.adminUpdateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, authController.deleteUser);

module.exports = router;
