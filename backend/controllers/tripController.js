const tripService = require('../services/tripService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

exports.getAllTrips = async (req, res, next) => {
    try {
        const { page, limit, status, search } = req.query;
        const result = await tripService.getAllTrips({ page, limit, status, search });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.getTripById = async (req, res, next) => {
    try {
        const trip = await tripService.getTripById(req.params.id);
        res.status(200).json({ success: true, data: { trip } });
    } catch (error) {
        next(error);
    }
};

exports.createTrip = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map((err) => err.msg);
            throw new AppError(messages.join(', '), 400);
        }

        const trip = await tripService.createTrip(req.body, req.user._id);
        res.status(201).json({ success: true, data: { trip } });
    } catch (error) {
        next(error);
    }
};

exports.dispatchTrip = async (req, res, next) => {
    try {
        const trip = await tripService.dispatchTrip(req.params.id);
        res.status(200).json({ success: true, data: { trip }, message: 'Trip dispatched successfully' });
    } catch (error) {
        next(error);
    }
};

exports.completeTrip = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map((err) => err.msg);
            throw new AppError(messages.join(', '), 400);
        }

        const trip = await tripService.completeTrip(req.params.id, req.body);
        res.status(200).json({ success: true, data: { trip }, message: 'Trip completed successfully' });
    } catch (error) {
        next(error);
    }
};

exports.cancelTrip = async (req, res, next) => {
    try {
        const trip = await tripService.cancelTrip(req.params.id);
        res.status(200).json({ success: true, data: { trip }, message: 'Trip cancelled successfully' });
    } catch (error) {
        next(error);
    }
};
