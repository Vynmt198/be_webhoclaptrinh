/**
 * Role-based access control middleware (BR22)
 */

/**
 * Restrict access to admin users only
 */
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }
    next();
};

/**
 * Restrict access to instructors and admins
 */
const isInstructor = (req, res, next) => {
    if (!req.user || !['instructor', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Instructor privileges required.',
        });
    }
    next();
};

/**
 * Factory: allow access for specified roles
 * Usage: requireRole('admin', 'instructor')
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}.`,
            });
        }
        next();
    };
};

module.exports = { isAdmin, isInstructor, requireRole };
