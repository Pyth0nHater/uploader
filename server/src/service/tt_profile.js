const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createCursor, installMouseHelper, randomMove } = require("ghost-cursor")
const TelegramBot = require('node-telegram-bot-api');
puppeteer.use(StealthPlugin());
const Profile = require('../models/profile');

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function tiktokUpload() {
    const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
    const bot = new TelegramBot(botToken)
    const chatId = "819850346"

    const proxyServer = "http://192.71.227.72:13059"; // Replace with your proxy server and port
    const proxyUsername = "modeler_2qfAQT"; // Replace with your proxy username
    const proxyPassword = "AkagoXsXBsx1"; // Replace with your proxy password

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',

            `--window-size=1920,1080`
        ],
        userDataDir: "../../data/profiles/tiktok_phone",
        headless: false,
    });
    const page = await browser.newPage();
    await page.authenticate({ username: proxyUsername, password: proxyPassword });

    const cursor = createCursor(page);
    await installMouseHelper(page);
    await cursor.toggleRandomMove(true);

    // const cookies = JSON.parse(await fs.readFile('../../data/cookies/tiktok_cookie.json'));
    // await page.setCookie(...cookies);

    await page.goto("https://www.tiktok.com/", { waitUntil: 'domcontentloaded' });
   
}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

// module.exports = tiktokUpload;
tiktokUpload();