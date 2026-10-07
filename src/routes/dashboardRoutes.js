const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middlewares/authMiddleware");

// Allowed for authenticated users (Admin, HR get full analytics, employees get access as well)
router.get("/stats", auth, dashboardController.getDashboardStats);

module.exports = router;
