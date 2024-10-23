const Tiktok = require("@tobyg74/tiktok-api-dl");
const fs = require('fs');
const https = require('https');

async function downloadTiktokVideo(id, url) {
  try {
    const result = await Tiktok.Downloader(url, { version: "v3" });
    console.log(result)
    const downloadUrl = result.result.video1;
    if (!downloadUrl) {
      throw new Error('Download URL not found');
    }

    const file = fs.createWriteStream(`../../videos/${id}.mp4`);

    return new Promise((resolve, reject) => {
      https.get(downloadUrl, function(response) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            resolve('Download Completed!');
          });
        });
        file.on('error', (err) => {
          fs.unlink(`../../videos/${id}.mp4`, () => reject(err));
        });
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

downloadTiktokVideo("32d316a3bab0dd72f143", "https://www.tiktok.com/@xperezzq/video/7396382376470826246")
module.exports = {
  downloadTiktokVideo
};
