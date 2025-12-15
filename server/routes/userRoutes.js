const express = require('express');
const router = express.Router();
const { registerUser, loginUser, displayAllUsers } = require('../controllers/userControllers');

// User registration route
router.post('/signup', registerUser);

// User login route
router.post('/signin', loginUser);

// Route to display all users
router.get('/', displayAllUsers);

module.exports = router;