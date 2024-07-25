const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const profileRoutes = require('./src/routes/profile.routes');


const app = express();
const port = 3000;

// Middleware для обработки JSON тела запросов
app.use(express.json());

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


// Маршруты для профилей
app.use('/profiles', profileRoutes);

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
