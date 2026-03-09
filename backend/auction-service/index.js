require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const Puja = require('./models/Puja');
const Category = require('./models/Category');
const pujaController = require('./controllers/pujaController');
const categoryController = require('./controllers/categoryController');

const app = express();
const port = process.env.PORT || 3001;


// app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const multer = require('multer');
const path = require('path');

// Ensure uploads directory exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Database Tables (categories must come before pujas due to FK)
const initDB = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            // 1. Create categories table first (referenced by pujas FK)
            await Category.createTable();
            console.log('Categories table created or already exists');

            // 2. Seed default categories (INSERT IGNORE = idempotent)
            await Category.seed();
            console.log('Categories seeded');

            // 3. Create pujas table (with category_id FK)
            await Puja.createTable();
            console.log('Pujas table created or already exists');

            // 4. Idempotent migration: add category_id to existing pujas tables
            await Puja.migrate();

            break;
        } catch (error) {
            console.error(`Error initializing database (retries left: ${retries - 1}):`, error);
            retries -= 1;
            if (retries === 0) {
                console.error('Failed to initialize database after multiple attempts');
            } else {
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
};

initDB();

app.get('/', (req, res) => {
    res.send('Auction Service is running');
});

// Categories Endpoint
app.get('/categories', categoryController.getCategories);

// Auctions Endpoints
app.post('/pujas', upload.single('image'), pujaController.createPuja);
app.get('/pujas', pujaController.getPujas);
app.get('/pujas/:id', pujaController.getPujaById)
app.post('/pujas/:id/start', pujaController.startPuja);
app.post('/pujas/:id/end', pujaController.endPuja);
app.get('/pujas/user/:userId', pujaController.getPujasByUser);
app.get('/pujas/live', pujaController.getPujas); // Reusing getPujas for now


// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);

    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    }

    if (err.message === 'Only images are allowed') {
        return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
    console.log(`Auction Service listening on port ${port}`);
});
