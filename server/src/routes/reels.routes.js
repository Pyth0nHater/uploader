const express = require('express');
const router = express.Router();
const reelsController = require('../controller/reels.controller');

// Define the route to post reels
router.post('/scroll-reels/:id', reelsController.postReels);

module.exports = router;
