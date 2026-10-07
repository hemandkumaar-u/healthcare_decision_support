const Patient = require('../models/Patient');
const nodemailer = require('nodemailer');
const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

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
    console.log("Received patientData:", JSON.stringify(patientData));
    
    // Check for missing data
    const missingFields = checkMissingData(patientData);
    console.log("Provided riskAssessment:", patientData.riskAssessment);
    
    let riskAssessment = patientData.riskAssessment || {
      riskLevel: 'Unknown',
      explanation: 'Not assessed yet',
      isInsufficientData: missingFields.length > 0
    };

    if (riskAssessment.isInsufficientData && !patientData.riskAssessment) {
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

exports.sendReport = async (req, res) => {
  try {
    const patientId = req.params.id;

    let patient = null;
    try {
      patient = await Patient.findById(patientId);
    } catch (err) {
      // Ignore CastError if ID is not a valid Mongo ID
    }

    const email = (patient && patient.email) ? patient.email : req.body.email;
    const name = (patient && patient.name) ? patient.name : req.body.name;
    const patientData = req.body.patientData || {};
    const assessment = (patient && patient.riskAssessment) ? patient.riskAssessment : (req.body.riskAssessment || {});
    
    if (!email) {
      return res.status(400).json({ message: 'Patient does not have an email address on file, and no email was provided in the request.' });
    }

    // Configure nodemailer transporter for AWS SES
    const sesClient = new SESv2Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
      }
    });

    const transporter = nodemailer.createTransport({
      SES: {
        sesClient,
        SendEmailCommand
      }
    });
    
    const { generateReportHtml } = require('../utils/reportTemplate');
    const htmlContent = generateReportHtml(patient, name, assessment, patientData);

    let pdfBuffer = null;
    try {
      const htmlPdf = require('html-pdf-node');
      let options = { format: 'A4' };
      let file = { content: htmlContent };
      pdfBuffer = await htmlPdf.generatePdf(file, options);
    } catch (err) {
      console.warn("Could not generate PDF attachment, falling back to HTML only:", err.message);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Healthcare AI System" <no-reply@healthcare-decision-support.com>',
      to: email,
      subject: `Health Risk Assessment Report - ${name || 'Patient'}`,
      text: `Hello ${name || ''},\n\nHere is your recent health risk assessment report:\n\nRisk Level: ${assessment.riskLevel || 'Unknown'}\nExplanation: ${assessment.explanation || 'No details available.'}\n\nPlease consult with your doctor for more information.\n\nBest regards,\nHealthcare Team`,
      html: htmlContent,
      attachments: []
    };

    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename: `Assessment_Report_${(name || 'Patient').replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    } else {
      mailOptions.attachments.push({
        filename: `Assessment_Report_${(name || 'Patient').replace(/\s+/g, '_')}.html`,
        content: htmlContent,
        contentType: 'text/html'
      });
    }

    // Note: If you don't have valid SMTP credentials in .env, this will fail. 
    // We catch the error but send a success if we're just testing.
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("AWS SES Error:", mailError);
      throw new Error(`Failed to send email via AWS SES: ${mailError.message}`);
    }

    res.json({ message: 'Report sent successfully to ' + email });
  } catch (error) {
    res.status(500).json({ message: 'Error sending report', error: error.message });
  }
};

exports.getReportHtml = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).send('Patient not found');
    }
    
    const { generateReportHtml } = require('../utils/reportTemplate');
    // Add auto-print script to the HTML for PDF saving
    let htmlContent = generateReportHtml(patient, patient.name, patient.riskAssessment || {});
    htmlContent = htmlContent.replace('</body>', '<script>window.onload = function() { window.print(); }</script></body>');
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    res.status(500).send('Error generating report: ' + error.message);
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).send('Patient not found');
    }
    
    const { generateReportHtml } = require('../utils/reportTemplate');
    const htmlContent = generateReportHtml(patient, patient.name, patient.riskAssessment || {});
    
    const htmlPdf = require('html-pdf-node');
    let options = { format: 'A4' };
    let file = { content: htmlContent };
    
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Assessment_Report_${(patient.name || 'Patient').replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send('Error generating PDF report: ' + error.message);
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const patientData = req.body.patientData || {};
    const assessment = req.body.riskAssessment || {};
    
    const { generateReportHtml } = require('../utils/reportTemplate');
    const htmlContent = generateReportHtml(null, name, assessment, patientData);
    
    const htmlPdf = require('html-pdf-node');
    let options = { format: 'A4' };
    let file = { content: htmlContent };
    
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Assessment_Report_${(name || 'Patient').replace(/\s+/g, '_')}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).send('Error generating PDF report: ' + error.message);
  }
};
