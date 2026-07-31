const auditService = require('../services/auditService');
const { parsePagination } = require('../utils/pagination');

exports.getAuditLogs = async (req, res, next) => {
    try {
        const { page, limit } = parsePagination(req.query);
        const { action, resource, userId, from, to } = req.query;

        const result = await auditService.getAuditLogs({
            page,
            limit,
            action,
            resource,
            userId,
            from,
            to,
        });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
