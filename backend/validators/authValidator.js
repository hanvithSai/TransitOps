const { body } = require("express-validator");

const loginValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false }),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const registerValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
        .trim(),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false }),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("roleName")
        .notEmpty().withMessage("Role is required")
        .isString().withMessage("Invalid role format"),
];

const createUserValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
        .trim(),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false }),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("roleId")
        .notEmpty().withMessage("Role is required")
        .isMongoId().withMessage("Invalid role ID"),
];

const updateUserValidator = [
    body("name")
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
        .trim(),
    body("email")
        .optional()
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false }),
    body("password")
        .optional()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("roleId")
        .optional()
        .isMongoId().withMessage("Invalid role ID"),
    body("isActive")
        .optional()
        .isBoolean().withMessage("isActive must be a boolean"),
];

const forgotPasswordValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please provide a valid email")
        .normalizeEmail({ gmail_remove_dots: false }),
];

const resetPasswordValidator = [
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

module.exports = { loginValidator, registerValidator, createUserValidator, updateUserValidator, forgotPasswordValidator, resetPasswordValidator };
