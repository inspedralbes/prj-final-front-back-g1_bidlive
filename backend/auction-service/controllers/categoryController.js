const Category = require('../models/Category');
const Puja = require('../models/Puja');

const categoryController = {
    getCategories: async (req, res) => {
        try {
            const categories = await Category.findAll();
            res.json(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
};

module.exports = categoryController;
