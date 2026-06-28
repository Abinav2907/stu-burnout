const router = require('express').Router();
const { predictRisk } = require('../controllers/burnoutController');

router.post('/predict', predictRisk);

module.exports = router;
