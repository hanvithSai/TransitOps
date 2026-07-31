const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const Role = require("../models/Role");
const { AppError } = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const {
    validatePasswordStrength,
    userRequiresPasswordChange,
    CURRENT_POLICY_VERSION,
    isPolicyEnforcementEnabled,
} = require("../utils/passwordPolicy");

/**
 * Generate access token (1 day). Includes passwordUpdatedAt so tokens invalidate after reset.
 */
const generateAccessToken = (user) => {
    const userId = user._id || user.id;
    const pwdAt = user.passwordUpdatedAt
        ? new Date(user.passwordUpdatedAt).getTime()
        : Date.now();

    return jwt.sign({ id: userId, pwdAt }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

const MAX_REFRESH_TOKENS = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

/**
 * Generate refresh token (7 days) and persist to DB
 */
const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const activeCount = await RefreshToken.countDocuments({
        user: userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
    });

    if (activeCount >= MAX_REFRESH_TOKENS) {
        const oldest = await RefreshToken.findOne({
            user: userId,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: 1 });

        if (oldest) {
            oldest.isRevoked = true;
            await oldest.save();
        }
    }

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

    if (user.lockUntil && user.lockUntil > new Date()) {
        const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
        throw new AppError(`Account locked. Try again in ${mins} minute(s).`, 429);
    }

    if (!user.isActive) {
        throw new AppError("Your account is pending admin approval or has been deactivated.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + LOCKOUT_MS);
            user.failedLoginAttempts = 0;
        }
        await user.save({ validateBeforeSave: false });
        throw new AppError("Invalid email or password.", 401);
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    let requiresPasswordChange = false;
    if (isPolicyEnforcementEnabled()) {
        requiresPasswordChange = userRequiresPasswordChange(user, password);
        user.mustChangePassword = requiresPasswordChange;
        if (!requiresPasswordChange) {
            user.passwordPolicyVersion = CURRENT_POLICY_VERSION;
        }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user._id);

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return { user: userObj, accessToken, refreshToken, requiresPasswordChange };
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

    if (dbRoleName === "admin") {
        throw new AppError("Admin accounts cannot be created via self-registration.", 403);
    }

    const role = await Role.findOne({ name: dbRoleName });
    if (!role) {
        throw new AppError("Invalid role selected.", 400);
    }

    if (isPolicyEnforcementEnabled()) {
        const { valid, errors } = validatePasswordStrength(password);
        if (!valid) throw new AppError(errors.join(" "), 400);
    }

    // Create user as inactive
    const user = await User.create({
        name,
        email,
        password,
        role: role._id,
        isActive: false,
        mustChangePassword: false,
        passwordPolicyVersion: isPolicyEnforcementEnabled() ? CURRENT_POLICY_VERSION : 0,
    });

    const populatedUser = await User.findById(user._id)
        .select("-password")
        .populate("role", "name displayName permissions");

    return { user: populatedUser };
};

/**
 * Refresh: validate refresh token, rotate refresh token, issue new access token
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

    storedToken.isRevoked = true;
    await storedToken.save();

    const newRefreshToken = await generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user);

    return { accessToken, refreshToken: newRefreshToken, user };
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
        // Always respond success to prevent email enumeration
        return { sent: false };
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
        const emailResult = await sendEmail({
            email: user.email,
            subject: "Password Reset Request - TransitOps",
            html: message,
        });
        return { ...emailResult, sent: true };
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

    if (isPolicyEnforcementEnabled()) {
        const { valid, errors } = validatePasswordStrength(newPassword);
        if (!valid) throw new AppError(errors.join(" "), 400);
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.mustChangePassword = false;
    user.passwordPolicyVersion = CURRENT_POLICY_VERSION;
    await user.save();

    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });
};

/**
 * Change password (authenticated user — compliance upgrade flow)
 */
const changePassword = async (userId, currentPassword, newPassword, currentRefreshToken) => {
    const user = await User.findById(userId)
        .select("+password")
        .populate("role", "name displayName permissions");

    if (!user) throw new AppError("User not found.", 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError("Current password is incorrect.", 401);

    if (isPolicyEnforcementEnabled()) {
        const { valid, errors } = validatePasswordStrength(newPassword);
        if (!valid) throw new AppError(errors.join(" "), 400);
    }

    if (await user.comparePassword(newPassword)) {
        throw new AppError("New password must be different from your current password.", 400);
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.passwordPolicyVersion = CURRENT_POLICY_VERSION;
    await user.save();

    // Revoke other sessions; keep current refresh token
    if (currentRefreshToken) {
        await RefreshToken.updateMany(
            { user: userId, token: { $ne: currentRefreshToken }, isRevoked: false },
            { isRevoked: true }
        );
    } else {
        await RefreshToken.updateMany({ user: userId, isRevoked: false }, { isRevoked: true });
    }

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
};

module.exports = {
    login,
    refreshAccessToken,
    logout,
    getUserById,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
};
