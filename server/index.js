const TelegramBot = require('node-telegram-bot-api');

const token = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';

const bot = new TelegramBot(token, {polling: true});

const webAppUrl = 'https://www.npmjs.com/package/node-telegram-bot-api'
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Hi its uploader controller', {
    reply_markup:{
      inline_keyboard: [
        [{text:'Launch app', web_app: {url:webAppUrl}}]
      ]
    }
  });
});