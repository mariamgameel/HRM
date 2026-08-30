const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const validate = require("../middlewares/validateMiddleware");
const { loginLimiter } = require("../middlewares/securityMiddleware");

const authenticateToken = require("../middlewares/authMiddleware");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", loginLimiter, validate(loginSchema), loginUser);
router.get("/me", authenticateToken, getMe);

module.exports = router;