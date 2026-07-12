const driverService = require('../services/driverService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

exports.getAllDrivers = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await driverService.getAllDrivers(page, limit, search, status);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    res.status(200).json({
      success: true,
      data: { driver }
    });
  } catch (error) {
    next(error);
  }
};

exports.createDriver = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join(', ');
      throw new AppError(messages, 400);
    }

    const driver = await driverService.createDriver(req.body);
    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: { driver }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join(', ');
      throw new AppError(messages, 400);
    }

    const driver = await driverService.updateDriver(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: { driver }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    await driverService.deleteDriver(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
