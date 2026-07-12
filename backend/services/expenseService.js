const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const { AppError } = require('../utils/errorHandler');

/**
 * GET all expenses — paginated + filtered
 */
exports.getAllExpenses = async ({
    page = 1,
    limit = 20,
    vehicleId = '',
    tripId = '',
    category = '',
} = {}) => {
    const query = {};

    if (vehicleId) query.vehicle = vehicleId;
    if (tripId) query.trip = tripId;
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
        Expense.find(query)
            .populate('vehicle', 'registrationNumber vehicleName')
            .populate('trip', 'source destination status')
            .populate('createdBy', 'name')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Expense.countDocuments(query),
    ]);

    return {
        expenses,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
    };
};

/**
 * GET single expense by ID
 */
exports.getExpenseById = async (id) => {
    const expense = await Expense.findById(id)
        .populate('vehicle', 'registrationNumber vehicleName')
        .populate('trip', 'source destination status')
        .populate('createdBy', 'name email');

    if (!expense) throw new AppError('Expense not found', 404);
    return expense;
};

/**
 * CREATE expense
 */
exports.createExpense = async (data, userId) => {
    // Verify vehicle exists
    const vehicle = await Vehicle.findById(data.vehicle);
    if (!vehicle) throw new AppError('Vehicle not found', 404);

    // Verify trip exists if provided
    if (data.trip) {
        const trip = await Trip.findById(data.trip);
        if (!trip) throw new AppError('Trip not found', 404);
        // Ensure the trip matches the vehicle (logical check)
        if (trip.vehicle.toString() !== data.vehicle.toString()) {
            throw new AppError('The specified trip does not belong to the selected vehicle', 400);
        }
    }

    const expense = await Expense.create({ ...data, createdBy: userId });

    return Expense.findById(expense._id)
        .populate('vehicle', 'registrationNumber vehicleName')
        .populate('trip', 'source destination');
};

/**
 * UPDATE expense
 */
exports.updateExpense = async (id, data) => {
    // If vehicle is being updated, verify it exists
    if (data.vehicle) {
        const vehicle = await Vehicle.findById(data.vehicle);
        if (!vehicle) throw new AppError('Vehicle not found', 404);
    }

    // If trip is being updated, verify it exists and matches vehicle
    if (data.trip) {
        const trip = await Trip.findById(data.trip);
        if (!trip) throw new AppError('Trip not found', 404);
        
        // We need to know which vehicle to compare against
        const currentExpense = await Expense.findById(id);
        if (!currentExpense) throw new AppError('Expense not found', 404);
        
        const vehicleId = data.vehicle || currentExpense.vehicle.toString();
        
        if (trip.vehicle.toString() !== vehicleId.toString()) {
            throw new AppError('The specified trip does not belong to the selected vehicle', 400);
        }
    }

    const expense = await Expense.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    )
    .populate('vehicle', 'registrationNumber vehicleName')
    .populate('trip', 'source destination');

    if (!expense) throw new AppError('Expense not found', 404);
    return expense;
};

/**
 * DELETE expense
 */
exports.deleteExpense = async (id) => {
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) throw new AppError('Expense not found', 404);
    return expense;
};
