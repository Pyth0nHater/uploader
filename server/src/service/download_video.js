const Tiktok = require("@tobyg74/tiktok-api-dl");
const fs = require('fs');
const https = require('https');

async function downloadTiktokVideo(url) {
  try {
    const result = await Tiktok.Downloader(url, { version: "v1" });
    console.log(result);
    const downloadUrl = result.result.video.downloadAddr[0]; // Access the first download address
    const file = fs.createWriteStream("video.mp4");

    return new Promise((resolve, reject) => {
      https.get(downloadUrl, function(response) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log('Download Completed!');
            resolve('Download Completed!');
          });
        });
        file.on('error', (err) => {
          fs.unlink("video.mp4", () => reject(err));
        });
      });
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  downloadTiktokVideo
};
