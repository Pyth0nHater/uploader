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

async function postReels(id) {
    // const profile = await Profile.findById(id)
    const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
    const bot = new TelegramBot(botToken);
    const chatId = profile.chatId
    const caption = profile.description

    const username = process.env.login;
    const password = process.env.password;
    const ip = process.env.ip;
    console.log(username, password, ip)

    const browser = await puppeteer.launch({
        args: [
         '--no-sandbox',
        ],
        headless: true,
        executablePath: executablePath(),
        userDataDir: `./test`
    });
    const page = await browser.newPage();
    await page.authenticate({
        username: username,
        password: password,
    });
    const cursor = createCursor(page);
    await installMouseHelper(page)
    await cursor.toggleRandomMove(true);

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    // const cookies = JSON.parse(await fs.readFile('./autocookie.json'));
    // await page.setCookie(...cookies);

    await page.goto("https://studio.youtube.com/channel/UCqnhUcGkFLwiW0yqkFvUlcw/videos/upload?d=ud&filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D");
    await sleep(5000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)

    const elementHandle = await page.$('input[type="file"]');
    await elementHandle.uploadFile('./video.mp4');
    await sleep(5000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)

    await cursor.move('#textbox')
    await cursor.click('#textbox')
    const input = await page.$$('#textbox');
    await input[0].click({ clickCount: 3 })    
    await input[0].type('#textbox', 'Link in bio', {delay: 100})
    await sleep(2000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)

    await input[0].type('#textbox', 'zxc', {delay: 100})
    await sleep(2000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)


    await cursor.move('#offRadio')
    await cursor.click('#offRadio')
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)

    await cursor.move('#next-button > div')
    await cursor.click('#next-button > div')
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)

    await cursor.move('#next-button > div')
    await cursor.click('#next-button > div')
    await sleep(20000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500) //10 min

    
    await cursor.move('#next-button > div')
    await cursor.click('#next-button > div')
    await sleep(5000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    
    const forAllUser = await page.$$('#radioContainer');
    await forAllUser[2].move()
    await forAllUser[2].click()
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)

    await cursor.move('#done-button > div')
    await cursor.click('#done-button > div')
    await sleep(10000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
}


postReels()