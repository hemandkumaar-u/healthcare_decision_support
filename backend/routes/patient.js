const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.post('/', patientController.createPatient);
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatient);
router.post('/:id/analyze', patientController.analyzeRisk);
router.post('/:id/report', patientController.sendReport);
router.get('/:id/report.html', patientController.getReportHtml);

module.exports = router;
