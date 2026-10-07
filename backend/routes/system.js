const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    // Assuming an assessment is counted when riskAssessment is not 'Unknown' or just count totalPatients for now since every patient has a riskAssessment object
    const totalAssessments = await Patient.countDocuments({ "riskAssessment.riskLevel": { $ne: "Unknown" } });

    res.json({
      systemVersion: "1.0.0",
      totalPatients,
      totalAssessments,
      status: "Online",
      modelStatus: "Active"
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system stats', error: error.message });
  }
});

module.exports = router;
