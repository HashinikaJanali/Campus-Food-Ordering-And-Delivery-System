const Promotion = require('../Models/Promotion');

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Public
const getPromotions = async (req, res) => {
  try {
    // Only return active promotions unless specifically requested otherwise
    const filter = req.query.all === 'true' ? {} : { active: true };
    const promotions = await Promotion.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new promotion
// @route   POST /api/promotions
// @access  Private (Admin only conceptually, ignoring exact auth middleware for this demo if not strictly applied)
const createPromotion = async (req, res) => {
  try {
    // If setting to featured, optionally unset other featured
    if (req.body.featured === 'true' || req.body.featured === true) {
       await Promotion.updateMany({}, { featured: false });
    }

    // Handle file upload
    if (req.file) {
      req.body.image = `/uploads/food-images/${req.file.filename}`;
    }

    const promotion = await Promotion.create(req.body);

    res.status(201).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create promotion',
      error: error.message
    });
  }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private
const updatePromotion = async (req, res) => {
  try {
    let promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    if (req.body.featured === 'true' || req.body.featured === true) {
       await Promotion.updateMany({ _id: { $ne: req.params.id } }, { featured: false });
    }

    // Handle file upload
    if (req.file) {
      req.body.image = `/uploads/food-images/${req.file.filename}`;
    }

    promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update promotion',
      error: error.message
    });
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private
const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    await promotion.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete promotion',
      error: error.message
    });
  }
};

module.exports = {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
};
