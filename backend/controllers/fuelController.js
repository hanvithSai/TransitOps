const fuelService = require('../services/fuelService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

exports.getAllFuelLogs = async (req, res, next) => {
    try {
        const { page, limit, vehicleId, tripId } = req.query;
        const result = await fuelService.getAllFuelLogs({ page, limit, vehicleId, tripId });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.getFuelLogById = async (req, res, next) => {
    try {
        const log = await fuelService.getFuelLogById(req.params.id);
        res.status(200).json({ success: true, data: { log } });
    } catch (error) {
        next(error);
    }
};

exports.createFuelLog = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map((err) => err.msg);
            throw new AppError(messages.join(', '), 400);
        }

        const log = await fuelService.createFuelLog(req.body, req.user._id);
        res.status(201).json({ success: true, data: { log }, message: 'Fuel log created successfully' });
    } catch (error) {
        next(error);
    }
};

exports.updateFuelLog = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map((err) => err.msg);
            throw new AppError(messages.join(', '), 400);
        }

        const log = await fuelService.updateFuelLog(req.params.id, req.body);
        res.status(200).json({ success: true, data: { log }, message: 'Fuel log updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteFuelLog = async (req, res, next) => {
    try {
        await fuelService.deleteFuelLog(req.params.id);
        res.status(200).json({ success: true, message: 'Fuel log deleted successfully' });
    } catch (error) {
        next(error);
    }
};
