const router = require('express').Router();
const { sendMessage } = require('../controllers/chatbotController');

router.post('/message', sendMessage);

module.exports = router;
