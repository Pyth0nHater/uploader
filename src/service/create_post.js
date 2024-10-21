const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { addTextToVideo } = require('./create_video');
const { postReels } = require('./upload');
const { scrollReels } = require('./reels');
const Profile = require('../models/profile');
const mongoose = require('mongoose'); // Добавлено подключение Mongoose

puppeteer.use(StealthPlugin());
dotenv.config();

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

async function main(id) {
    const profile = await Profile.findById(id)
    const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
    const bot = new TelegramBot(botToken);
    const chatId = profile.chatId
    const links = profile.links

    //await GetLinksTikTok(id)


    for (let i = 0; i < 49; i++) {
        try {
            await addTextToVideo()
            // const videoPath = `../../videos/${id}_unique.mp4`;
            await bot.sendVideo(chatId, videoPath, { caption: 'Downloaded video from TikTok' });
            await sleep(10000)
            await postReels(id);
            const delay = (2 * 60 * 60 * 1000) + Math.floor(Math.random() * (30 * 60 * 1000));
            await sleep(delay);
            await scrollReels(id);
            const delay_2 = (2 * 60 * 60 * 1000) + Math.floor(Math.random() * (30 * 60 * 1000));
            await sleep(delay_2);
        } catch (error) {
            console.error(`Error posting reels for ${url}:`, error);
            await bot.sendMessage(chatId, `Error posting reels for ${url}: ${error.message}`);
        }
    }
}

// main("66cb6e8c3b53d62a5e875fe8");
//module.exports = { main }