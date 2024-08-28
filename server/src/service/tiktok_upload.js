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
    
    const caption = "link in bio!";
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

    const customUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
    await page.setUserAgent(customUA);

    // const cookies = JSON.parse(await fs.readFile('../../data/cookies/tiktok_cookie.json'));
    // await page.setCookie(...cookies);

    for (let i=0; i<6; i++){
        
        await page.goto("https://www.tiktok.com/tiktokstudio/upload?from=upload", { waitUntil: 'domcontentloaded' });
        await sleep(20000 + Math.floor(Math.random() * 3000));
        await takeScreenshot(page, '1.png', bot, chatId);

        // const cookies = await page.cookies();
        // await fs.writeFile("./autocookie.json", JSON.stringify(cookies, null, 2));

        const elementHandle = await page.$('input[type="file"]');
        await elementHandle.uploadFile('./video.mp4');
        await sleep(60000 + Math.floor(Math.random() * 3000));
        await takeScreenshot(page, '2.png', bot, chatId);

        const description = "#root > div > div.css-11nu78w.eosfqul1 > div.css-17xtaid.eyoaol20 > div > div > div > div > div > div > div.jsx-1834783807.contents-v2.reverse > div.jsx-3648897903.form-v2.reverse > div.jsx-642205229.caption-wrap-v2 > div > div.jsx-1809346759.caption-markup > div.jsx-1809346759.caption-editor > div > div.DraftEditor-editorContainer > div > div > div > div";
        await cursor.move(description);
        await cursor.click(description);
        await page.type(description, caption, {delay: 100});
        await sleep(5000 + Math.floor(Math.random() * 3000));
        await takeScreenshot(page, '3.png', bot, chatId);

        const post_btn = "#root > div > div.css-11nu78w.eosfqul1 > div.css-17xtaid.eyoaol20 > div > div > div > div > div > div > div.jsx-1834783807.contents-v2.reverse > div.jsx-3648897903.form-v2.reverse > div.jsx-3648897903.button-row > div.jsx-3648897903.btn-post > button > div";
        await cursor.move(post_btn);
        await cursor.click(post_btn);
        await sleep(15000 + Math.floor(Math.random() * 3000));
        await takeScreenshot(page, '4.png', bot, chatId);
    }
    await browser.close();
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