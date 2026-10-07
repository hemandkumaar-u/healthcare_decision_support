const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  age: { type: Number, required: true },
  vitalSigns: { type: String },
  laboratoryValues: [{ type: String }], // Array of file paths/URLs (jpg, png, pdf, excel, word)
  medicalHistory: [{ type: String }], // Array of file paths/URLs
  longitudinalMeasurements: [{ type: String }], // Array of file paths/URLs
  riskAssessment: {
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Unknown'], default: 'Unknown' },
    explanation: { type: String },
    isInsufficientData: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
