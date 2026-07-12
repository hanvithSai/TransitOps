const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle',
            required: [true, 'Vehicle is required for an expense'],
        },
        trip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            default: null, // Optional
        },
        amount: {
            type: Number,
            required: [true, 'Expense amount is required'],
            min: [0.1, 'Amount must be greater than 0'],
        },
        category: {
            type: String,
            required: [true, 'Expense category is required'],
            enum: {
                values: ['Toll', 'Repair', 'Parking', 'Insurance', 'Miscellaneous'],
                message: '{VALUE} is not a valid expense category',
            },
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Fast lookups for vehicle expense history and chronological sorting
expenseSchema.index({ vehicle: 1, date: -1 });
// Lookup expenses by category
expenseSchema.index({ category: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
