const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const { AppError } = require('../utils/errorHandler');
const escapeRegex = require('../utils/escapeRegex');

exports.getAllDrivers = async (page = 1, limit = 20, search = '', status = '') => {
  const query = {};
  
  const safeSearch = escapeRegex(search.trim());
  if (safeSearch) {
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { licenseNumber: { $regex: safeSearch, $options: 'i' } },
      { licenseCategory: { $regex: safeSearch, $options: 'i' } }
    ];
  }
  
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [drivers, total] = await Promise.all([
    Driver.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Driver.countDocuments(query)
  ]);

  return {
    drivers,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };
};

exports.getDriverById = async (id) => {
  const driver = await Driver.findById(id);
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }
  return driver;
};

exports.createDriver = async (driverData, requesterRole = '') => {
  if (driverData.status === 'Suspended' && requesterRole !== 'safety_officer') {
    throw new AppError(
      "Driver status 'Suspended' can only be set by safety officers or automated license checks.",
      403
    );
  }

  const existingDriver = await Driver.findOne({ licenseNumber: driverData.licenseNumber });
  if (existingDriver) {
    throw new AppError('Driver with this license number already exists', 409);
  }
  const driver = await Driver.create(driverData);
  return driver;
};

exports.updateDriver = async (id, updateData, requesterRole = '') => {
  if (updateData.status === 'On Trip') {
    throw new AppError(
      "Driver status 'On Trip' is managed by trip dispatch and cannot be set manually.",
      400
    );
  }

  if (updateData.status === 'Suspended' && requesterRole !== 'safety_officer') {
    throw new AppError(
      "Driver status 'Suspended' can only be set by safety officers or automated license checks.",
      403
    );
  }

  if (updateData.licenseNumber) {
    const existingDriver = await Driver.findOne({ 
      licenseNumber: updateData.licenseNumber,
      _id: { $ne: id }
    });
    if (existingDriver) {
      throw new AppError('Driver with this license number already exists', 409);
    }
  }

  const driver = await Driver.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  return driver;
};

exports.deleteDriver = async (id) => {
  const driver = await Driver.findById(id);
  if (!driver) {
    throw new AppError('Driver not found', 404);
  }

  const tripsCount = await Trip.countDocuments({ driver: id });
  if (tripsCount > 0) {
    throw new AppError("Cannot delete driver with associated trips. Please set status to 'Off Duty' instead.", 409);
  }

  await Driver.findByIdAndDelete(id);
};
