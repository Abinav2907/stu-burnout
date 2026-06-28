const router = require('express').Router();
const { generateQuiz, saveResult } = require('../controllers/quizController');

router.post('/generate',    generateQuiz);
router.post('/saveResult',  saveResult);

module.exports = router;
