const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
    // Handle user registration logic here
    res.send('User registered successfully');
});

router.post('/login', (req, res) => {
    // Handle user login logic here
    res.send('User logged in successfully');
});

module.exports = router;