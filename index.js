const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const profileRoutes = require('./src/routes/profile.routes');
const cors = require('cors');
const authRoutes = require('./src/routes/login.routes');
// const { main } = require('./src/service/main'); // Импортируем вашу функцию main

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

const webAppUrl = 'https://m6b2dnnd-3000.euw.devtunnels.ms/home';
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Hi its uploader controller', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Launch app', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

// Маршруты для профилей
app.use('/profiles', profileRoutes);
app.use('/', authRoutes);
// app.use('/tiktok', tiktokRoutes);

// Новый эндпоинт для запуска процесса обработки и загрузки видео
// app.post('/process/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Запускаем основную функцию для обработки TikTok видео
//     main(id);
//     res.status(200).send({ message: `Processing started for profile with ID: ${id}` });
//   } catch (error) {
//     console.error('Error processing profile:', error);
//     res.status(500).send({ message: 'An error occurred while processing the profile', error: error.message });
//   }
// });

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
