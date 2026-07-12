const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { createExpenseValidator, updateExpenseValidator } = require('../validators/financeValidator');

// Protect all routes
router.use(authenticate);

// GET /api/expenses
router.get(
    '/',
    authorize('admin', 'fleet_manager', 'driver', 'financial_analyst'),
    expenseController.getAllExpenses
);

// GET /api/expenses/:id
router.get(
    '/:id',
    authorize('admin', 'fleet_manager', 'driver', 'financial_analyst'),
    expenseController.getExpenseById
);

// POST /api/expenses
router.post(
    '/',
    authorize('admin', 'fleet_manager', 'financial_analyst'),
    createExpenseValidator,
    expenseController.createExpense
);

// PUT /api/expenses/:id
router.put(
    '/:id',
    authorize('admin', 'fleet_manager', 'financial_analyst'),
    updateExpenseValidator,
    expenseController.updateExpense
);

// DELETE /api/expenses/:id
router.delete(
    '/:id',
    authorize('admin', 'fleet_manager', 'financial_analyst'),
    expenseController.deleteExpense
);

module.exports = router;
