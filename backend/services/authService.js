const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const Role = require("../models/Role");
const { AppError } = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");

/**
 * Generate access token (1 day)
 */
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

/**
 * Generate refresh token (7 days) and persist to DB
 */
const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({ token, user: userId, expiresAt });
    return token;
};

/**
 * Login: validate credentials, return tokens
 */
const login = async (email, password) => {
    // Include password field (excluded by default via select: false)
    const user = await User.findOne({ email })
        .select("+password")
        .populate("role", "name displayName permissions");

    if (!user) {
        throw new AppError("Invalid email or password.", 401);
    }

    if (!user.isActive) {
        throw new AppError("Your account is pending admin approval or has been deactivated.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError("Invalid email or password.", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken, refreshToken };
};

/**
 * Register: self-register a new user pending approval
 */
const register = async (name, email, password, roleName) => {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("Email is already in use.", 400);
    }

    // Map UI role names to DB role names if needed
    const roleMap = {
        "Fleet Manager": "fleet_manager",
        "Driver": "driver",
        "Safety Officer": "safety_officer",
        "Financial Analyst": "financial_analyst"
    };
    const dbRoleName = roleMap[roleName] || roleName;

    const role = await Role.findOne({ name: dbRoleName });
    if (!role) {
        throw new AppError("Invalid role selected.", 400);
    }

    // Create user as inactive
    const user = await User.create({
        name,
        email,
        password,
        role: role._id,
        isActive: false
    });

    return { user };
};

/**
 * Refresh: validate refresh token, issue new access token
 */
const refreshAccessToken = async (token) => {
    if (!token) throw new AppError("Refresh token required.", 401);

    const storedToken = await RefreshToken.findOne({
        token,
        isRevoked: false,
    }).populate({
        path: "user",
        populate: { path: "role", select: "name displayName permissions" },
    });

    if (!storedToken) throw new AppError("Invalid or expired refresh token.", 401);

    if (storedToken.expiresAt < new Date()) {
        await RefreshToken.deleteOne({ _id: storedToken._id });
        throw new AppError("Refresh token expired. Please log in again.", 401);
    }

    const user = storedToken.user;
    if (!user || !user.isActive) {
        throw new AppError("User account is inactive.", 401);
    }

    const accessToken = generateAccessToken(user._id);
    return { accessToken, user };
};

/**
 * Logout: revoke refresh token
 */
const logout = async (token) => {
    if (token) {
        await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
    }
};

/**
 * Get current user by ID
 */
const getUserById = async (id) => {
    const user = await User.findById(id)
        .select("-password")
        .populate("role", "name displayName permissions");

    if (!user) throw new AppError("User not found.", 404);
    return user;
};

/**
 * Forgot Password
 */
const forgotPassword = async (email, origin) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("There is no user with that email address.", 404);
    }

    // Get reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${origin}/reset-password/${resetToken}`;

    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password:</p>
        <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request - TransitOps",
            html: message,
        });
    } catch (err) {
        console.error("Email sending failed:", err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        throw new AppError("Email could not be sent: " + err.message, 500);
    }
};

/**
 * Reset Password
 */
const resetPassword = async (resetToken, newPassword) => {
    // Hash token to compare with DB
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new AppError("Invalid or expired token", 400);
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
};

module.exports = { login, refreshAccessToken, logout, getUserById, register, forgotPassword, resetPassword };
