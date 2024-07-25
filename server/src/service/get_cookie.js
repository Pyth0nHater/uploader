const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createCursor, installMouseHelper, randomMove } = require("ghost-cursor")
const TelegramBot = require('node-telegram-bot-api');
puppeteer.use(StealthPlugin());

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function getCookies(botToken, chatId, cookieFile) {
    const bot = new TelegramBot(botToken);

    const browser = await puppeteer.launch({
                 args: [
          '--no-sandbox',
         ],
        userDataDir: '../../data/profiles/Profile 9',
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
    await fs.writeFile(cookieFile, JSON.stringify(cookies, null, 2));
    await takeScreenshot(page, '2.png', bot, chatId);

    console.log("successfully auth");

}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

// module.exports = getCookies;
getCookies("6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs", "819850346", "./autocookie.json")
