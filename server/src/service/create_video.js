const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

// Укажите путь к JSON файлу с цитатами
const quotesFilePath = path.join(__dirname, 'quotes.json');

// Функция для чтения цитат из JSON файла
function readQuotesFromFile() {
  const data = fs.readFileSync(quotesFilePath, 'utf8');
  return JSON.parse(data);
}

// Функция для записи обновленных цитат в JSON файл
function writeQuotesToFile(quotes) {
  const data = JSON.stringify(quotes, null, 2); // форматирование JSON для удобного чтения
  fs.writeFileSync(quotesFilePath, data, 'utf8');
}

// Функция для разбивки текста на строки длиной не более 100 символов
function splitText(text, maxLength = 47) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxLength) {
      lines.push(currentLine.trim());
      currentLine = '';
    }
    currentLine += word + ' ';
  });

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines;
}

// Основная функция для добавления текста на видео
function addTextToVideo() {
  const quotes = readQuotesFromFile();
  const selectedQuotes = quotes.splice(0, 2); // выберем две первые цитаты
  writeQuotesToFile(quotes); // обновим файл, удалив использованные цитаты
  
  const text1 = "CRYPTO WORLD";
  const text2 = splitText(selectedQuotes[0]);
  const text3 = splitText(selectedQuotes[1]);
  const text4 = "Ты изучишь трейдинг за 30 дней если подпишешься на телеграмм канал по ссылке в профиле";
  
  // Укажите путь к исходному видео
  const inputVideoPath = path.join(__dirname, 'input.mp4');
  // Укажите путь для сохранения выходного видео
  const outputVideoPath = '../../videos/66cb6e8c3b53d62a5e875fe8_unique.mp4';
  
  // Функция для создания фильтра drawtext для каждой строки текста
  function createDrawTextFilter(textLines, startY, fontSize = 31) {
    return textLines.map((line, index) => 
      `drawtext=text='${line}':fontfile=font.ttf:fontcolor=white:fontsize=${fontSize}:x=(w-text_w)/2:y=${startY + (index * (fontSize + 10))}`
    ).join(',');
  }
  
  // Создание фильтра drawtext для каждого блока текста
  const text1Filter = `drawtext=text='${text1}':fontfile=font.ttf:fontcolor=white:fontsize=50:x=(w-text_w)/2:y=100`;
  const text2Filter = createDrawTextFilter(text2, 450);
  const text3Filter = createDrawTextFilter(text3, 600);
  const text4Filter = createDrawTextFilter(splitText(text4), 1050);
  
  // Добавление текста на видео с помощью ffmpeg
  ffmpeg(inputVideoPath)
    .outputOptions(
      '-vf',
      `${text1Filter},${text2Filter},${text3Filter},${text4Filter}`
    )
    .on('start', () => {
      console.log('Начинается обработка видео...');
    })
    .on('error', (err) => {
      console.error('Ошибка: ' + err.message);
    })
    .on('end', () => {
      console.log('Видео успешно обработано и сохранено в ' + outputVideoPath);
    })
    .save(outputVideoPath);
  
}

// Экспортируем функцию
module.exports = addTextToVideo;
