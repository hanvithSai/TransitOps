const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
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

        res.status(200).json({
            success: true,
            data: {
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
                }
            }
        });
    } catch (error) {
        next(new AppError('Failed to fetch dashboard statistics', 500));
    }
};
