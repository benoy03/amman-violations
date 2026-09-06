const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, locationController.getLocations);
router.post('/', authenticateToken, requireAdmin, locationController.createLocation);
router.post('/bulk', authenticateToken, requireAdmin, locationController.bulkCreateLocations);
router.delete('/:id', authenticateToken, requireAdmin, locationController.deleteLocation);

module.exports = router;
