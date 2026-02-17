const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const Puja = require('./models/Puja');
const pujaController = require('./controllers/pujaController');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Database Table
const initDB = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            await Puja.createTable();
            console.log('Pujas table created or already exists');
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

// Real Endpoints
app.post('/pujas', pujaController.createPuja);
app.get('/pujas', pujaController.getPujas);
app.get('/pujas/user/:userId', pujaController.getPujasByUser);
app.get('/pujas/live', pujaController.getPujas); // Reusing getPujas for now, effectively getting all

app.listen(port, () => {
    console.log(`Auction Service listening on port ${port}`);
});
