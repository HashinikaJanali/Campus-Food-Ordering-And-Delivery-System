const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');
const { protectUser } = require('../middleware/auth');

router.get('/', protectUser, orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;