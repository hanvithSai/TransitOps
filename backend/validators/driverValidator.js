const { body } = require('express-validator');

exports.createDriverValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Driver name is required'),
  body('licenseNumber')
    .trim()
    .notEmpty().withMessage('License number is required')
    .toUpperCase(),
  body('licenseCategory')
    .trim()
    .notEmpty().withMessage('License category is required'),
  body('expiryDate')
    .notEmpty().withMessage('License expiry date is required')
    .isISO8601().withMessage('Expiry date must be a valid date'),
  body('contact')
    .trim()
    .notEmpty().withMessage('Contact number is required'),
  body('safetyScore')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 }).withMessage('Safety score must be between 0 and 100')
    .toInt(),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'Off Duty', 'Suspended']).withMessage('Invalid status')
];

exports.updateDriverValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Driver name cannot be empty'),
  body('licenseNumber')
    .optional()
    .trim()
    .notEmpty().withMessage('License number cannot be empty')
    .toUpperCase(),
  body('licenseCategory')
    .optional()
    .trim()
    .notEmpty().withMessage('License category cannot be empty'),
  body('expiryDate')
    .optional()
    .isISO8601().withMessage('Expiry date must be a valid date'),
  body('contact')
    .optional()
    .trim()
    .notEmpty().withMessage('Contact number cannot be empty'),
  body('safetyScore')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 }).withMessage('Safety score must be between 0 and 100')
    .toInt(),
  body('status')
    .optional()
    .isIn(['Available', 'On Trip', 'Off Duty', 'Suspended']).withMessage('Invalid status')
];
