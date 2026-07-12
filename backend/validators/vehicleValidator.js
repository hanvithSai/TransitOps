const { body } = require('express-validator');

exports.createVehicleValidator = [
  body('registrationNumber')
    .trim()
    .notEmpty().withMessage('Registration number is required')
    .toUpperCase(),
  body('vehicleName')
    .trim()
    .notEmpty().withMessage('Vehicle name is required'),
  body('model')
    .trim()
    .notEmpty().withMessage('Model is required'),
  body('type')
    .trim()
    .notEmpty().withMessage('Type is required'),
  body('capacity')
    .isFloat({ min: 0.1 }).withMessage('Capacity must be a number greater than 0')
    .toFloat(),
  body('odometer')
    .isFloat({ min: 0 }).withMessage('Odometer must be a non-negative number')
    .toFloat(),
  body('acquisitionCost')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Acquisition cost must be a non-negative number')
    .toFloat(),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'In Shop', 'Retired']).withMessage('Invalid status')
];

exports.updateVehicleValidator = [
  body('registrationNumber')
    .optional()
    .trim()
    .notEmpty().withMessage('Registration number cannot be empty')
    .toUpperCase(),
  body('vehicleName')
    .optional()
    .trim()
    .notEmpty().withMessage('Vehicle name cannot be empty'),
  body('model')
    .optional()
    .trim()
    .notEmpty().withMessage('Model cannot be empty'),
  body('type')
    .optional()
    .trim()
    .notEmpty().withMessage('Type cannot be empty'),
  body('capacity')
    .optional()
    .isFloat({ min: 0.1 }).withMessage('Capacity must be a number greater than 0')
    .toFloat(),
  body('odometer')
    .optional()
    .isFloat({ min: 0 }).withMessage('Odometer must be a non-negative number')
    .toFloat(),
  body('acquisitionCost')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Acquisition cost must be a non-negative number')
    .toFloat(),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'In Shop', 'Retired']).withMessage('Invalid status')
];
