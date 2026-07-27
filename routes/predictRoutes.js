const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

// Route for fetching stock predictions based on user input
router.get('/predict/:symbol?', predictController);

module.exports = router;
