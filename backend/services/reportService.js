const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');

exports.getVehicleROI = async () => {
    const tripStats = await Trip.aggregate([
        { $match: { status: 'Completed', revenue: { $ne: null } } },
        { $group: { _id: '$vehicle', totalRevenue: { $sum: '$revenue' } } }
    ]);
    
    const expenseStats = await Expense.aggregate([
        { $group: { _id: '$vehicle', totalExpense: { $sum: '$amount' } } }
    ]);
    
    const fuelStats = await FuelLog.aggregate([
        { $group: { _id: '$vehicle', totalFuelCost: { $sum: '$cost' } } }
    ]);
    
    const vehicles = await Vehicle.find().lean();
    
    const roiData = vehicles.map(v => {
        const vId = v._id.toString();
        const tStat = tripStats.find(t => t._id.toString() === vId);
        const eStat = expenseStats.find(e => e._id.toString() === vId);
        const fStat = fuelStats.find(f => f._id.toString() === vId);
        
        const revenue = tStat ? tStat.totalRevenue : 0;
        const expenses = eStat ? eStat.totalExpense : 0;
        const fuel = fStat ? fStat.totalFuelCost : 0;
        const operationalCost = expenses + fuel;
        const roi = revenue - operationalCost;
        
        return {
            vehicleId: vId,
            registrationNumber: v.registrationNumber,
            vehicleName: v.vehicleName,
            revenue,
            expenses,
            fuel,
            operationalCost,
            roi
        };
    });
    
    return roiData;
};

exports.generateCSV = (data) => {
    if (!data || !data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => {
        return Object.values(row).map(value => {
            if (typeof value === 'string') {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });
    return [headers, ...rows].join('\n');
};
