const maintenanceScheduleService = require('../services/maintenanceScheduleService');
const { AppError } = require('../utils/errorHandler');

exports.list = async (req, res, next) => {
    try {
        const data = await maintenanceScheduleService.getSchedules({
            page: req.query.page,
            limit: req.query.limit,
            vehicleId: req.query.vehicleId,
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const schedule = await maintenanceScheduleService.createSchedule(req.body);
        res.status(201).json({ success: true, data: { schedule } });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const schedule = await maintenanceScheduleService.updateSchedule(req.params.id, req.body);
        res.status(200).json({ success: true, data: { schedule } });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await maintenanceScheduleService.deleteSchedule(req.params.id);
        res.status(200).json({ success: true, message: 'Schedule deleted.' });
    } catch (error) {
        next(error);
    }
};
