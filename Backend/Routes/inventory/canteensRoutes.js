const express = require('express');
const router = express.Router();
const canteenController = require('../../Controllers/inventory/canteenController');
const { protect } = require('../../middleware/auth');

router.get('/', canteenController.getCanteens);
router.get('/admin', protect, canteenController.getAdminCanteens);
router.post('/', protect, canteenController.createCanteen);
router.patch('/:id', protect, canteenController.updateCanteen);
router.delete('/:id', protect, canteenController.deleteCanteen);

module.exports = router;
