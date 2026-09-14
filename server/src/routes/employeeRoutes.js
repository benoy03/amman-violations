const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

// ⚠️ الترتيب مهم جداً: المسارات المحددة (all-stats, bulk, check) يجب أن تأتي قبل المسارات العامة

// جلب جميع الموظفين مع إحصائيات المخالفات لكل موظف (لشاشة إدارة الموظفين للمدير)
router.get('/:role/all-stats', authenticateToken, requireAdmin, employeeController.getAllEmployeesWithStats);

// فحص المخالفات المرتبطة بموظف قبل الحذف
router.get('/:role/check/:number', authenticateToken, requireAdmin, employeeController.checkEmployeeViolations);

// إضافة أو تحديث موظفين دفعة واحدة (Bulk Import للمدير فقط)
router.post('/:role/bulk', authenticateToken, requireAdmin, employeeController.bulkCreateEmployees);

// جلب الموظفين النشطين لدور معين (للقوائم المنسدلة في الإدخال)
router.get('/:role', authenticateToken, employeeController.getEmployees);

// إضافة موظف جديد (للمدير فقط)
router.post('/:role', authenticateToken, requireAdmin, employeeController.createEmployee);

// تعديل بيانات موظف (للمدير فقط)
router.put('/:role/:number', authenticateToken, requireAdmin, employeeController.updateEmployee);

// حذف موظف (Soft Delete للمدير فقط)
router.delete('/:role/:number', authenticateToken, requireAdmin, employeeController.deleteEmployee);

module.exports = router;
