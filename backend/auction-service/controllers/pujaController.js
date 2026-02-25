const Puja = require('../models/Puja');
const Category = require('../models/Category');

const pujaController = {
    createPuja: async (req, res) => {
        try {
            const { title, description, startingPrice, sellerId, categoryId } = req.body;
            let imageUrl = req.body.imageUrl;

            if (req.file) {
                const protocol = req.protocol;
                const host = req.get('host');
                const servicePrefix = process.env.SERVICE_PREFIX || '';
                imageUrl = `${protocol}://${host}${servicePrefix}/uploads/${req.file.filename}`;
            }

            if (!title || !startingPrice || !sellerId) {
                return res.status(400).json({ message: 'Title, starting price, and seller ID are required' });
            }

            // Validate that the provided categoryId exists
            let resolvedCategoryId = null;
            if (categoryId) {
                const cat = await Category.findById(Number(categoryId));
                if (!cat) {
                    return res.status(400).json({ message: 'Invalid category' });
                }
                resolvedCategoryId = cat.id;
            }

            const newPuja = await Puja.create(title, description, startingPrice, imageUrl, sellerId, 'live', resolvedCategoryId);
            res.status(201).json({ message: 'Puja created successfully', puja: newPuja });
        } catch (error) {
            console.error('Error creating puja:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    getPujas: async (req, res) => {
        try {
            const { status, q, categoryId } = req.query;
            const pujas = await Puja.findAll(status, q, categoryId ? Number(categoryId) : null);

            const formattedPujas = pujas.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                img: p.image_url || 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?auto=format&fit=crop&q=80',
                seller: `User ${p.seller_id}`,
                sellerImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
                categoryId: p.category_id || null,
                category: p.category_name || 'Sin categoría',
                categoryIcon: p.category_icon || 'grid_view',
                bid: `$${p.current_price}`,
                viewers: Math.floor(Math.random() * 200) + 10,
                status: p.status
            }));

            res.json(formattedPujas);
        } catch (error) {
            console.error('Error fetching pujas:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getPujasByUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const pujas = await Puja.findBySellerId(userId);
            res.json(pujas);
        } catch (error) {
            console.error('Error fetching user pujas:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = pujaController;
