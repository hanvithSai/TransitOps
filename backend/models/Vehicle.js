const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  vehicleName: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Maximum load capacity is required'],
    min: [0.1, 'Capacity must be greater than 0'],
  },
  odometer: {
    type: Number,
    required: [true, 'Odometer reading is required'],
    min: [0, 'Odometer cannot be negative'],
  },
  acquisitionCost: {
    type: Number,
    required: false,
    min: [0, 'Cost cannot be negative'],
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'On Trip', 'In Shop', 'Retired'],
      message: '{VALUE} is not a valid status',
    },
    default: 'Available',
  }
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
