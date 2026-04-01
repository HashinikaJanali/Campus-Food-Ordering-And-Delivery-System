const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');
const { protectUser, protectAdminOrUser, protect } = require('../middleware/auth');

router.get('/', protectAdminOrUser, orderController.getAllOrders);
router.get('/my', protectUser, orderController.getMyOrders);
router.get('/my/active', protectUser, orderController.getMyActiveOrders);
router.get('/my/track/:orderId', protectUser, orderController.trackMyOrder);
router.get('/history', protect, orderController.getOrderHistory);
router.get('/delivery/assigned', protectAdminOrUser, orderController.getAssignedDeliveryOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id/status', protectAdminOrUser, orderController.updateOrderStatus);
router.patch('/:id/fulfillment', protectAdminOrUser, orderController.updateFulfillmentDetails);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;