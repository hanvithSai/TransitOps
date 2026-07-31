const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

/** Brute-force protection for credential endpoints only (not /me or /refresh). */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 500 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 5000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many API requests. Please try again later.",
    },
});

module.exports = { authLimiter, apiLimiter };
