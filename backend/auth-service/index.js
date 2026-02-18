const express = require('express');
const cors = require('cors');
const authController = require('./controllers/authController');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;

// app.use(cors());
app.use(express.json());

// Initialize Database Table with Retry Logic
const initDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await User.createTable();
      console.log('✅ Users table checked/created successfully');
      return true;
    } catch (err) {
      console.error(`❌ Error creating users table (attempt ${i + 1}/${retries}):`, err);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  console.error('❌ Failed to connect/create table after multiple attempts.');
  return false;
};

// Routes
app.post('/register', authController.register);
app.post('/login', authController.login);

app.get('/', (req, res) => {
  res.send('Auth Service is running');
});

// Start server only after DB is ready
(async () => {
  const ok = await initDB();
  if (!ok) process.exit(1);

  app.listen(port, () => {
    console.log(`Auth Service listening on port ${port}`);
  });
})();
