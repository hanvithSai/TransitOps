const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const MaintenanceLog = require('../models/MaintenanceLog');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const { AppError } = require('../utils/errorHandler');

exports.getAllVehicles = async (page = 1, limit = 20, search = '', status = '') => {
  const query = {};
  
  if (search) {
    query.$or = [
      { registrationNumber: { $regex: search, $options: 'i' } },
      { vehicleName: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [vehicles, total] = await Promise.all([
    Vehicle.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Vehicle.countDocuments(query)
  ]);

  return {
    vehicles,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};

exports.getVehicleById = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }
  return vehicle;
};

exports.createVehicle = async (vehicleData) => {
  const existingVehicle = await Vehicle.findOne({ registrationNumber: vehicleData.registrationNumber });
  if (existingVehicle) {
    throw new AppError('Vehicle with this registration number already exists', 409);
  }
  const vehicle = await Vehicle.create(vehicleData);
  return vehicle;
};

exports.updateVehicle = async (id, updateData) => {
  const vehicleToUpdate = await Vehicle.findById(id);
  if (!vehicleToUpdate) {
    throw new AppError('Vehicle not found', 404);
  }

  // Enforce Status Rules (cannot manually override In Shop or On Trip)
  if (updateData.status && updateData.status !== vehicleToUpdate.status) {
    if (vehicleToUpdate.status === 'In Shop') {
      throw new AppError('This vehicle is under maintenance. Close the maintenance log to change its status.', 400);
    }
    if (vehicleToUpdate.status === 'On Trip') {
      throw new AppError('This vehicle is currently on a trip. Complete the trip to change its status.', 400);
    }
    if (updateData.status === 'In Shop' || updateData.status === 'On Trip') {
      throw new AppError(`Status cannot be manually set to '${updateData.status}'. It is managed automatically.`, 400);
    }
  }

  if (updateData.registrationNumber) {
    const existingVehicle = await Vehicle.findOne({ 
      registrationNumber: updateData.registrationNumber,
      _id: { $ne: id }
    });
    if (existingVehicle) {
      throw new AppError('Vehicle with this registration number already exists', 409);
    }
  }

  const vehicle = await Vehicle.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  return vehicle;
};

exports.deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  const [tripsCount, maintenanceCount, fuelCount, expenseCount] = await Promise.all([
    Trip.countDocuments({ vehicle: id }),
    MaintenanceLog.countDocuments({ vehicle: id }),
    FuelLog.countDocuments({ vehicle: id }),
    Expense.countDocuments({ vehicle: id })
  ]);

  if (tripsCount > 0 || maintenanceCount > 0 || fuelCount > 0 || expenseCount > 0) {
    throw new AppError('Cannot delete vehicle with associated records. Please retire it instead.', 409);
  }

  await Vehicle.findByIdAndDelete(id);
};
