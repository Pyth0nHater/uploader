const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { downloadTiktokVideo } = require('./download_video');
const { postReels } = require('./upload');
const { CheckVideos } = require('./new_video_check');

puppeteer.use(StealthPlugin());
dotenv.config();

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
    const botToken = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';
    const chatId = '819850346';
    const jsonFile = "../../data/links/links.json";
    const jsonNewFile = "../../data/links/newLinks.json";
    const jsonRemovedFile = "../../data/links/removedLinks.json";
    // const link = "https://www.tiktok.com/@master_prognoz?_t=8o8GqT6Ifc0&_r=1";
    const link = "    https://www.tiktok.com/@tema.black?_t=8oSqanmYPmq&_r=1";
    const bot = new TelegramBot(botToken);

    // Fetch new and removed links
    const newLinks = await CheckVideos(botToken, chatId, jsonFile, jsonNewFile, jsonRemovedFile, link);

    if (!newLinks || newLinks.length === 0) {
        console.log('No new links to process.');
        return;
    }

    for (const url of newLinks) {
        try {
            await downloadTiktokVideo(url);
            // await postReels('./video.mp4', botToken, chatId, 'Ссылка в профиле #футбол #договорняк #ставки #ловимкэфы');
            await postReels('./video.mp4', botToken, chatId, 'Белая тема в профиле💸  #успех #мотивация #деньги');
            await sleep(10000)
            // Remove the URL from newLinks after successful postReels
            const updatedLinks = newLinks.filter(link => link !== url);
            await fs.writeFile(jsonNewFile, JSON.stringify(updatedLinks, null, 2));

        } catch (error) {
            console.error(`Error posting reels for ${url}:`, error);
            await bot.sendMessage(chatId, `Error posting reels for ${url}: ${error.message}`);
        }
    }
}

main();
setInterval(main, 10 * 60 * 1000);
