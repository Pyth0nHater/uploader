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

async function getCookies(botToken, chatId, login, pass, cookieFile) {
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

    await page.goto("https://www.tiktok.com/@bestbet012?_t=8nlbx15xTWx&_r=1", { waitUntil: 'domcontentloaded', headless: "new" });
    await sleep(10000 + Math.floor(Math.random() * (3000 - 500 + 1)) + 500);

    await takeScreenshot(page, '1.png', bot, chatId);
    await extractAndCompareLinks(page, bot, chatId);

    await browser.close();
}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

async function extractAndCompareLinks(page, bot, chatId) {
    const extractedLinks = await page.evaluate(() => {
        const elements = document.querySelectorAll('div.css-at0k0c-DivWrapper a');
        return Array.from(elements).map(a => a.href);
    });

    const existingLinks = JSON.parse(await fs.readFile('./links.json'));

    const newLinks = extractedLinks.filter(link => !existingLinks.includes(link));
    const removedLinks = existingLinks.filter(link => !extractedLinks.includes(link));

    if (newLinks.length > 0 || removedLinks.length > 0) {
        await fs.writeFile('./links.json', JSON.stringify(extractedLinks, null, 2));
    }

    const message = `New Links:\n${newLinks.join('\n')}\n\nRemoved Links:\n${removedLinks.join('\n')}`;
    await bot.sendMessage(chatId, message);
}

// Function to start the recurring task
function startRecurringTask() {
    // Run the getCookies function immediately
    getCookies("6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs", "819850346", "cryptoeasyprofit", "Ii1492004", "./autocookie.json");

    // Schedule the getCookies function to run every 10 minutes
    setInterval(() => {
        getCookies(botToken, chatId, login, pass, cookieFile);
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
}

// Start the recurring task
startRecurringTask();
