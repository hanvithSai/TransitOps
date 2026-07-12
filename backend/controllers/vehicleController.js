const vehicleService = require('../services/vehicleService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

exports.getAllVehicles = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await vehicleService.getAllVehicles(page, limit, search, status);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json({
      success: true,
      data: { vehicle }
    });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join(', ');
      throw new AppError(messages, 400);
    }

    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: { vehicle }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join(', ');
      throw new AppError(messages, 400);
    }

    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicle }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
