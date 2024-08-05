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


dotenv.config();
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function postReels(videoPath, botToken, chatId, caption) {
    const bot = new TelegramBot(botToken);
    const username = process.env.login;
    const password = process.env.password;
    const ip = process.env.ip;
    console.log(username, password, ip)

    const browser = await puppeteer.launch({
        args: [
         '--no-sandbox',
         `--proxy-server=${ip}`,
        ],
        headless: false,
        executablePath: executablePath(),
       // userDataDir: './instProfile'
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
    const cookies = JSON.parse(await fs.readFile('./cookie_progrev.json'));
    await page.setCookie(...cookies);

    await page.goto("https://www.instagram.com/", { waitUntil: 'domcontentloaded', headless: "new" });
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '1.png', bot, chatId);

    const turnoff_btn = 'button[class="_a9-- _ap36 _a9_1"]'
    await cursor.move(turnoff_btn)
    await cursor.click(turnoff_btn)
    await sleep(5000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '2.png', bot, chatId);

    const search_btn = 'svg[aria-label="Search"]'
    await cursor.move(search_btn)
    await cursor.click(search_btn)
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '2.png', bot, chatId);


    const search_input = 'input[aria-label="Search input"]'
    await page.type(search_input, caption, {delay: 100});
    await sleep(10000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '9.png', bot, chatId);


    const first_hashtag = 'div[class="x9f619 xjbqb8w x78zum5 x168nmei x13lgxp2 x5pf9jr xo71vjh xxbr6pl xbbxn1n xwib8y2 x1y1aw1k x1uhb9sk x1plvlek xryxfnj x1c4vz4f x2lah0s xdt5ytf xqjyukv x1qjc9v5 x1oa3qoh x1nhvcw1"]'
    await cursor.move(first_hashtag)
    await cursor.click(first_hashtag)
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '2.png', bot, chatId);


    const reload_page = 'div[class="x1i10hfl xjqpnuy xa49m3k xqeqjp1 x2hbi6w x972fbf xcfux6l x1qhh985 xm0m39n xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x18d9i69 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x1lku1pv x1a2a7pz x6s0dn4 xjyslct x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1ejq31n xd10rxx x1sy0etr x17r0tee x9f619 x9bdzbf x1ypdohk x78zum5 x1f6kntn xwhw2v2 xl56j7k x17ydfre x1n2onr6 x2b8uid xlyipyv x87ps6o x14atkfc xcdnw81 x1i0vuye xn3w4p2 x5ib6vp xc73u3c x1tu34mt xzloghq"]'

    let isExist = (await page.$(reload_page)) || "";
    if(isExist){
        await cursor.move(reload_page);
        await cursor.click(reload_page);
        await sleep(7000 + Math.floor(Math.random() * 3000));
        await takeScreenshot(page, '3.png', bot, chatId);
    }

    const first_video = 'div[class="x1lliihq x1n2onr6 xh8yej3 x4gyw5p x2pgyrj x56m6dy x1ntc13c xn45foy x9i3mqj"]'
    await cursor.move(first_video);
    await cursor.click(first_video);
    await sleep(7000 + Math.floor(Math.random() * 3000));
    await takeScreenshot(page, '3.png', bot, chatId);


    const rightBtnSelector = 'button[class="_abl-"]';
    await page.click(rightBtnSelector);
    await sleep(15000 + Math.floor(Math.random() * (5000 - 500 + 1)) + 500);

    const videosCounter = Math.floor(Math.random() * (40 - 20 + 1)) + 20;
    for (let i = 0; i < videosCounter; i++) {
        await page.keyboard.press('ArrowRight');
        await sleep(15000 + Math.floor(Math.random() * (5000 - 500 + 1)) + 500);
    }

}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

//module.exports = { postReels };
postReels('./video.mp4',"6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs","819850346", '#крипта');
