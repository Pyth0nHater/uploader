const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = 3000;

// Replace with your actual MongoDB connection string
const mongoUri = 'mongodb://localhost:27017/test';
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a simple schema and model
const userSchema = new mongoose.Schema({
  chatId: { type: Number, required: true },
  username: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const token = '6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs';
const bot = new TelegramBot(token, { polling: true });

const webAppUrl = 'https://www.npmjs.com/package/node-telegram-bot-api';

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  // Save user to the database
  try {
    let user = await User.findOne({ chatId });
    if (!user) {
      user = new User({ chatId, username });
      await user.save();
    }
  } catch (error) {
    console.error('Error saving user to MongoDB', error);
  }

  bot.sendMessage(chatId, 'Hi its uploader controller', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Launch app', web_app: { url: webAppUrl } }]
      ]
    }
  });
});

app.get('/', (req, res) => {
  res.send('Hello, this is the server for the Telegram bot!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
