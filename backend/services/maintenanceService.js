const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const { AppError } = require('../utils/errorHandler');

exports.getAllLogs = async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const matchingVehicles = await Vehicle.find({
      $or: [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { vehicleName: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    
    const vehicleIds = matchingVehicles.map(v => v._id);
    
    query.$or = [
      { serviceType: { $regex: search, $options: 'i' } },
      { vehicle: { $in: vehicleIds } }
    ];
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    MaintenanceLog.find(query)
      .populate('vehicle', 'registrationNumber vehicleName model type capacity status odometer')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    MaintenanceLog.countDocuments(query)
  ]);

  return {
    logs,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};

exports.getLogById = async (id) => {
  const log = await MaintenanceLog.findById(id).populate('vehicle');
  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }
  return log;
};

exports.createLog = async (logData) => {
  const vehicle = await Vehicle.findById(logData.vehicle);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Business Rules: Cannot open maintenance if vehicle is Retired or On Trip
  if (vehicle.status === 'Retired') {
    throw new AppError(`Cannot open maintenance log: Vehicle ${vehicle.registrationNumber} is Retired.`, 400);
  }
  if (vehicle.status === 'On Trip') {
    throw new AppError(`Cannot open maintenance log: Vehicle ${vehicle.registrationNumber} is currently On Trip.`, 400);
  }

  const log = await MaintenanceLog.create(logData);

  // If status is Active, vehicle must become In Shop
  if (log.status === 'Active') {
    vehicle.status = 'In Shop';
    await vehicle.save();
  }

  return MaintenanceLog.findById(log._id).populate('vehicle');
};

exports.updateLog = async (id, updateData) => {
  const log = await MaintenanceLog.findById(id);
  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }

  const vehicleId = updateData.vehicle || log.vehicle;
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  const oldStatus = log.status;
  const newStatus = updateData.status;

  // Handle status transitions
  if (newStatus && oldStatus !== newStatus) {
    if (newStatus === 'Completed') {
      // Transitioning Active -> Completed
      // Check if vehicle has any OTHER Active logs
      const otherActiveLogs = await MaintenanceLog.exists({
        vehicle: vehicleId,
        status: 'Active',
        _id: { $ne: id }
      });

      if (!otherActiveLogs && vehicle.status !== 'Retired') {
        vehicle.status = 'Available';
        await vehicle.save();
      }
    } else if (newStatus === 'Active') {
      // Transitioning Completed -> Active (Re-opening)
      if (vehicle.status === 'Retired') {
        throw new AppError(`Cannot re-open maintenance log: Vehicle ${vehicle.registrationNumber} is Retired.`, 400);
      }
      if (vehicle.status === 'On Trip') {
        throw new AppError(`Cannot re-open maintenance log: Vehicle ${vehicle.registrationNumber} is currently On Trip.`, 400);
      }

      vehicle.status = 'In Shop';
      await vehicle.save();
    }
  }

  const updatedLog = await MaintenanceLog.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  }).populate('vehicle');

  return updatedLog;
};

exports.deleteLog = async (id) => {
  const log = await MaintenanceLog.findById(id);
  if (!log) {
    throw new AppError('Maintenance log not found', 404);
  }

  const vehicle = await Vehicle.findById(log.vehicle);
  
  // If the deleted log was Active, we might need to restore vehicle availability
  if (log.status === 'Active' && vehicle) {
    const otherActiveLogs = await MaintenanceLog.exists({
      vehicle: log.vehicle,
      status: 'Active',
      _id: { $ne: id }
    });

    if (!otherActiveLogs && vehicle.status !== 'Retired') {
      vehicle.status = 'Available';
      await vehicle.save();
    }
  }

  await MaintenanceLog.findByIdAndDelete(id);
};
