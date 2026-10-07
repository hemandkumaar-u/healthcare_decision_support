const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  beds: {
    total: { type: Number, default: 0 },
    occupied: { type: Number, default: 0 }
  },
  icuCapacity: {
    total: { type: Number, default: 0 },
    occupied: { type: Number, default: 0 }
  },
  staff: {
    doctors: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    nurses: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    }
  },
  diagnosticFacilities: {
    mri: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    ctScan: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    xRay: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } }
  },
  demandPrediction: {
    expectedBedsNeeded: { type: Number, default: 0 },
    expectedIcuNeeded: { type: Number, default: 0 },
    recommendedAction: { type: String }
  }
}, { timestamps: true });

// Virtuals to get available counts easily if needed
ResourceSchema.virtual('beds.available').get(function() {
  return this.beds.total - this.beds.occupied;
});
ResourceSchema.virtual('icuCapacity.available').get(function() {
  return this.icuCapacity.total - this.icuCapacity.occupied;
});

module.exports = mongoose.model('Resource', ResourceSchema);
