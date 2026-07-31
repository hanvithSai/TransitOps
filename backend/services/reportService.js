const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');

exports.getVehicleROI = async () => {
    const [tripStats, expenseStats, fuelStats, maintenanceStats, vehicles] = await Promise.all([
        Trip.aggregate([
            { $match: { status: 'Completed', revenue: { $ne: null } } },
            { $group: { _id: '$vehicle', totalRevenue: { $sum: '$revenue' } } },
        ]),
        Expense.aggregate([
            { $group: { _id: '$vehicle', totalExpense: { $sum: '$amount' } } },
        ]),
        FuelLog.aggregate([
            { $group: { _id: '$vehicle', totalFuelCost: { $sum: '$cost' } } },
        ]),
        MaintenanceLog.aggregate([
            { $group: { _id: '$vehicle', totalMaintenance: { $sum: '$cost' } } },
        ]),
        Vehicle.find().lean(),
    ]);

    return vehicles.map((v) => {
        const vId = v._id.toString();
        const tStat = tripStats.find((t) => t._id.toString() === vId);
        const eStat = expenseStats.find((e) => e._id.toString() === vId);
        const fStat = fuelStats.find((f) => f._id.toString() === vId);
        const mStat = maintenanceStats.find((m) => m._id.toString() === vId);

        const revenue = tStat ? tStat.totalRevenue : 0;
        const expenses = eStat ? eStat.totalExpense : 0;
        const fuel = fStat ? fStat.totalFuelCost : 0;
        const maintenance = mStat ? mStat.totalMaintenance : 0;
        const operationalCost = expenses + fuel + maintenance;
        const roi = revenue - operationalCost;

        return {
            vehicleId: vId,
            registrationNumber: v.registrationNumber,
            vehicleName: v.vehicleName,
            revenue,
            expenses,
            fuel,
            maintenance,
            operationalCost,
            roi,
        };
    });
};

exports.getOverallMetrics = async () => {
    const [totalVehicles, onTripVehicles, fuelResult, expenseResult, maintenanceResult, tripResult] = await Promise.all([
        Vehicle.countDocuments(),
        Vehicle.countDocuments({ status: 'On Trip' }),
        FuelLog.aggregate([{ $group: { _id: null, totalCost: { $sum: '$cost' }, totalLiters: { $sum: '$liters' } } }]),
        Expense.aggregate([{ $group: { _id: null, totalCost: { $sum: '$amount' } } }]),
        MaintenanceLog.aggregate([{ $group: { _id: null, totalCost: { $sum: '$cost' } } }]),
        Trip.aggregate([{ $match: { status: 'Completed' } }, { $group: { _id: null, totalDistance: { $sum: '$actualDistance' } } }]),
    ]);

    const utilization = totalVehicles > 0 ? ((onTripVehicles / totalVehicles) * 100).toFixed(2) : 0;

    const totalFuelLiters = fuelResult[0] ? fuelResult[0].totalLiters : 0;
    const totalDistance = tripResult[0] ? tripResult[0].totalDistance : 0;
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : 0;

    const fuelCost = fuelResult[0] ? fuelResult[0].totalCost : 0;
    const expensesCost = expenseResult[0] ? expenseResult[0].totalCost : 0;
    const maintenanceCost = maintenanceResult[0] ? maintenanceResult[0].totalCost : 0;
    const operationalCost = fuelCost + expensesCost + maintenanceCost;

    return {
        fleetUtilization: parseFloat(utilization),
        fuelEfficiency: parseFloat(fuelEfficiency),
        operationalCost
    };
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

exports.generatePDF = (data) => {
    const PDFDocument = require('pdfkit');
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(16).text('TransitOps — Vehicle ROI Report', { underline: true });
        doc.moveDown();
        doc.fontSize(10);

        if (!data?.length) {
            doc.text('No ROI data available.');
            doc.end();
            return;
        }

        data.forEach((row, index) => {
            doc.text(`${index + 1}. ${row.registrationNumber} (${row.vehicleName})`);
            doc.text(`   Revenue: ₹${row.revenue} | Op. cost: ₹${row.operationalCost} | ROI: ₹${row.roi}`);
            doc.moveDown(0.5);
        });

        doc.end();
    });
};
