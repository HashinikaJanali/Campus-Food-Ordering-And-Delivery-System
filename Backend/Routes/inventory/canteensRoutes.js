const express = require('express');
const router = express.Router();
const canteenController = require('../../Controllers/inventory/canteenController');
const authMiddleware = require('../../middleware/auth');

router.get('/', canteenController.getCanteens);
router.get('/admin', authMiddleware, canteenController.getAdminCanteens);
router.post('/', authMiddleware, canteenController.createCanteen);
router.patch('/:id', authMiddleware, canteenController.updateCanteen);
router.delete('/:id', authMiddleware, canteenController.deleteCanteen);

module.exports = router;
