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
    let extractedLinks = [];
    let previousHeight;
    let scrollAttempts = 0;

    while (scrollAttempts < 10) {  // Adjust the number of attempts based on the page's length and loading speed
        const newLinks = await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
            return Array.from(document.querySelectorAll('div.css-at0k0c-DivWrapper a')).map(a => a.href);
        });
        scrollAttempts++
        // if (newLinks.length === extractedLinks.length) {
        //     scrollAttempts++;
        // } else {
        //     scrollAttempts = 0;
        // }

        extractedLinks = newLinks;

        // Wait for content to load
        await sleep(2000 + Math.floor(Math.random() * (2000 - 500 + 1)) + 500);
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

const botToken = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';
    const chatId = '819850346';
    const jsonFile = "../../data/links/links.json";
    const jsonNewFile = "../../data/links/newLinks.json";
    const jsonRemovedFile = "../../data/links/removedLinks.json";
    const link = "https://www.tiktok.com/@tema.black?_t=8oSqanmYPmq&_r=1";


    // Fetch new and removed links
CheckVideos(botToken, chatId, jsonFile, jsonNewFile, jsonRemovedFile, link);