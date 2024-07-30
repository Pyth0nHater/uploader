const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { downloadTiktokVideo } = require('./download_video');
const { postReels } = require('./upload');


puppeteer.use(StealthPlugin());
dotenv.config();

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
    const botToken = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';
    const chatId = '819850346';
    const jsonFile = '../../data/links/links.json';
    const data = await fs.readFile(jsonFile, 'utf8');
    const newLinks = JSON.parse(data);
    
    const bot = new TelegramBot(botToken);
    
    for (const url of newLinks) {
        try {
            await downloadTiktokVideo(url);
            await sleep(120000)
            await postReels('./video.mp4', botToken, chatId, 'Белая тема в профиле💸  #успех #мотивация #деньги');
            const delay = (4 * 60 * 60 * 1000) + Math.floor(Math.random() * (30 * 60 * 1000));
            await sleep(delay);
        } catch (error) {
            console.error(`Error posting reels for ${url}:`, error);
            await bot.sendMessage(chatId, `Error posting reels for ${url}: ${error.message}`);
        }
    }
}

main();
