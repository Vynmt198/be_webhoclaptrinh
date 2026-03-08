const Category = require('../models/Category');

const listCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ name: 1 })
            .select('name slug description icon')
            .lean();
        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

module.exports = { listCategories };
