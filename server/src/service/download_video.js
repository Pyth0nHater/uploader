const { TiktokDownloader } = require("@tobyg74/tiktok-api-dl");
const axios = require("axios");
const fs = require("fs");

const tiktokUrl = 'https://www.tiktok.com/@bestbet012/video/7365163179460152609';

function downloadVideo(url) {
  TiktokDownloader(url, {
    version: "v3"
  }).then((result) => {
    console.log(`Скачивание видео ${url}`);
    axios({
      url: result.result.video1,
      method: 'GET',
      responseType: 'stream'
    }).then(response => {
      const fileName = `video.mp4`; // Уникальное имя файла с использованием временной метки
      const videoPath = `./${fileName}`;
      response.data.pipe(fs.createWriteStream(videoPath));
      console.log(`Видео успешно сохранено в файл ${fileName}`);
    }).catch(error => {
      console.error('Ошибка при скачивании видео:', error);
      // Можно добавить обработку ошибок здесь
    });
  }).catch((error) => {
    console.error('Ошибка:', error);
    // Можно добавить обработку ошибок здесь
  });
}

// Экспорт функции downloadVideo
module.exports = { downloadVideo };

