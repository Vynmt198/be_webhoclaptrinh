const User = require('../models/User');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
    try {
        // req.user is populated by auth middleware
        const user = req.user;
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    isActive: user.isActive,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    lastLogin: user.lastLogin,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
    try {
        const { fullName, avatar } = req.body;

        // Build update object with only allowed fields
        const updates = {};
        if (fullName !== undefined) updates.fullName = fullName;
        if (avatar !== undefined) updates.avatar = avatar;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: {
                user: {
                    _id: updatedUser._id,
                    email: updatedUser.email,
                    fullName: updatedUser.fullName,
                    role: updatedUser.role,
                    isActive: updatedUser.isActive,
                    avatar: updatedUser.avatar,
                    updatedAt: updatedUser.updatedAt,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/users/change-password
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect.',
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from your current password.',
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProfile, updateProfile, changePassword };
