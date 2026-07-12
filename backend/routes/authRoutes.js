const express = require("express");
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require("../validators/authValidator");
const authenticate = require("../middlewares/authenticate");

// POST /api/auth/register
router.post("/register", registerValidator, registerUser);

// POST /api/auth/login
router.post("/login", loginValidator, loginUser);

// POST /api/auth/refresh
router.post("/refresh", refreshToken);

// POST /api/auth/logout
router.post("/logout", logoutUser);

// GET /api/auth/me  (protected)
router.get("/me", authenticate, getMe);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", resetPasswordValidator, resetPassword);

module.exports = router;
