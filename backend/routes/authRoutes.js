const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
} = require("../controllers/authController");
const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    changePasswordValidator,
    enforcePasswordPolicy,
} = require("../validators/authValidator");
const authenticate = require("../middlewares/authenticate");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/register", authLimiter, registerValidator, enforcePasswordPolicy("password"), registerUser);

// POST /api/auth/login
router.post("/login", authLimiter, loginValidator, loginUser);

// POST /api/auth/refresh
router.post("/refresh", refreshToken);

// POST /api/auth/logout
router.post("/logout", logoutUser);

// GET /api/auth/me  (protected)
router.get("/me", authenticate, getMe);

// POST /api/auth/change-password (protected — allowed while mustChangePassword)
router.post(
    "/change-password",
    authenticate,
    changePasswordValidator,
    enforcePasswordPolicy("newPassword"),
    changePassword
);

// POST /api/auth/forgot-password
router.post("/forgot-password", authLimiter, forgotPasswordValidator, forgotPassword);

// POST /api/auth/reset-password/:token
router.post(
    "/reset-password/:token",
    authLimiter,
    resetPasswordValidator,
    enforcePasswordPolicy("password"),
    resetPassword
);

module.exports = router;
