const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async ({
    page = 1,
    limit = 20,
    action = '',
    resource = '',
    userId = '',
    from = '',
    to = '',
} = {}) => {
    const query = {};

    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.user = userId;

    if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        AuditLog.find(query)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        AuditLog.countDocuments(query),
    ]);

    return {
        logs,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit) || 1,
    };
};
