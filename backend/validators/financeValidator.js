const { body } = require('express-validator');

// ── Fuel Validators ─────────────────────────────────────────────────────────

exports.createFuelValidator = [
    body('vehicle')
        .isMongoId()
        .withMessage('Valid vehicle ID is required'),
    body('trip')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage('Valid trip ID is required'),
    body('liters')
        .isFloat({ min: 0.1 })
        .withMessage('Liters must be a number greater than 0'),
    body('cost')
        .isFloat({ min: 0.1 })
        .withMessage('Cost must be a number greater than 0'),
    body('odometer')
        .isFloat({ min: 0 })
        .withMessage('Odometer reading must be a non-negative number'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
];

exports.updateFuelValidator = [
    body('vehicle')
        .optional()
        .isMongoId()
        .withMessage('Valid vehicle ID is required'),
    body('trip')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage('Valid trip ID is required'),
    body('liters')
        .optional()
        .isFloat({ min: 0.1 })
        .withMessage('Liters must be a number greater than 0'),
    body('cost')
        .optional()
        .isFloat({ min: 0.1 })
        .withMessage('Cost must be a number greater than 0'),
    body('odometer')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Odometer reading must be a non-negative number'),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
];

// ── Expense Validators ──────────────────────────────────────────────────────

const expenseCategories = ['Toll', 'Repair', 'Parking', 'Insurance', 'Miscellaneous'];

exports.createExpenseValidator = [
    body('vehicle')
        .isMongoId()
        .withMessage('Valid vehicle ID is required'),
    body('trip')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage('Valid trip ID is required'),
    body('amount')
        .isFloat({ min: 0.1 })
        .withMessage('Amount must be a number greater than 0'),
    body('category')
        .isIn(expenseCategories)
        .withMessage(`Category must be one of: ${expenseCategories.join(', ')}`),
    body('notes')
        .optional()
        .isString()
        .trim(),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
];

exports.updateExpenseValidator = [
    body('vehicle')
        .optional()
        .isMongoId()
        .withMessage('Valid vehicle ID is required'),
    body('trip')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage('Valid trip ID is required'),
    body('amount')
        .optional()
        .isFloat({ min: 0.1 })
        .withMessage('Amount must be a number greater than 0'),
    body('category')
        .optional()
        .isIn(expenseCategories)
        .withMessage(`Category must be one of: ${expenseCategories.join(', ')}`),
    body('notes')
        .optional()
        .isString()
        .trim(),
    body('date')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
];
