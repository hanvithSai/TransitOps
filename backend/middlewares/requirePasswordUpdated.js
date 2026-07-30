const { isPolicyEnforcementEnabled } = require("../utils/passwordPolicy");

/**
 * Blocks API access until the user updates to a compliant password.
 * Set PASSWORD_POLICY_ENFORCEMENT=false to disable after migration is complete.
 */
const requirePasswordUpdated = (req, res, next) => {
    if (!isPolicyEnforcementEnabled()) return next();

    if (req.user?.mustChangePassword) {
        return res.status(403).json({
            success: false,
            message: "Password update required before accessing this resource.",
            requiresPasswordChange: true,
        });
    }

    next();
};

module.exports = requirePasswordUpdated;
