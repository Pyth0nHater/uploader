const axios = require('axios');
const fs = require('fs');
const Tiktok = require("@tobyg74/tiktok-api-dl");

const tiktok_url = "https://www.tiktok.com/@bestbet012/video/7365163179460152609";

Tiktok.Downloader(tiktok_url, {
  version: "v2"
}).then((result) => {
  if (result.status === 'success') {
    const videoUrl = result.result.video;
    const filePath = 'tiktok_video.mp4';

    axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream'
    }).then((response) => {
      const writeStream = fs.createWriteStream(filePath);

      response.data.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log(`Video downloaded successfully and saved to ${filePath}`);
      });

      writeStream.on('error', (err) => {
        console.error('Error writing the video to file:', err);
      });

      response.data.on('error', (err) => {
        console.error('Error during the download stream:', err);
      });
    }).catch((error) => {
      console.error('Error fetching the video URL:', error);
    });
  } else {
    console.error('Error with Tiktok Downloader:', result);
  }
}).catch((error) => {
  console.error('Error with Tiktok API:', error);
});
