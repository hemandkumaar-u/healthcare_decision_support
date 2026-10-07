const Patient = require('../models/Patient');

// Missing data handling logic
const checkMissingData = (patientData) => {
  const missing = [];
  if (patientData.age === undefined || patientData.age === null) missing.push('age');
  if (!patientData.vitalSigns) missing.push('vitalSigns');
  return missing;
};

exports.createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    
    // Check for missing data
    const missingFields = checkMissingData(patientData);
    let riskAssessment = {
      riskLevel: 'Unknown',
      explanation: 'Not assessed yet',
      isInsufficientData: missingFields.length > 0
    };

    if (riskAssessment.isInsufficientData) {
      riskAssessment.explanation = `Insufficient data to make a reliable prediction. Missing: ${missingFields.join(', ')}`;
    }

    const patient = new Patient({
      ...patientData,
      riskAssessment
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
};

exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

// Endpoint to trigger risk analysis via DL_service
exports.analyzeRisk = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const missingFields = checkMissingData(patient);
    if (missingFields.length > 0) {
      patient.riskAssessment = {
        riskLevel: 'Unknown',
        explanation: `Insufficient information to make a reliable prediction. Missing: ${missingFields.join(', ')}`,
        isInsufficientData: true
      };
    } else {
      // Call the DL_service to get the actual risk prediction
      const dlServiceUrl = process.env.DL_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${dlServiceUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patient)
      });
      
      if (!response.ok) {
        throw new Error(`DL_service responded with status: ${response.status}`);
      }
      
      const dlResult = await response.json();
      
      patient.riskAssessment = {
        riskLevel: dlResult.riskLevel || 'Unknown',
        explanation: dlResult.explanation || 'Prediction received from DL_service.',
        isInsufficientData: false
      };
    }

    await patient.save();
    res.json({ message: 'Risk assessment completed', riskAssessment: patient.riskAssessment });
  } catch (error) {
    res.status(500).json({ message: 'Error analyzing risk', error: error.message });
  }
};
