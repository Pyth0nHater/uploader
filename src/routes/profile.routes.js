const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile.controller'); // Ensure this path is correct

// GET route to fetch profiles by chatId
router.get('/', profileController.getProfiles);

// GET route to fetch a specific profile by _id
router.get('/:id', profileController.getProfileById);

module.exports = router;
