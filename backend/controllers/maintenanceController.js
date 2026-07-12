const maintenanceService = require('../services/maintenanceService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

exports.getAllLogs = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await maintenanceService.getAllLogs({ page, limit, search, status });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getLogById = async (req, res, next) => {
  try {
    const log = await maintenanceService.getLogById(req.params.id);
    res.status(200).json({
      success: true,
      data: { log }
    });
  } catch (error) {
    next(error);
  }
};

exports.createLog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join(', ');
      throw new AppError(messages, 400);
    }

    const log = await maintenanceService.createLog(req.body);
    res.status(201).json({
      success: true,
      message: 'Maintenance log created successfully',
      data: { log }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLog = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors.array().map(err => err.msg).join(', ');
      throw new AppError(messages, 400);
    }

    const log = await maintenanceService.updateLog(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Maintenance log updated successfully',
      data: { log }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteLog = async (req, res, next) => {
  try {
    await maintenanceService.deleteLog(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Maintenance log deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
