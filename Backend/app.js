require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// Make io accessible to routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔥 Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// DNS fix for MongoDB
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ⚠️ CRITICAL: Middleware MUST come BEFORE routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check (before other routes)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "CampusEats Engagement API is running" });
});

// Import routes AFTER middleware setup
const reviewRoutes = require("./Routes/reviewRoutes");
const loyaltyRoutes = require("./Routes/loyaltyRoutes");
const notificationRoutes = require("./Routes/notificationRoutes");
const aiRoutes = require("./Routes/aiRoutes");
const userRoutes = require("./Routes/userRoutes");

app.use("/api/notifications", notificationRoutes);

// API Routes
app.use("/api/reviews", reviewRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/users", userRoutes);

app.use("/api/promotions", require("./Routes/promotionRoutes"));



app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/food-items', require('./Routes/inventory/foodItemsRoutes'));
app.use('/api/categories', require('./Routes/inventory/categoriesRoutes'));
app.use('/api/canteens', require('./Routes/inventory/canteensRoutes'));
app.use('/api/inventory', require('./Routes/inventory/inventoryRoutes'));
app.use('/api/alerts', require('./Routes/inventory/alertsRoutes'));
app.use('/api/analytics', require('./Routes/inventory/analyticsRoutes'));
app.use('/api/cart', require('./Routes/cartRoutes'));

app.use("/api/orders", require("./Routes/orderRoute"));
console.log("🔹 Registering payments routes...");
app.use("/api/payments", require("./Routes/paymentRoutes"));
console.log("✅ Payments routes registered successfully");

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error("❌ Server startup error:", err);
  }
  process.exit(1);
});

// Start HTTP/Socket server immediately so realtime features can connect.
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads accessible at: http://localhost:${PORT}/uploads`);
});

// MongoDB connection in background with explicit timeout to avoid indefinite startup hangs.
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message || err);
  });

// Error handling middleware (MUST be last)
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

module.exports = app;