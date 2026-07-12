const express = require("express");
const router = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser, getMe } = require("../controllers/authController");
const { registerValidator, loginValidator } = require("../validators/authValidator");
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

module.exports = router;
