const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const { AppError } = require("../utils/errorHandler");

/**
 * POST /api/auth/login
 */
const loginUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;
        const { user, accessToken, refreshToken } = await authService.login(email, password);

        // Set refresh token as httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: { user, accessToken },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        const { accessToken, user } = await authService.refreshAccessToken(token);

        res.status(200).json({
            success: true,
            message: "Token refreshed",
            data: { accessToken, user },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/logout
 */
const logoutUser = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        await authService.logout(token);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user._id);
        res.status(200).json({ success: true, data: { user } });
    } catch (err) {
        next(err);
    }
};

module.exports = { loginUser, refreshToken, logoutUser, getMe };
