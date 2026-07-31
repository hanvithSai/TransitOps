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
        const { user, accessToken, refreshToken, requiresPasswordChange } = await authService.login(email, password);

        // Set refresh token as httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            success: true,
            message: requiresPasswordChange
                ? "Login successful. Please update your password to continue."
                : "Login successful",
            data: { user, accessToken, requiresPasswordChange: !!requiresPasswordChange },
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
        const { accessToken, refreshToken, user } = await authService.refreshAccessToken(token);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

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
        email = email.trim();
        const originUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";

        const emailResult = await authService.forgotPassword(email, originUrl);

        const response = {
            success: true,
            message: emailResult.isDevFallback
                ? "Development mode: use the preview link below to open the reset email."
                : "If an account exists for that email, reset instructions have been sent.",
        };

        if (emailResult.isDevFallback && emailResult.previewUrl) {
            response.data = { previewUrl: emailResult.previewUrl };
        }

        res.status(200).json(response);
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

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { currentPassword, newPassword } = req.body;
        const currentRefreshToken = req.cookies?.refreshToken;

        const user = await authService.changePassword(
            req.user._id,
            currentPassword,
            newPassword,
            currentRefreshToken
        );

        res.status(200).json({
            success: true,
            message: "Password updated successfully.",
            data: { user },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
};
