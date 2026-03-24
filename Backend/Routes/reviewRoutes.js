const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Configuration for Reviews
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "review-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Import controller
const reviewController = require("../Controllers/reviewController");

// Routes
router.post("/", upload.single("image"), reviewController.createReview);
router.get("/", reviewController.getReviews);
router.get("/summary", reviewController.getRatingSummary);
router.get("/user/:userId", reviewController.getUserReviews);
router.get("/:id", reviewController.getReviewById);
router.put("/:id", upload.single("image"), reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
router.patch("/:id/helpful", reviewController.markHelpful);

module.exports = router;