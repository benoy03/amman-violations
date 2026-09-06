const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// جلب الموظفين النشطين لدور معين (للقوائم المنسدلة في الإدخال)
router.get('/:role', authenticateToken, employeeController.getEmployees);

// جلب جميع الموظفين مع إحصائيات المخالفات لكل موظف (لصفحة إدارة الموظفين للمدير)
router.get('/:role/all-stats', authenticateToken, requireAdmin, employeeController.getAllEmployeesWithStats);

// فحص المخالفات المرتبطة بموظف قبل الحذف
router.get('/:role/check/:number', authenticateToken, requireAdmin, employeeController.checkEmployeeViolations);

// إضافة موظف جديد (للمدير فقط)
router.post('/:role', authenticateToken, requireAdmin, employeeController.createEmployee);

// إضافة أو تحديث موظفين دفعة واحدة (Bulk Import للمدير فقط)
router.post('/:role/bulk', authenticateToken, requireAdmin, employeeController.bulkCreateEmployees);

// حذف موظف (Soft Delete للمدير فقط)
router.delete('/:role/:number', authenticateToken, requireAdmin, employeeController.deleteEmployee);

module.exports = router;
