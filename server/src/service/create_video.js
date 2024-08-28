const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Функция для выбора случайного видео из папки
function getRandomVideoFromFolder(folderPath) {
  // Получаем список всех файлов в папке
  const files = fs.readdirSync(folderPath);

  // Фильтруем файлы, оставляя только видеофайлы (например, с расширениями .mp4, .mkv)
  const videoFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp4', '.mkv', '.avi', '.mov', '.MP4'].includes(ext);
  });

  if (videoFiles.length === 0) {
    throw new Error('В папке нет видеофайлов.');
  }

  // Выбираем случайный файл из списка видеофайлов
  const randomIndex = Math.floor(Math.random() * videoFiles.length);
  const randomVideo = videoFiles[randomIndex];

  // Возвращаем полный путь к выбранному видеофайлу
  return path.join(folderPath, randomVideo);
}

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
function addTextToVideo(randomVideoPath) {
  const quotes = readQuotesFromFile();
  const selectedQuotes = quotes.splice(0, 2); // выберем две первые цитаты
  writeQuotesToFile(quotes); // обновим файл, удалив использованные цитаты
  
  const text1 = "CRYPTO WORLD";
  const text2 = splitText(selectedQuotes[0]);
  const text3 = splitText(selectedQuotes[1]);
  const text4 = "Ты изучишь трейдинг за 30 дней если подпишешься на телеграмм канал по ссылке в профиле";
  
  // Укажите путь для сохранения выходного видео
  const outputVideoPath = '../../videos/66cb6e8c3b53d62a5e875fe8_unique.mp4';
  
  // Функция для создания фильтра drawtext для каждой строки текста
  function createDrawTextFilter(textLines, startY, fontSize = 27) {
    return textLines.map((line, index) => 
      `drawtext=text='${line}':fontfile=font.ttf:fontcolor=white:fontsize=${fontSize}:x=(w-text_w)/2:y=${startY + (index * (fontSize + 10))}`
    ).join(',');
  }
  
  // Создание фильтра drawtext для каждого блока текста
  const text1Filter = `drawtext=text='${text1}':fontfile=font.ttf:fontcolor=white:fontsize=60:x=(w-text_w)/2:y=190`;
  const text2Filter = createDrawTextFilter(text2, 450);
  const text3Filter = createDrawTextFilter(text3, 600);
  const text4Filter = createDrawTextFilter(splitText(text4), 950);
  
  ffmpeg.ffprobe(randomVideoPath, function(err, metadata) {
    if (err) {
      console.error('Ошибка при получении информации о видео:', err.message);
      return;
    }
  
    // Разрешение видео
    const width = metadata.streams[0].width;
    const height = metadata.streams[0].height;
  
    console.log(`Разрешение видео: ${width}x${height}`);
  });

  // Добавление текста на видео с помощью ffmpeg
  ffmpeg(randomVideoPath)
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

// Пример использования
const folderPath = '../creos'; // Замените 'videos' на путь к вашей папке с видео
try {
  const randomVideoPath = getRandomVideoFromFolder(folderPath);
  console.log('Выбранное случайное видео:', randomVideoPath);
  addTextToVideo(randomVideoPath);
} catch (err) {
  console.error(err.message);
}
