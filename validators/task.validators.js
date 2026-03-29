const { body, param, query } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status value'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority value'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => tags.every((t) => typeof t === 'string' && t.length <= 30))
    .withMessage('Each tag must be a string with max 30 characters'),

  body('assignedTo')
    .optional()
    .isMongoId().withMessage('assignedTo must be a valid user ID'),
];

const updateTaskValidator = [
  param('id').isMongoId().withMessage('Invalid task ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status value'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority value'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date')
    .toDate(),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('assignedTo')
    .optional()
    .isMongoId().withMessage('assignedTo must be a valid user ID'),
];

const taskIdValidator = [
  param('id').isMongoId().withMessage('Invalid task ID'),
];

const taskQueryValidator = [
  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status filter'),

  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority filter'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
];

module.exports = { createTaskValidator, updateTaskValidator, taskIdValidator, taskQueryValidator };
