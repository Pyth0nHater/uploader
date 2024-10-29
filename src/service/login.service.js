const puppeteer = require('puppeteer-extra');
const fs = require('fs').promises;
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { createCursor, installMouseHelper, randomMove } = require("ghost-cursor")
const TelegramBot = require('node-telegram-bot-api');
puppeteer.use(StealthPlugin());
const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function loginGetCookies(id) {
    const profile = id
    // const profile = await Profile.findById(id)
    const botToken = "6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs";
    const bot = new TelegramBot(botToken);
    const chatId = profile.chatId
    
    const browser = await puppeteer.launch({
                 args: [
          '--no-sandbox',
                        ],
        userDataDir: `profiles/${profile.login}`,
        headless: true,
    });
    const page = await browser.newPage();
    const cursor = createCursor(page);
    await installMouseHelper(page)
    await cursor.toggleRandomMove(true)

    const customUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
    await page.setUserAgent(customUA);

    // await page.goto("https://privacycenter.instagram.com/policy/?entry_point=ig_help_center_data_policy_redirect", { waitUntil: 'domcontentloaded', headless: "new" });
    // await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    // await takeScreenshot(page, '1.png', bot, chatId);

    // const allow_all_cookie = '#cookie-policy-banner > div.xcq4dyp > div > div.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli.xamitd3.xsyo7zv.x16hj40l.x10b6aqq.x1yrsyyn > div > div > div:nth-child(1) > div > div > div.x6s0dn4.x78zum5.xl56j7k.x1608yet.xljgi0e.x1e0frkt'
    // await cursor.move(allow_all_cookie)
    // await cursor.click(allow_all_cookie)
    // await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    // await takeScreenshot(page, '2.png', bot, chatId);

    
    await sendMessage('Agree login from phone', bot, chatId);
    
    await page.goto("https://www.instagram.com/", { waitUntil: 'domcontentloaded' });
    await sleep(3000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
    await takeScreenshot(page, '1.png', bot, chatId);


    const login_input = '#loginForm > div > div:nth-child(1) > div > label > input'

    await page.waitForSelector(login_input)
    await cursor.move(login_input)
    await cursor.click(login_input)
    await page.type(login_input, profile.login, {delay: 100});
    await takeScreenshot(page, '2.png', bot, chatId);
    await sleep(1000+Math.floor(Math.random() * (1000 - 500 + 1)) + 500)

    const password_input = '#loginForm > div > div:nth-child(2) > div > label > input'
    await cursor.move(password_input)
    await cursor.click(password_input)
    await page.type(password_input, profile.password, {delay: 150});
    await takeScreenshot(page, '3.png', bot, chatId);

    const login_btn = '#loginForm > div > div:nth-child(3) > button'
    await cursor.move(login_btn)
    await cursor.click(login_btn)
    await takeScreenshot(page, '4.png', bot, chatId);
    await sleep(15000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)


    const newpost_btn = 'svg[aria-label="New post"]'  
    let isExist = (await page.$(newpost_btn)) || "";
    if (isExist){
        await page.click(newpost_btn)
        await sleep(10000+Math.floor(Math.random() * (3000 - 500 + 1)) + 500)
        await takeScreenshot(page, '5.png', bot, chatId);
        await browser.close();
        return true
    }

    await takeScreenshot(page, '5.png', bot, chatId);
    await browser.close();
    return false

}

async function takeScreenshot(page, filename, bot, chatId) {
    const screenshotPath = `./${filename}`;
    await page.screenshot({ path: screenshotPath });
    const screenshot = await fs.readFile(screenshotPath);
    await bot.sendPhoto(chatId, screenshot);
    await fs.unlink(screenshotPath);
}

async function sendMessage(message, bot, chatId) {
    await bot.sendMessage(chatId, message);
}

module.exports = loginGetCookies;
// loginGetCookies("6698fb32a9b8173255b766d2")
