const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const profileRoutes = require('./src/routes/profile.routes');
const cors = require('cors');
const authRoutes = require('./src/routes/cookie.routes');
const reelsRoute = require('./src/routes/reels.routes');

const app = express();
const port = 5000;

// Middleware для обработки JSON тела запросов
app.use(express.json());
app.use(cors());

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/test');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Ошибка подключения к MongoDB:'));
db.once('open', () => {
  console.log('Подключено к MongoDB');
});

// Замените на ваш токен Telegram бота
const token = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';
const bot = new TelegramBot(token, { polling: true });

const webAppUrl = 'https://m6b2dnnd-3000.euw.devtunnels.ms/home'
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
// Маршруты для профилей
app.use('/profiles', profileRoutes);
app.use('/cookies', authRoutes);
app.use('/', reelsRoute)

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
