const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

router.get('/stats', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    // Assuming an assessment is counted when riskAssessment is not 'Unknown' or just count totalPatients for now since every patient has a riskAssessment object
    const totalAssessments = await Patient.countDocuments({ "riskAssessment.riskLevel": { $ne: "Unknown" } });

    let modelStatus = "Offline";
    try {
      const dlServiceUrl = process.env.DL_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${dlServiceUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
      });
      // Any response, even 422 Unprocessable Entity, means the service is alive.
      modelStatus = "Active";
    } catch (e) {
      modelStatus = "Offline";
    }

    res.json({
      systemVersion: "1.0.0",
      totalPatients,
      totalAssessments,
      status: "Online",
      modelStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system stats', error: error.message });
  }
});

module.exports = router;
