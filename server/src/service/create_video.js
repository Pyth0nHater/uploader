const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const quotesFilePath = path.join(__dirname, 'quotes.json');

// Функция для выбора случайного видео из папки
function getRandomVideoFromFolder(folderPath) {
  const files = fs.readdirSync(folderPath);
  const videoFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp4', '.mkv', '.avi', '.mov', '.MP4'].includes(ext);
  });

  if (videoFiles.length === 0) {
    throw new Error('В папке нет видеофайлов.');
  }

  const randomIndex = Math.floor(Math.random() * videoFiles.length);
  const randomVideo = videoFiles[randomIndex];
  return path.join(folderPath, randomVideo);
}

function readQuotesFromFile() {
  const data = fs.readFileSync(quotesFilePath, 'utf8');
  return JSON.parse(data);
}

function writeQuotesToFile(quotes) {
  const data = JSON.stringify(quotes, null, 2);
  fs.writeFileSync(quotesFilePath, data, 'utf8');
}

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

// Основная функция для обработки видео
function processVideo(id) {
  const folderPath = '../creos'; // Путь к папке с видео
  const randomVideoPath = getRandomVideoFromFolder(folderPath); // Выбор случайного видео

  const quotes = readQuotesFromFile();
  const selectedQuotes = quotes.splice(0, 2);
  writeQuotesToFile(quotes);
  
  const text1 = "CRYPTO WORLD";
  const text2 = splitText(selectedQuotes[0]);
  const text3 = splitText(selectedQuotes[1]);
  const text4 = "Ты изучишь трейдинг за 30 дней если подпишешься на телеграмм канал по ссылке в профиле";
  
  const outputVideoPath = `../../videos/${id}_unique.mp4`; // Использование id для имени выходного файла

  function createDrawTextFilter(textLines, startY, fontSize) {
    return textLines.map((line, index) => 
      `drawtext=text='${line}':fontfile=font.ttf:fontcolor=white:fontsize=${fontSize}:x=(w-text_w)/2:y=${startY + (index * (fontSize + 10))}`
    ).join(',');
  }

  ffmpeg.ffprobe(randomVideoPath, function(err, metadata) {
    if (err) {
      console.error('Ошибка при получении информации о видео:', err.message);
      return;
    }

    const width = metadata.streams[0].width;
    const height = metadata.streams[0].height;
    
    console.log(`Разрешение видео: ${width}x${height}`);

    const fontSize1 = Math.floor(width * 0.1); // 10% от ширины для заголовка
    const fontSize2 = Math.floor(width * 0.041); // 4.1% от ширины для цитат
    const fontSize3 = Math.floor(width * 0.041); // 4.1% от ширины для второй цитаты
    const fontSize4 = Math.floor(width * 0.041); // 4.1% от ширины для последнего текста

    const text1Filter = `drawtext=text='${text1}':fontfile=font.ttf:fontcolor=white:fontsize=${fontSize1}:x=(w-text_w)/2:y=${Math.floor(height * 0.12)}`;
    const text2Filter = createDrawTextFilter(text2, Math.floor(height * 0.35), fontSize2);
    const text3Filter = createDrawTextFilter(text3, Math.floor(height * 0.5), fontSize3);
    const text4Filter = createDrawTextFilter(splitText(text4), Math.floor(height * 0.7), fontSize4);

    ffmpeg(randomVideoPath)
      .setDuration(7) // Обрезка видео до 7 секунд
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
        console.log(`Видео успешно обработано и сохранено в ${outputVideoPath}`);
      })
      .save(outputVideoPath);
  });
}

// Экспорт функции для использования в других модулях
processVideo('test')
module.exports = { processVideo };
