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

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function postReels(videoPath, botToken, chatId, caption) {
    const bot = new TelegramBot(botToken);
    //Генерируем уникальный идентификатор для каталога userDataDir
    const username = 'modeler_bib0v5';
    const password = '6nGEpcc9FrxN';

    const browser = await puppeteer.launch({
        args: [
         '--no-sandbox',
         `--proxy-server=http://46.30.189.50:11313`,
        ],
        headless: false,
        executablePath: executablePath(),
        userDataDir: './instProfile'
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


    await page.goto("https://privacycenter.instagram.com/policy/?entry_point=ig_help_center_data_policy_redirect", { waitUntil: 'domcontentloaded', headless: "new" });
    await sleep(1500+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await sleep(5000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '1.png', bot, chatId);

    const allow_all_cookie = '#cookie-policy-banner > div.xcq4dyp > div > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli.xamitd3.xsyo7zv.x16hj40l.x10b6aqq.x1yrsyyn > div > div > div:nth-child(1) > div > div > div.x6s0dn4.x78zum5.xl56j7k.x1608yet.xljgi0e.x1e0frkt'
    await cursor.move(allow_all_cookie)
    await cursor.click(allow_all_cookie)
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '2.png', bot, chatId);

    console.log("Successfully posted");
    await browser.close();

    await fs.unlink(videoPath);
}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

postReels('./video.mp4',"6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs","819850346", 'Link in bio #crypto #signals #profit #guide #binance #easycrypto');