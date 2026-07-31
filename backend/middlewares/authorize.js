const { AppError } = require("../utils/errorHandler");

/**
 * RBAC authorization middleware.
 * Usage: authorize("admin", "fleet_manager")
 * Must be used AFTER the authenticate middleware.
 */
const authorize = (...allowed) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(new AppError("Authentication required.", 401));
        }

        const userRole = req.user.role.name;
        const permissions = req.user.role.permissions || [];

        if (allowed.includes(userRole)) {
            return next();
        }

        if (permissions.includes("*")) {
            return next();
        }

        const permissionKeys = allowed.filter((entry) => entry.includes(":"));
        if (permissionKeys.some((perm) => permissions.includes(perm))) {
            return next();
        }

        return next(
            new AppError(
                `Role '${userRole}' is not authorized to access this resource.`,
                403
            )
        );
    };
};

module.exports = authorize;
