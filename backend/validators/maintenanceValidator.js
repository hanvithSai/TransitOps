const { body } = require('express-validator');

exports.createMaintenanceValidator = [
  body('vehicle')
    .notEmpty().withMessage('Vehicle ID is required')
    .isMongoId().withMessage('Invalid Vehicle ID format'),
  body('serviceType')
    .trim()
    .notEmpty().withMessage('Service type is required'),
  body('cost')
    .isFloat({ min: 0 }).withMessage('Cost must be a non-negative number')
    .toFloat(),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Active', 'Completed']).withMessage('Invalid status')
];

exports.updateMaintenanceValidator = [
  body('vehicle')
    .optional()
    .isMongoId().withMessage('Invalid Vehicle ID format'),
  body('serviceType')
    .optional()
    .trim()
    .notEmpty().withMessage('Service type cannot be empty'),
  body('cost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Cost must be a non-negative number')
    .toFloat(),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Active', 'Completed']).withMessage('Invalid status')
];
