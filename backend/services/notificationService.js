const Notification = require('../models/Notification');

exports.createNotification = async ({ userId, type = 'system', title, message, metadata = {} }) => {
    return Notification.create({ user: userId, type, title, message, metadata });
};

exports.createNotificationsForUsers = async (userIds, payload) => {
    if (!userIds.length) return [];
    const docs = userIds.map((userId) => ({ user: userId, ...payload }));
    return Notification.insertMany(docs);
};

exports.getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
    const query = { user: userId };
    if (unreadOnly) query.read = false;

    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Notification.countDocuments(query),
        Notification.countDocuments({ user: userId, read: false }),
    ]);

    return { notifications, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) || 1 };
};

exports.markRead = async (id, userId) => {
    return Notification.findOneAndUpdate(
        { _id: id, user: userId },
        { read: true },
        { new: true }
    );
};

exports.markAllRead = async (userId) => {
    const result = await Notification.updateMany({ user: userId, read: false }, { read: true });
    return result.modifiedCount;
};
