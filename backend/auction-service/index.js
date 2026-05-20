require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./config/db');
const Puja = require('./models/Puja');
const Category = require('./models/Category');
const pujaController = require('./controllers/pujaController');
const categoryController = require('./controllers/categoryController');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const OpenApiValidator = require('express-openapi-validator');
const { startClosureWorker } = require('./services/closureService');
const authMiddleware = require('./middleware/authMiddleware');
const multer = require('multer');

// Load OpenAPI spec robustly
const specPath = process.env.OPENAPI_SPEC_PATH || path.join(__dirname, "../../openspec/specs/auction-spec.yaml");
let openApiSpec = null;
if (fs.existsSync(specPath)) {
    try {
        openApiSpec = YAML.load(specPath);
    } catch (err) {
        console.warn(`[Warning] Could not parse OpenAPI spec at ${specPath}:`, err.message);
    }
} else {
    console.warn(`[Warning] OpenAPI spec not found at ${specPath}. Swagger UI and validation disabled.`);
}

const app = express();
const port = process.env.PORT || 3001;


// app.use(cors());
app.use(express.json());

// ── OpenAPI / Swagger ────────────────────────────────────────────────────────
if (openApiSpec) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

    app.use(
        OpenApiValidator.middleware({
            apiSpec: specPath,
            validateRequests: true,
            validateResponses: false,
            ignorePaths: (path) => path.includes('/uploads'),
        })
    );
}

// Ensure uploads directory exists
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

// Initialize Database Tabless (categories must come before pujas due to FK)
const initDB = async (retries = 5, delay = 5000) => {
    console.log(`[AuctionService] Starting DB initialization... (DB_HOST: ${process.env.DB_HOST || 'localhost'})`);
    while (retries > 0) {
        try {
            // 1. Create categories table first (referenced by pujas FK)
            await Category.createTable();
            console.log('✅ Categories table created or already exists');

            // 2. Seed default categories (INSERT IGNORE = idempotent)
            await Category.seed();
            console.log('✅ Categories seeded');

            // 3. Create pujas table (with category_id FK)
            await Puja.createTable();
            console.log('✅ Pujas table created or already exists');

            // 4. Idempotent migration: add category_id to existing pujas tables
            await Puja.migrate();
            console.log('✅ Pujas table migration checked');

            console.log('🚀 Database initialization complete for Auction Service');
            break;
        } catch (error) {
            console.error(`❌ Error initializing database (retries left: ${retries - 1}):`, error.message);
            retries -= 1;
            if (retries === 0) {
                console.error('CRITICAL: Failed to initialize database after multiple attempts. Exiting...');
                process.exit(1);
            } else {
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
};

initDB();
startClosureWorker();

app.get('/', (req, res) => {
    res.send('Auction Service is running');
});

// Categories Endpoint
app.get('/categories', categoryController.getCategories);

// Auctions Endpoints
app.post('/pujas', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'streamImage', maxCount: 1 }]), pujaController.createPuja);
app.get('/pujas', pujaController.getPujas);
app.get('/pujas/:id', pujaController.getPujaById)
app.post('/pujas/:id/start', pujaController.startPuja);
app.post('/pujas/:id/end', pujaController.endPuja);
app.post('/pujas/:id/bid', pujaController.recordBid);
app.patch('/pujas/:id/extend', pujaController.extendEndTime);
app.get('/pujas/user/:userId', pujaController.getPujasByUser);
app.get('/pujas/live', pujaController.getPujas); // Reusing getPujas for now

// Favorites Endpoints
app.post('/favorites', pujaController.toggleFavorite);
app.get('/favorites/:userId', pujaController.getFavorites);
app.get('/favorites/:userId/:pujaId/check', pujaController.checkFavorite);

// Payments Endpoints
app.get('/payments/:userId', authMiddleware, pujaController.getPayments);
app.post('/pujas/:id/pay', authMiddleware, pujaController.processPayment);
app.post('/pujas/:id/mark-paid', pujaController.markPaid);


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
