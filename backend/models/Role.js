const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            enum: [
                "admin",
                "fleet_manager",
                "dispatcher",
                "safety_officer",
                "financial_analyst",
            ],
        },
        displayName: {
            type: String,
            required: true,
        },
        permissions: {
            type: [String],
            default: [],
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
