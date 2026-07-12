const Vehicle = require('../models/Vehicle');
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

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  return vehicle;
};

exports.deleteVehicle = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Business Rule: Can we delete if they have trips?
  // Since we don't have trips yet, we allow deletion. Later we might want to prevent deletion or just retire.
  
  await Vehicle.findByIdAndDelete(id);
};
