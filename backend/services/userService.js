const User = require("../models/User");
const Role = require("../models/Role");
const { AppError } = require("../utils/errorHandler");

/**
 * Get all users (paginated)
 */
const getAllUsers = async (page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        User.find()
            .select("-password")
            .populate("role", "name displayName")
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
const createUser = async ({ name, email, password, roleId }) => {
    const role = await Role.findById(roleId);
    if (!role) throw new AppError("Role not found.", 404);

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError("Email already in use.", 409);

    const user = await User.create({ name, email, password, role: roleId });
    return User.findById(user._id).select("-password").populate("role", "name displayName");
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

    if (updates.name) user.name = updates.name;
    if (updates.password) user.password = updates.password; // pre-save hook will hash
    if (updates.roleId) {
        const role = await Role.findById(updates.roleId);
        if (!role) throw new AppError("Role not found.", 404);
        user.role = updates.roleId;
    }
    if (typeof updates.isActive === "boolean") user.isActive = updates.isActive;

    await user.save();
    return User.findById(id).select("-password").populate("role", "name displayName");
};

/**
 * Delete a user
 */
const deleteUser = async (id, requestingUserId) => {
    if (id === requestingUserId.toString()) {
        throw new AppError("You cannot delete your own account.", 400);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError("User not found.", 404);
    return user;
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
    const user = await User.findById(id).select("-password").populate("role", "name displayName permissions");
    if (!user) throw new AppError("User not found.", 404);
    return user;
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser, getUserById };
