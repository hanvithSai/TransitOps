const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const { AppError } = require('../utils/errorHandler');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalVehicles,
            availableVehicles,
            inShopVehicles,
            onTripVehicles,
            totalDrivers,
            availableDrivers,
            onDutyDrivers,
            activeTrips,
            pendingTrips,
        ] = await Promise.all([
            Vehicle.countDocuments(),
            Vehicle.countDocuments({ status: 'Available' }),
            Vehicle.countDocuments({ status: 'In Shop' }),
            Vehicle.countDocuments({ status: 'On Trip' }),
            Driver.countDocuments(),
            Driver.countDocuments({ status: 'Available' }),
            Driver.countDocuments({ status: 'On Trip' }),
            Trip.countDocuments({ status: 'Dispatched' }),
            Trip.countDocuments({ status: 'Draft' }),
        ]);

        const fleetUtilization = totalVehicles > 0 ? ((onTripVehicles / totalVehicles) * 100).toFixed(2) : 0;

        const [fuelResult] = await FuelLog.aggregate([
            { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);
        const totalFuelCost = fuelResult ? fuelResult.total : 0;

        const [maintResult] = await MaintenanceLog.aggregate([
            { $group: { _id: null, total: { $sum: '$cost' } } }
        ]);
        const totalMaintenanceCost = maintResult ? maintResult.total : 0;

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const tripsByMonth = await Trip.aggregate([
            { $match: { status: 'Completed', completedAt: { $gte: sixMonthsAgo } } },
            { $group: { 
                _id: { month: { $month: '$completedAt' }, year: { $year: '$completedAt' } }, 
                count: { $sum: 1 } 
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const fuelByMonth = await FuelLog.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            { $group: { 
                _id: { month: { $month: '$date' }, year: { $year: '$date' } }, 
                cost: { $sum: '$cost' },
                liters: { $sum: '$liters' }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const maintByMonth = await MaintenanceLog.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            { $group: { 
                _id: { month: { $month: '$date' }, year: { $year: '$date' } }, 
                cost: { $sum: '$cost' }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const formatTrend = (data, valueKey) => {
            return data.map(d => ({
                name: `${monthNames[d._id.month - 1]} ${d._id.year}`,
                [valueKey]: d[valueKey]
            }));
        };

        res.status(200).json({
            success: true,
            data: {
                kpis: {
                    vehicles: {
                        total: totalVehicles,
                        available: availableVehicles,
                        inShop: inShopVehicles,
                        onTrip: onTripVehicles,
                        utilization: parseFloat(fleetUtilization)
                    },
                    drivers: {
                        total: totalDrivers,
                        available: availableDrivers,
                        onDuty: onDutyDrivers,
                    },
                    trips: {
                        active: activeTrips,
                        pending: pendingTrips,
                    },
                    costs: {
                        totalFuelCost,
                        totalMaintenanceCost
                    }
                },
                charts: {
                    tripsTrend: formatTrend(tripsByMonth, 'count'),
                    fuelTrend: formatTrend(fuelByMonth, 'cost'),
                    maintenanceTrend: formatTrend(maintByMonth, 'cost'),
                    fleetStatus: [
                        { name: 'Available', value: availableVehicles },
                        { name: 'On Trip', value: onTripVehicles },
                        { name: 'In Shop', value: inShopVehicles }
                    ]
                }
            }
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        next(new AppError('Failed to fetch dashboard statistics', 500));
    }
};
