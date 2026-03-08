const express = require('express');
const router = express.Router();

const {
    listUsers,
    updateUserRole,
    toggleUserStatus,
} = require('../controllers/adminUserController');
const {
    approveCourse,
    updateCourseStatus,
    listPendingCourses,
} = require('../controllers/adminCourseController');
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

router.get('/courses', listPendingCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/status', updateCourseStatus);

module.exports = router;
