const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const { createCursor, installMouseHelper } = require("ghost-cursor");
const dotenv = require('dotenv');
const { downloadVideo } = require('./videoDownloader');
const { postReels } = require('./upload');

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
    await sleep(10000 + Math.floor(Math.random() * (3000 - 500 + 1)) + 500);

    await takeScreenshot(page, '1.png', bot, chatId);
    await extractAndCompareLinks(page, bot, chatId, jsonFile, jsonNewFile, jsonRemovedFile);

    await browser.close();
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

    const message = `New Links:\n${newLinks.join('\n')}\n\nRemoved Links:\n${removedLinks.join('\n')}`;
    await bot.sendMessage(chatId, message);

    for (const url of newLinks) {
        try {
            await downloadVideo(url);
            await postReels('./video.mp4', "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs", "819850346", 'Link in bio #crypto #signals #profit #guide #binance #easycrypto');

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

function startRecurringTask() {
    const botToken = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';
    const chatId = '819850346';
    const jsonFile = "./links.json";
    const jsonNewFile = "./newLinks.json";
    const jsonRemovedFile = "./removedLinks.json";
    const link = "https://www.tiktok.com/@bestbet012?_t=8nlbx15xTWx&_r=1";

    CheckVideos(botToken, chatId, jsonFile, jsonNewFile, jsonRemovedFile, link);

    setInterval(() => {
        CheckVideos(botToken, chatId, jsonFile, jsonNewFile, jsonRemovedFile, link);
    }, 10 * 60 * 1000);
}

startRecurringTask();
