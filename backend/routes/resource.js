const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.post('/', resourceController.createResource);
router.get('/:id', resourceController.getResource);
router.put('/:id', resourceController.updateResource);
router.post('/:id/predict-demand', resourceController.predictDemandAndAllocate);

module.exports = router;
