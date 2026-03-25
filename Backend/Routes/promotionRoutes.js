const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
} = require('../Controllers/promotionController');

router.route('/')
  .get(getPromotions)
  .post(upload.single('image'), createPromotion);

router.route('/:id')
  .put(upload.single('image'), updatePromotion)
  .delete(deletePromotion);

module.exports = router;
