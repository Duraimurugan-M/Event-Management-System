const express = require('express');
const app = express();
const port = 3000;
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Use user routes
app.use('/auth/users', userRoutes);

// Events routes
app.use('/events', eventRoutes);

// Registration routes
app.use('/registration-events', registrationRoutes);

// Load environment variables

dotenv.config();

// Connect to MongoDB
connectDB();



app.get('/', (req, res) => {
  res.send('Hello World! This is the Event Management System API. And push to durai branch');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});