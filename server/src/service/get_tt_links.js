const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const { createCursor, installMouseHelper } = require("ghost-cursor");
const dotenv = require('dotenv');
const Profile = require('../models/profile');


puppeteer.use(StealthPlugin());
dotenv.config();

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function GetLinksTikTok(id) {
    const profile = await Profile.findById(id)
    const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
    const bot = new TelegramBot(botToken);
    const chatId = profile.chatId
    const link = profile.tiktok

    const username = process.env.login;
    const password = process.env.password;
    const ip = process.env.ip;

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            `--proxy-server=${ip}`,
        ],
        headless: process.env.headless === 'true',
        executablePath: executablePath(),
    });
    const page = await browser.newPage();
    await page.authenticate({
        username: username,
        password: password,
    });
    const cursor = createCursor(page);
    await installMouseHelper(page);
    await cursor.toggleRandomMove(true);

    const customUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
    await page.setUserAgent(customUA);

    const cookies = JSON.parse(await fs.readFile('../../data/cookies/tiktok_cookie.json'));
    await page.setCookie(...cookies);

    await page.goto(link, { waitUntil: 'domcontentloaded' });
    await sleep(15000 + Math.floor(Math.random() * (3000 - 500 + 1)) + 500);

    await takeScreenshot(page, '1.png', bot, chatId);
    extractAndCompareLinks(page, bot, chatId, jsonFile, jsonNewFile, jsonRemovedFile);

    await browser.close();
}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

async function extractAndCompareLinks(page, profile) {
    let extractedLinks = [];
    let scrollAttempts = 0;

    while (scrollAttempts < 10) {  
        const newLinks = await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            return Array.from(document.querySelectorAll('div.css-at0k0c-DivWrapper a')).map(a => a.href);
        });
        scrollAttempts++
        extractedLinks = newLinks;

        await sleep(2000 + Math.floor(Math.random() * (2000 - 500 + 1)) + 500);
    }

    const existingLinks = profile.links || [];
    const newLinks = extractedLinks.filter(link => !existingLinks.includes(link));

    if (newLinks.length > 0) {
        profile.links = [...existingLinks, ...newLinks];
        await profile.save();
    }

}


module.exports = { GetLinksTikTok }; 