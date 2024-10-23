const Tiktok = require("@tobyg74/tiktok-api-dl");
const fs = require('fs');
const https = require('https');
const path = require('path');

const tiltVideo = async (inputPath, outputPath) => {
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  ffmpeg.setFfmpegPath(ffmpegPath);

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .outputOptions('-map_metadata -1')
      .audioCodec('copy')
      .videoFilters([
        'eq=contrast=1.2:brightness=0.05:saturation=1.2:gamma=1.2',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
};

async function downloadAndProcessTiktokVideo(id, url) {
  try {
    const result = await Tiktok.Downloader(url, { version: "v3" });
    console.log(result);
    const downloadUrl = result.result.video1;
    if (!downloadUrl) {
      throw new Error('Download URL not found');
    }

    const inputFilePath = path.join(__dirname, `../../videos/${id}.mp4`);
    const outputFilePath = path.join(__dirname, `../../videos/${id}_unique.mp4`);
    
    const file = fs.createWriteStream(inputFilePath);

    return new Promise((resolve, reject) => {
      https.get(downloadUrl, function (response) {
        response.pipe(file);
        file.on('finish', async () => {
          file.close(async () => {
            // Обработка видео после загрузки
            await tiltVideo(inputFilePath, outputFilePath);
            resolve('Download and processing completed!');
            fs.unlink(inputFilePath, () => reject());
          });
        });
        file.on('error', (err) => {
          fs.unlink(inputFilePath, () => reject(err));
        });
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Пример вызова функции для загрузки и обработки видео
//downloadAndProcessTiktokVideo("32d316a3bab0dd72f143", "https://www.tiktok.com/@xperezzq/video/7396259280036334853");

module.exports = {
  downloadAndProcessTiktokVideo,
  tiltVideo
};
