const User = require("../models/User");
const Role = require("../models/Role");
const Driver = require("../models/Driver");
const RefreshToken = require("../models/RefreshToken");
const { AppError } = require("../utils/errorHandler");
const {
    validatePasswordStrength,
    CURRENT_POLICY_VERSION,
    isPolicyEnforcementEnabled,
} = require("../utils/passwordPolicy");

/**
 * Get all users (paginated)
 */
const getAllUsers = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        User.find()
            .select("-password")
            .populate("role", "name displayName permissions")
            .populate("driver", "name licenseNumber status")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(),
    ]);

    return { users, total, page, pages: Math.ceil(total / limit) };
};

/**
 * Create a new user
 */
const validateDriverLink = async (roleId, driverId, excludeUserId = null) => {
    if (!driverId) return null;
    const role = await Role.findById(roleId);
    if (!role || role.name !== "driver") {
        throw new AppError("Only driver-role users can be linked to a driver profile.", 400);
    }
    const driver = await Driver.findById(driverId);
    if (!driver) throw new AppError("Driver profile not found.", 404);
    const query = { driver: driverId };
    if (excludeUserId) query._id = { $ne: excludeUserId };
    const existing = await User.findOne(query);
    if (existing) throw new AppError("Driver profile is already linked to another user.", 409);
    return driverId;
};

const createUser = async ({ name, email, password, roleId, isActive = true, driverId = null }) => {
    const role = await Role.findById(roleId);
    if (!role) throw new AppError("Role not found.", 404);

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError("Email already in use.", 409);

    if (isPolicyEnforcementEnabled()) {
        const { valid, errors } = validatePasswordStrength(password);
        if (!valid) throw new AppError(errors.join(" "), 400);
    }

    const linkedDriver = await validateDriverLink(roleId, driverId);

    const user = await User.create({
        name,
        email,
        password,
        role: roleId,
        isActive: Boolean(isActive),
        driver: linkedDriver,
        mustChangePassword: false,
        passwordPolicyVersion: isPolicyEnforcementEnabled() ? CURRENT_POLICY_VERSION : 0,
    });
    return User.findById(user._id).select("-password").populate("role", "name displayName permissions").populate("driver", "name licenseNumber status");
};

/**
 * Update a user
 */
const updateUser = async (id, updates) => {
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found.", 404);

    if (updates.email && updates.email !== user.email) {
        const existing = await User.findOne({ email: updates.email });
        if (existing) throw new AppError("Email already in use.", 409);
        user.email = updates.email;
    }

    // If user is currently an admin, prevent removing the last admin
    if (user.role && ((updates.roleId && updates.roleId !== user.role.toString()) || updates.isActive === false)) {
        const adminRole = await Role.findOne({ name: "admin" });
        if (adminRole && user.role.toString() === adminRole._id.toString()) {
            const adminCount = await User.countDocuments({ role: adminRole._id, isActive: true });
            if (adminCount <= 1) {
                throw new AppError("Cannot modify the last active system admin.", 400);
            }
        }
    }

    if (updates.name) user.name = updates.name;
    if (updates.password) {
        if (isPolicyEnforcementEnabled()) {
            const { valid, errors } = validatePasswordStrength(updates.password);
            if (!valid) throw new AppError(errors.join(" "), 400);
        }
        user.password = updates.password;
        user.mustChangePassword = false;
        user.passwordPolicyVersion = CURRENT_POLICY_VERSION;
    }
    if (updates.roleId) {
        const role = await Role.findById(updates.roleId);
        if (!role) throw new AppError("Role not found.", 404);
        user.role = updates.roleId;
        if (role.name !== "driver") user.driver = null;
    }
    if (updates.driverId !== undefined) {
        user.driver = updates.driverId
            ? await validateDriverLink(updates.roleId || user.role, updates.driverId, id)
            : null;
    }
    if (typeof updates.isActive === "boolean") {
        user.isActive = updates.isActive;
        if (!updates.isActive) {
            await RefreshToken.updateMany({ user: id }, { isRevoked: true });
        }
    }

    await user.save();
    return User.findById(id).select("-password").populate("role", "name displayName permissions").populate("driver", "name licenseNumber status");
};

/**
 * Delete a user
 */
const deleteUser = async (id, requestingUserId) => {
    if (id === requestingUserId.toString()) {
        throw new AppError("You cannot delete your own account.", 400);
    }

    const user = await User.findById(id);
    if (!user) throw new AppError("User not found.", 404);

    const adminRole = await Role.findOne({ name: "admin" });
    if (adminRole && user.role.toString() === adminRole._id.toString()) {
        const adminCount = await User.countDocuments({ role: adminRole._id, isActive: true });
        if (adminCount <= 1) {
            throw new AppError("Cannot delete the last system admin.", 400);
        }
    }

    await RefreshToken.deleteMany({ user: id });
    await User.findByIdAndDelete(id);
    return user;
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
    const user = await User.findById(id).select("-password").populate("role", "name displayName permissions").populate("driver", "name licenseNumber status");
    if (!user) throw new AppError("User not found.", 404);
    return user;
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser, getUserById };
