const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  taskQueryValidator,
} = require('../validators/task.validators');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/stats', taskController.getTaskStats);

router.get('/', taskQueryValidator, validate, taskController.getTasks);
router.post('/', createTaskValidator, validate, taskController.createTask);
router.get('/:id', taskIdValidator, validate, taskController.getTask);
router.put('/:id', updateTaskValidator, validate, taskController.updateTask);
router.patch(
  '/:id/status',
  [...taskIdValidator, body('status').isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status')],
  validate,
  taskController.updateTaskStatus
);
router.delete('/:id', taskIdValidator, validate, taskController.deleteTask);

module.exports = router;
