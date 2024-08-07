// const allow_cookie = 'button[class="_a9-- _ap36 _a9_0"]'
// await cursor.move(allow_cookie)
// await cursor.click(allow_cookie)

const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');
const { createCursor, installMouseHelper } = require("ghost-cursor");
puppeteer.use(StealthPlugin());
const dotenv = require('dotenv');
const Profile = require('../models/profile');


dotenv.config();
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function scrollReels(id) {
    // const profile = await Profile.findById(id)
    const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
    const bot = new TelegramBot(botToken);
    // const chatId = profile.chatId
    const chatId = "819850346"

    
    const username = process.env.login;
    const password = process.env.password;
    const ip = process.env.ip;
    console.log(username, password, ip)

    const browser = await puppeteer.launch({
        args: [
         '--no-sandbox',
        ],
        headless: false,
        executablePath: executablePath(),
        userDataDir: `../../profiles/${id}`
    });
    const page = await browser.newPage();
    await page.authenticate({
        username: username,
        password: password,
    });
    const cursor = createCursor(page);
    await installMouseHelper(page)
    await cursor.toggleRandomMove(true);

    // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    // const cookies = profile.cookie
    // await page.setCookie(...cookies);

    await page.goto("https://www.instagram.com/", { waitUntil: 'domcontentloaded', headless: "new" });
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '1.png', bot, chatId);


    const turnoff_btn = 'button[class="_a9-- _ap36 _a9_1"]'

    let isExist = (await page.$(turnoff_btn)) || "";
    if(isExist){
        await cursor.move(turnoff_btn)
        await cursor.click(turnoff_btn)
        await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
        await takeScreenshot(page, '2.png', bot, chatId);
    }


    const reels_btn = 'svg[aria-label="Reels"]'
    await cursor.move(reels_btn)
    await cursor.click(reels_btn)
    await cursor.moveTo({x: 500, y:640})
    await sleep(5000 + Math.floor(Math.random() * (5000 - 500 + 1)) + 500);
    await takeScreenshot(page, '2.png', bot, chatId);

    const videosCounter = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
    for (let i = 0; i < videosCounter; i++) {
        await page.mouse.wheel({deltaY: 1000});
        await sleep(1000 + Math.floor(Math.random() * (10000 - 500 + 1)) + 500);
    }

    await browser.close()

}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

module.exports = { scrollReels };
// scrollReels('6698fb32a9b8173255b766d2');
