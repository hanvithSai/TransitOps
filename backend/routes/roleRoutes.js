const express = require("express");
const router = express.Router();
const Role = require("../models/Role");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const requirePasswordUpdated = require("../middlewares/requirePasswordUpdated");

// GET /api/roles — admin only
router.get("/", authenticate, requirePasswordUpdated, authorize("admin"), async (req, res, next) => {
    try {
        const roles = await Role.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: { roles } });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
