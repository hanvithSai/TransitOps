/**
 * Centralized error response utility
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let { statusCode = 500, message } = err;

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        statusCode = 409;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
        statusCode = 400;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        message = "Invalid token. Please log in again.";
        statusCode = 401;
    }
    if (err.name === "TokenExpiredError") {
        message = "Token expired. Please log in again.";
        statusCode = 401;
    }

    // Log non-operational errors in development
    if (!err.isOperational && process.env.NODE_ENV !== "production") {
        console.error("ERROR 💥", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = { AppError, errorHandler };
