const router = require('express').Router();
const { generateNotes } = require('../controllers/notesController');

router.post('/generate', generateNotes);

module.exports = router;
