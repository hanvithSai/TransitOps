const CURRENT_POLICY_VERSION = 1;

const isPolicyEnforcementEnabled = () =>
    process.env.PASSWORD_POLICY_ENFORCEMENT !== "false";

/**
 * Password policy: min 6 chars, uppercase, lowercase, number, special char, no spaces.
 */
const validatePasswordStrength = (password) => {
    const errors = [];

    if (!password || typeof password !== "string") {
        return { valid: false, errors: ["Password is required."] };
    }

    if (password.length < 6) {
        errors.push("Password must be at least 6 characters.");
    }
    if (/\s/.test(password)) {
        errors.push("Password must not contain spaces.");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must include a lowercase letter.");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must include an uppercase letter.");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must include a number.");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push("Password must include a special character.");
    }

    return { valid: errors.length === 0, errors };
};

const userRequiresPasswordChange = (user, plaintextPassword) => {
    if (!isPolicyEnforcementEnabled()) return false;

    if (user.mustChangePassword) return true;

    const { valid } = validatePasswordStrength(plaintextPassword);
    return !valid;
};

module.exports = {
    CURRENT_POLICY_VERSION,
    isPolicyEnforcementEnabled,
    validatePasswordStrength,
    userRequiresPasswordChange,
};
