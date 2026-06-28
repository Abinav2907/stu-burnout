const express = require('express');
const router = express.Router();
const burnoutController = require('../controllers/burnoutController');

router.post('/predict', burnoutController.predictRisk);

module.exports = router;
