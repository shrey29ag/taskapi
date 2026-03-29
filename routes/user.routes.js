const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/toggle-status', userController.toggleUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
