const expenseService = require('../services/expenseService');
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errorHandler');

exports.getAllExpenses = async (req, res, next) => {
    try {
        const { page, limit, vehicleId, tripId, category } = req.query;
        const result = await expenseService.getAllExpenses({ page, limit, vehicleId, tripId, category });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

exports.getExpenseById = async (req, res, next) => {
    try {
        const expense = await expenseService.getExpenseById(req.params.id);
        res.status(200).json({ success: true, data: { expense } });
    } catch (error) {
        next(error);
    }
};

exports.createExpense = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map((err) => err.msg);
            throw new AppError(messages.join(', '), 400);
        }

        const expense = await expenseService.createExpense(req.body, req.user._id);
        res.status(201).json({ success: true, data: { expense }, message: 'Expense created successfully' });
    } catch (error) {
        next(error);
    }
};

exports.updateExpense = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const messages = errors.array().map((err) => err.msg);
            throw new AppError(messages.join(', '), 400);
        }

        const expense = await expenseService.updateExpense(req.params.id, req.body);
        res.status(200).json({ success: true, data: { expense }, message: 'Expense updated successfully' });
    } catch (error) {
        next(error);
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        await expenseService.deleteExpense(req.params.id);
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        next(error);
    }
};
