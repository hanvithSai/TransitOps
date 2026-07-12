const { body } = require('express-validator');

exports.createTripValidator = [
    body('source')
        .trim()
        .notEmpty()
        .withMessage('Source location is required'),
    body('destination')
        .trim()
        .notEmpty()
        .withMessage('Destination location is required'),
    body('vehicle')
        .isMongoId()
        .withMessage('Valid vehicle ID is required'),
    body('driver')
        .isMongoId()
        .withMessage('Valid driver ID is required'),
    body('cargoWeight')
        .isFloat({ min: 0 })
        .withMessage('Cargo weight must be a non-negative number'),
    body('plannedDistance')
        .isFloat({ min: 0 })
        .withMessage('Planned distance must be a non-negative number'),
    body('revenue')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Revenue must be a non-negative number'),
    body('notes')
        .optional()
        .isString()
        .trim(),
];

exports.completeTripValidator = [
    body('actualDistance')
        .isFloat({ min: 0 })
        .withMessage('Actual distance must be a non-negative number'),
    body('fuelUsed')
        .isFloat({ min: 0 })
        .withMessage('Fuel used must be a non-negative number'),
];
