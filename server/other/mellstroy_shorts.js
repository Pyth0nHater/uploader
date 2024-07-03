const { TiktokDownloader } = require("@tobyg74/tiktok-api-dl");
const axios = require("axios");
const fs = require("fs");
const postShorts = require("./index");

const tiktokUrls = [
    "https://vt.tiktok.com/ZSFHxqQPX/",
    "https://vt.tiktok.com/ZSFHxqfSE/",
    "https://vt.tiktok.com/ZSFHx46PK/",
    "https://vt.tiktok.com/ZSFHxxW78/",
    "https://vt.tiktok.com/ZSFHQJoYB/",
    "https://vt.tiktok.com/ZSFHQMDgW/",
    "https://vt.tiktok.com/ZSFHQMBc3/",
    "https://vt.tiktok.com/ZSFHxKHym/",
    "https://vt.tiktok.com/ZSFHQRPbv/",
    "https://vt.tiktok.com/ZSFHxEsBm/",
    "https://vt.tiktok.com/ZSFHxEd1F/",
    "https://vt.tiktok.com/ZSFHQBerT/",
    "https://vt.tiktok.com/ZSFHQr1sD/",
    "https://vt.tiktok.com/ZSFHQSHst/",
    "https://vt.tiktok.com/ZSFHQ881M/",
    "https://vt.tiktok.com/ZSFHQL1su/",
    "https://vt.tiktok.com/ZSFHxoJW1/",
    "https://vt.tiktok.com/ZSFHQJaqJ/",
    "https://vt.tiktok.com/ZSFHxTxyv/",
    "https://vt.tiktok.com/ZSFHQR47c/",
    "https://vt.tiktok.com/ZSFHQregu/",
    "https://vt.tiktok.com/ZSFHxE7CG/",
    "https://vt.tiktok.com/ZSFHQFu57/",
    "https://vt.tiktok.com/ZSFHQeRuj/",
    "https://vt.tiktok.com/ZSFHxguxb/",
    "https://vt.tiktok.com/ZSFHxpTax/",
    "https://vt.tiktok.com/ZSFHxsNaw/",
    "https://vt.tiktok.com/ZSFHxujSX/",
    "https://vt.tiktok.com/ZSFHxHFKk/",
    "https://vt.tiktok.com/ZSFHxqW9H/",
    "https://vt.tiktok.com/ZSFHxvRJt/",
    "https://vt.tiktok.com/ZSFHxuUyn/",
    "https://vt.tiktok.com/ZSFHx7WeX/",
    "https://vt.tiktok.com/ZSFHx9U8H/",
    "https://vt.tiktok.com/ZSFHxbQMe/",
    "https://vt.tiktok.com/ZSFHxuY9F/",
    "https://vt.tiktok.com/ZSFHx7HcP/",
    "https://vt.tiktok.com/ZSFHx9m6b/",
    "https://vt.tiktok.com/ZSFHx4j2W/",
    "https://vt.tiktok.com/ZSFHxnUv3/",
    "https://vt.tiktok.com/ZSFHxQd1c/",
    "https://vt.tiktok.com/ZSFHxvPvs/",
    "https://vt.tiktok.com/ZSFHxmm5n/",
    "https://vt.tiktok.com/ZSFHxc3Cj/",
    "https://vt.tiktok.com/ZSFHxpqSF/",
    "https://vt.tiktok.com/ZSFHx7ULX/",
    "https://vt.tiktok.com/ZSFHxsqsF/",
    "https://vt.tiktok.com/ZSFHxnXYb/",
    "https://vt.tiktok.com/ZSFHxsVXa/",
]



// Текущий индекс ссылки
let currentIndex = 6;

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};


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
      const UserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
      postShorts(videoPath,"6807558708:AAEapTJk9thUr6NIIUxn8WRxpx1aoI7pnhs","819850346", './cookies.json', '#reels #reelsvideos #reelsinstagram #mellstroy #меллстрой #главстрой');
      currentIndex = (currentIndex + 1) % tiktokUrls.length; // Увеличение индекса для следующего видео
      console.log(currentIndex)
    }).catch(error => {
      console.error('Ошибка при скачивании видео:', error);
      // Можно добавить обработку ошибок здесь
    });
  }).catch((error) => {
    console.error('Ошибка:', error);
    // Можно добавить обработку ошибок здесь
  });
}
// Функция для скачивания одного вифдео
function downloadNextVideo() {
  downloadVideo(tiktokUrls[currentIndex]);
}

downloadNextVideo();