const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const patientRoutes = require('./patient');
const resourceRoutes = require('./resource');
const systemRoutes = require('./system');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/resources', resourceRoutes);
router.use('/system', systemRoutes);

module.exports = router;