const router = require('express').Router();
const {
  saveSession,
  getStats,
  getTasks,
  addTask,
  toggleTask,
  deleteTask
} = require('../controllers/pomodoroController');

router.post('/session',  saveSession);
router.get('/stats',     getStats);
router.get('/tasks',     getTasks);
router.post('/tasks',    addTask);
router.put('/tasks/:id', toggleTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;
