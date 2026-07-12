const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required'],
    index: true,
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  closeDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Completed'],
      message: '{VALUE} is not a valid status',
    },
    default: 'Active',
    index: true,
  }
}, { timestamps: true });

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);

module.exports = MaintenanceLog;
