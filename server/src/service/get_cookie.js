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

async function getCookies(id) {
    const profile = await Profile.findById(id)
    const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
    const bot = new TelegramBot(botToken);
    const chatId = profile.chatId

    const browser = await puppeteer.launch({
                 args: [
          '--no-sandbox',
         ],
        userDataDir: profile.profileFolder,
        headless: true,
    });
    const page = await browser.newPage();
    const cursor = createCursor(page);
    await installMouseHelper(page)
    await cursor.toggleRandomMove(true)

    const customUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
    await page.setUserAgent(customUA);

    await page.goto("https://www.instagram.com/", { waitUntil: 'domcontentloaded' });
    await sleep(5000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '1.png', bot, chatId);

    const cookies = await page.cookies();
    profile.cookie = cookies;
    await profile.save();

    console.log("successfully auth");
    await browser.close()

}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

module.exports = getCookies;
// getCookies("6698fb32a9b8173255b766d2")