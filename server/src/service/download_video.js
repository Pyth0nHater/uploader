const Tiktok = require("@tobyg74/tiktok-api-dl");
const fs = require('fs');
const https = require('https');

async function downloadTiktokVideo(url) {
  try {
    const result = await Tiktok.Downloader(url, { version: "v3" });
    console.log(result)
    const downloadUrl = result.result.videoHD;
    if (!downloadUrl) {
      throw new Error('Download URL not found');
    }

    const file = fs.createWriteStream("video.mp4");

    return new Promise((resolve, reject) => {
      https.get(downloadUrl, function(response) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
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

downloadTiktokVideo("https://www.tiktok.com/@master_prognoz/video/7392568690165796128")
module.exports = {
  downloadTiktokVideo
};
