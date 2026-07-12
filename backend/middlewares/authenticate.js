const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/errorHandler");

const authenticate = async (req, res, next) => {
    try {
        // 1. Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new AppError("No token provided. Access denied.", 401));
        }

        const token = authHeader.split(" ")[1];

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Check user still exists and is active
        const user = await User.findById(decoded.id)
            .select("-password")
            .populate("role", "name displayName permissions");

        if (!user) {
            return next(new AppError("User no longer exists.", 401));
        }

        if (!user.isActive) {
            return next(new AppError("Your account has been deactivated.", 401));
        }

        // 4. Attach user to request
        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = authenticate;
