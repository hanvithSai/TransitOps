const notificationService = require('../services/notificationService');
const { AppError } = require('../utils/errorHandler');

exports.getNotifications = async (req, res, next) => {
    try {
        const { page, limit, unreadOnly } = req.query;
        const result = await notificationService.getUserNotifications(req.user._id, {
            page: Number(page) || 1,
            limit: Number(limit) || 20,
            unreadOnly: unreadOnly === 'true',
        });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(new AppError('Failed to fetch notifications', 500));
    }
};

exports.markRead = async (req, res, next) => {
    try {
        const notification = await notificationService.markRead(req.params.id, req.user._id);
        if (!notification) return next(new AppError('Notification not found', 404));
        res.status(200).json({ success: true, data: { notification } });
    } catch (error) {
        next(error);
    }
};

exports.markAllRead = async (req, res, next) => {
    try {
        const count = await notificationService.markAllRead(req.user._id);
        res.status(200).json({ success: true, data: { marked: count } });
    } catch (error) {
        next(new AppError('Failed to mark notifications read', 500));
    }
};
