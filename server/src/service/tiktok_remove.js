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
    
    const proxyServer = "http://46.30.189.50:11807"; // Replace with your proxy server and port
    const proxyUsername = "modeler_tCt7nu"; // Replace with your proxy username
    const proxyPassword = "VUE7m5So2BP3"; // Replace with your proxy password

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            `--proxy-server=${proxyServer}`,
            `--window-size=1920,1080`
        ],
        userDataDir: "../../data/profiles/tiktok",
        headless: false,
    });
    const page = await browser.newPage();
    await page.authenticate({ username: proxyUsername, password: proxyPassword });

    const cursor = createCursor(page);
    await installMouseHelper(page);
    cursor.toggleRandomMove(true);

    const customUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
    await page.setUserAgent(customUA);

    await page.goto("https://www.tiktok.com/@user2774739496871", { waitUntil: 'domcontentloaded' });
    await sleep(5000 + Math.floor(Math.random() * 3000));
    await takeScreenshot(page, '1.png', bot, chatId);


    const refresh_btn = "#main-content-others_homepage > div > div.css-833rgq-DivShareLayoutMain.ee7zj8d4 > main > div > button"
    let isExist = (await page.$(refresh_btn)) || "";

    if(isExist){
        await cursor.move(refresh_btn);
        await cursor.click(refresh_btn);
        await sleep(3000 + Math.floor(Math.random() * 3000));
        await takeScreenshot(page, '3.png', bot, chatId);
    }

    const video = "#main-content-others_homepage > div > div.css-833rgq-DivShareLayoutMain.ee7zj8d4 > div.css-1qb12g8-DivThreeColumnContainer.eegew6e2 > div > div:nth-child(1)";
    await cursor.move(video);
    await cursor.click(video);
    await sleep(2000 + Math.floor(Math.random() * 3000));
    await takeScreenshot(page, '3.png', bot, chatId);

    for (let i = 0; i<3; i++){
    const settings_btn = "#app > div.css-14dcx2q-DivBodyContainer.e1irlpdw0 > div:nth-child(4) > div > div.css-1qjw4dg-DivContentContainer.e1mecfx00 > div.css-1stfops-DivCommentContainer.ekjxngi0 > div > div.css-1xlna7p-DivProfileWrapper.ekjxngi4 > div.css-1u3jkat-DivDescriptionContentWrapper.e1mecfx011 > div.css-85dfh6-DivInfoContainer.evv7pft0 > div";
    await cursor.move(settings_btn);
    await sleep(1500 + Math.floor(Math.random() * 3000));
    const delete_btn = "#app > div.css-14dcx2q-DivBodyContainer.e1irlpdw0 > div:nth-child(4) > div > div.css-1qjw4dg-DivContentContainer.e1mecfx00 > div.css-1stfops-DivCommentContainer.ekjxngi0 > div > div.css-1xlna7p-DivProfileWrapper.ekjxngi4 > div.css-1u3jkat-DivDescriptionContentWrapper.e1mecfx011 > div.css-85dfh6-DivInfoContainer.evv7pft0 > div > div > ul > li:nth-child(2)"
    await page.click(delete_btn);
    const delete_btn_text = "#app > div.css-14dcx2q-DivBodyContainer.e1irlpdw0 > div:nth-child(4) > div > div.css-1qjw4dg-DivContentContainer.e1mecfx00 > div.css-1stfops-DivCommentContainer.ekjxngi0 > div > div.css-1xlna7p-DivProfileWrapper.ekjxngi4 > div.css-1u3jkat-DivDescriptionContentWrapper.e1mecfx011 > div.css-85dfh6-DivInfoContainer.evv7pft0 > div > div > ul > li:nth-child(2) > button"
    await page.click(delete_btn_text);
    await sleep(1000 + Math.floor(Math.random() * 3000));
    await takeScreenshot(page, '4.png', bot, chatId);

    const delete_btn_2 = "#tux-portal-container > div > div:nth-child(2) > div > div > div.css-17s26nl-ModalContentContainer.e1wuf0b31 > div > div > section > button.css-zml7cv-ButtonConfirm.e1qpteip1"
    await page.click(delete_btn_2);
    await sleep(4000 + Math.floor(Math.random() * 3000));
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