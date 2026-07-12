const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  licenseCategory: {
    type: String,
    required: [true, 'License category is required'],
    trim: true,
  },
  expiryDate: {
    type: Date,
    required: [true, 'License expiry date is required'],
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
  },
  safetyScore: {
    type: Number,
    min: [0, 'Safety score cannot be less than 0'],
    max: [100, 'Safety score cannot exceed 100'],
    default: 100,
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      message: '{VALUE} is not a valid status',
    },
    default: 'Available',
  }
}, { timestamps: true });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
