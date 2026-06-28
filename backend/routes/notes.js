const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');

router.post('/generate', notesController.generateNotes);

module.exports = router;
