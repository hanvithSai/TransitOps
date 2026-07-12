const { AppError } = require("../utils/errorHandler");

/**
 * RBAC authorization middleware.
 * Usage: authorize("admin", "fleet_manager")
 * Must be used AFTER the authenticate middleware.
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(new AppError("Authentication required.", 401));
        }

        const userRole = req.user.role.name;

        if (!allowedRoles.includes(userRole)) {
            return next(
                new AppError(
                    `Role '${userRole}' is not authorized to access this resource.`,
                    403
                )
            );
        }

        next();
    };
};

module.exports = authorize;
