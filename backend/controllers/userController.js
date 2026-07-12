const { validationResult } = require("express-validator");
const userService = require("../services/userService");

/**
 * GET /api/users
 */
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await userService.getAllUsers(page, limit);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json({ success: true, data: { user } });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/users
 */
const createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { name, email, password, roleId } = req.body;
        const user = await userService.createUser({ name, email, password, roleId });
        res.status(201).json({ success: true, message: "User created", data: { user } });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json({ success: true, message: "User updated", data: { user } });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id, req.user._id);
        res.status(200).json({ success: true, message: "User deleted" });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
