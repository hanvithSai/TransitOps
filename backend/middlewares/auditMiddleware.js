const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
    res.on('finish', async () => {
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
            if (req.user) {
                const parts = req.originalUrl.split('?')[0].split('/');
                const resourceIndex = parts.indexOf('api') + 1;
                const resource = parts[resourceIndex] || 'unknown';
                
                let action = 'CREATE';
                if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
                if (req.method === 'DELETE') action = 'DELETE';

                let safeBody = { ...req.body };
                if (safeBody.password) delete safeBody.password;

                try {
                    await AuditLog.create({
                        user: req.user._id,
                        action,
                        resource,
                        details: {
                            path: req.originalUrl,
                            params: req.params,
                            body: safeBody
                        },
                        ipAddress: req.ip
                    });
                } catch (error) {
                    console.error('Audit Log Error:', error);
                }
            }
        }
    });
    next();
};

module.exports = auditLogger;
