// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/cookie.controller');

router.post('/login/', authController.loginAndFetchCookies); // Uses profile ID to fetch cookies with login
router.post('/get/:id', authController.fetchCookies); // Uses profile ID to fetch cookies without login

module.exports = router;
