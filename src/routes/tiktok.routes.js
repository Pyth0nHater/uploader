const express = require('express');
const router = express.Router();
const TikTokController = require('../controller/tiktok.controller');

router.get('/get-links/:id', TikTokController.getLinks);

module.exports = router;
