// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/login.controller');

router.post('/login', authController.loginAndFetchCookies);

module.exports = router;
