const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const { createCursor, installMouseHelper } = require("ghost-cursor");
const dotenv = require('dotenv');

puppeteer.use(StealthPlugin());
dotenv.config();

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function CheckVideos(botToken, chatId, jsonFile, jsonNewFile, jsonRemovedFile, link) {
    const bot = new TelegramBot(botToken);

    // Load credentials from environment variables
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
    const newLinks = await extractAndCompareLinks(page, bot, chatId, jsonFile, jsonNewFile, jsonRemovedFile);

    await browser.close();

    // Return newLinks if there are new links, otherwise return false
    return newLinks.length > 0 ? newLinks : false;
}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

async function extractAndCompareLinks(page, bot, chatId, jsonFile, jsonNewFile, jsonRemovedFile) {
    const extractedLinks = await page.evaluate(() => {
        const elements = document.querySelectorAll('div.css-at0k0c-DivWrapper a');
        return Array.from(elements).map(a => a.href);
    });

    if (extractedLinks.length === 0) {
        return [];
    }

    let existingLinks = [];
    try {
        const data = await fs.readFile(jsonFile);
        existingLinks = JSON.parse(data);
    } catch (error) {
        console.error('Error reading links.json:', error);
    }

    const newLinks = extractedLinks.filter(link => !existingLinks.includes(link));
    const removedLinks = existingLinks.filter(link => !extractedLinks.includes(link));

    if (newLinks.length > 0) {
        const updatedLinks = [...existingLinks, ...newLinks];
        await fs.writeFile(jsonFile, JSON.stringify(updatedLinks, null, 2));
        await fs.writeFile(jsonNewFile, JSON.stringify(newLinks, null, 2));
    }

    if (removedLinks.length > 0) {
        await fs.writeFile(jsonRemovedFile, JSON.stringify(removedLinks, null, 2));
    }

    const message = `New Links:\n${newLinks.join('\n')}\n`;
    await bot.sendMessage(chatId, message);

    return newLinks;
}

module.exports = { CheckVideos };
