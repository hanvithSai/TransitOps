const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const { AppError } = require("../utils/errorHandler");

/**
 * POST /api/auth/register
 */
const registerUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        let { name, email, password, roleName } = req.body;
        email = email.trim();
        const { user } = await authService.register(name, email, password, roleName);

        res.status(201).json({
            success: true,
            message: "Account created successfully. Pending admin approval.",
            data: { user },
        });
    } catch (err) {
        next(err);
    }
};

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

        let { email, password } = req.body;
        email = email.trim();
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

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        let { email } = req.body;
        console.log("RECEIVED EMAIL:", JSON.stringify(email));
        email = email.trim();
        console.log("TRIMMED EMAIL:", JSON.stringify(email));
        // Determine frontend origin for the reset link
        // Use the origin header if it exists, otherwise use a default (from env or hardcoded fallback)
        const originUrl = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";

        await authService.forgotPassword(email, originUrl);

        res.status(200).json({
            success: true,
            message: "Email sent with password reset instructions",
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/reset-password/:token
 */
const resetPassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { token } = req.params;
        const { password } = req.body;

        await authService.resetPassword(token, password);

        res.status(200).json({
            success: true,
            message: "Password updated successfully. You may now log in.",
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { registerUser, loginUser, refreshToken, logoutUser, getMe, forgotPassword, resetPassword };
