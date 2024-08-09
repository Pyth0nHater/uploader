const express = require('express');
const router = express.Router();
const profileController = require('../controller/upload.controller');

// Route to start processing a profile
router.post('/upload/:id', profileController.processProfile);

module.exports = router;
