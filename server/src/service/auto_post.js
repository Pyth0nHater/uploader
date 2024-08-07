const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { downloadTiktokVideo } = require('./download_video');
const { postReels } = require('./upload');
const { scrollReels } = require('./reels');


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
            const videoPath = './video.mp4';
            await bot.sendVideo(chatId, videoPath, { caption: 'Downloaded video from TikTok' });
            await sleep(10000)
            await postReels("6698fb32a9b8173255b766d2", 'Белая темка в профиле💸 #успех #мотивация #деньги');
            const delay = (2 * 60 * 60 * 1000) + Math.floor(Math.random() * (30 * 60 * 1000));
            await sleep(delay);
            await scrollReels('6698fb32a9b8173255b766d2');
            const delay_2 = (2 * 60 * 60 * 1000) + Math.floor(Math.random() * (30 * 60 * 1000));
            await sleep(delay_2);
        } catch (error) {
            console.error(`Error posting reels for ${url}:`, error);
            await bot.sendMessage(chatId, `Error posting reels for ${url}: ${error.message}`);
        }
    }
}

main();
