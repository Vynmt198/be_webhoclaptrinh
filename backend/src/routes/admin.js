const express = require('express');
const router = express.Router();

const {
    listUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
} = require('../controllers/adminUserController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// All admin routes require auth + isAdmin
router.use(auth, isAdmin);

// @route   GET /api/admin/users
// @desc    List all users with pagination & filters
// @access  Admin
router.get('/users', listUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role
// @access  Admin
router.put('/users/:id/role', updateUserRole);

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user account active status
// @access  Admin
router.put('/users/:id/status', toggleUserStatus);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', deleteUser);

module.exports = router;
