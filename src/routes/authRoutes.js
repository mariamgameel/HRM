const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const { getMe } = require("../controllers/authController");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/securityMiddleware");
const validate = require("../middlewares/validateMiddleware");
const { registerSchema, loginSchema } = require("../validators/authValidator");

router.post("/register", validate(registerSchema), authController.registerUser);
router.post("/login", loginLimiter, validate(loginSchema), authController.loginUser);
router.get("/me", authenticateToken, getMe);

module.exports = router;