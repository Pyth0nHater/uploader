const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { downloadVideo } = require('./download_video');
const { postReels } = require('./upload');
const { CheckVideos } = require('./new_video_check');  

puppeteer.use(StealthPlugin());
dotenv.config();



async function main() {
    const botToken = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';
    const chatId = '819850346';
    const jsonFile = "../../data/links/links.json";
    const jsonNewFile = "../../data/links/newLinks.json";
    const jsonRemovedFile = "../../data/links/removedLinks.json";
    const link = "https://www.tiktok.com/@bestbet012?_t=8nlbx15xTWx&_r=1";

    const bot = new TelegramBot(botToken);

    // Fetch new and removed links
    const newLinks = await CheckVideos(botToken, chatId, jsonFile, jsonNewFile, jsonRemovedFile, link);

    if (!newLinks || newLinks.length === 0) {
        console.log('No new links to process.');
        return;
    }

    for (const url of newLinks) {
        try {
            downloadVideo(url);
            await postReels('./video.mp4', botToken, chatId, 'Link in bio #crypto #signals #profit #guide #binance #easycrypto');

            // Remove the URL from newLinks after successful postReels
            const index = newLinks.indexOf(url);
            if (index > -1) {
                newLinks.splice(index, 1);
                await fs.writeFile(jsonNewFile, JSON.stringify(newLinks, null, 2));
            }

        } catch (error) {
            console.error(`Error posting reels for ${url}:`, error);
            await bot.sendMessage(chatId, `Error posting reels for ${url}: ${error.message}`);
        }
    }
}

main()
setInterval(main, 10 * 60 * 1000);
