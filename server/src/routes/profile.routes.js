const express = require('express');
const router = express.Router();
const profileController = require('../controller/profile.controller'); // Ensure this path is correct

// POST route to create a new profile
router.post('/', profileController.createProfile);

// GET route to fetch profiles by chatId
router.get('/', profileController.getProfilesByChatId);

// GET route to fetch a specific profile by _id
router.get('/:id', profileController.getProfileById);

module.exports = router;
