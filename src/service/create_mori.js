const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const dotenv = require('dotenv');


ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const targetResolution = '1080x1920'

const clearTempFolder = () => {
  fs.readdir('./temp', (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join('./temp', file), err => {
        if (err) throw err;
      });
    }
    console.log('Папка temp очищена.');
  });
};

const s3 = new S3Client({
    region: "ru-1",
    endpoint: "https://s3.timeweb.cloud",
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
    },
});

// Генерация уникального имени файла на основе текущей даты и времени
const generateUniqueFileName = (prefix, extension) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `./temp/${prefix}_${timestamp}.${extension}`;
};

async function getRandomFileFromS3(bucketName, folder) {
    const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folder,
    });

    const { Contents } = await s3.send(listCommand);
    const files = Contents.filter(item => item.Key.endsWith(".mp4") || item.Key.endsWith(".mp3"));

    if (!files.length) throw new Error("No files found in folder");

    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filePath = generateUniqueFileName(path.basename(randomFile.Key, path.extname(randomFile.Key)), path.extname(randomFile.Key).slice(1));

    const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: randomFile.Key,
    });

    const { Body } = await s3.send(getCommand);
    const writeStream = fs.createWriteStream(filePath);

    await new Promise((resolve, reject) => {
        Body.pipe(writeStream);
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
    });

    return filePath;
}

const trimOverlayVideo = (overlayPath, outputTrimmed) => {
  return new Promise((resolve, reject) => {
    ffmpeg(overlayPath)
      .setStartTime(0)
      .duration(10)
      .videoFilter(`scale=${targetResolution}`)
      .output(outputTrimmed)
      .on('end', () => {
        console.log('Наложенное видео обрезано до 10 секунд и приведено к разрешению ' + targetResolution);
        resolve(outputTrimmed);
      })
      .on('error', (err) => reject(err))
      .run();
  });
};

const concatVideos = (trimmedVideo, fullVideo, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(trimmedVideo)
      .input(fullVideo)
      .complexFilter([
        `[0:v]scale=${targetResolution}[v0]; [1:v]scale=${targetResolution}[v1]; [v0][v1] concat=n=2:v=1:a=0 [v]`
      ])
      .outputOptions('-map', '[v]')
      .outputOptions('-c:v', 'libx264')
      .outputOptions('-pix_fmt', 'yuv420p')
      .output(output)
      .on('end', () => {
        console.log('Видео успешно склеено и приведено к разрешению ' + targetResolution);
        resolve(output);
      })
      .on('error', (err) => reject(err))
      .run();
  });
};

const overlayVideoOnSegment = (background, overlay, start, duration, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg(background)
      .input(overlay)
      .complexFilter([
        `[0:v]scale=${targetResolution}[bg];` +
        `[1:v] trim=start=0:end=${duration},setpts=PTS-STARTPTS,scale=${targetResolution} [ovl];` +
        `[bg][ovl] overlay=enable='between(t,${start},${start + duration})'`
      ])
      .outputOptions('-c:v libx264')
      .outputOptions('-pix_fmt yuv420p')
      .on('start', (commandLine) => {
        console.log('FFmpeg command for overlay: ' + commandLine);
      })
      .on('progress', (progress) => {
        console.log('Overlay progress: ' + progress.percent + '% done');
      })
      .on('end', () => resolve(output))
      .on('error', (err) => reject(err))
      .save(output);
  });
};

const removeAudioFromVideo = (inputVideo, outputVideo) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideo)
      .outputOptions('-an')
      .output(outputVideo)
      .on('end', () => {
        console.log('Аудио успешно убрано из видео.');
        resolve(outputVideo);
      })
      .on('error', (err) => reject(err))
      .run();
  });
};

const addAudioToVideo = (videoPath, audioPath, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(audioPath)
      .outputOptions('-c:v', 'copy')
      .outputOptions('-c:a', 'aac')
      .outputOptions('-strict', 'experimental')
      .outputOptions('-shortest')
      .output(output)
      .on('end', () => {
        console.log('Аудио успешно наложено на видео.');
        resolve(output);
      })
      .on('error', (err) => reject(err))
      .run();
  });
};

const processVideos = async (id) => {
  try {
    const inputPath = await getRandomFileFromS3("dcb8c081-633ff4d7-f95f-48c8-8af0-5bc715990d2d", "mori/");
    const trimmedOverlay1 = await getRandomFileFromS3("dcb8c081-633ff4d7-f95f-48c8-8af0-5bc715990d2d", "money/");
    const audioPath = await getRandomFileFromS3("dcb8c081-633ff4d7-f95f-48c8-8af0-5bc715990d2d", "audio/");

    console.log(`Выбрано видео: ${inputPath}, наложенное видео: ${trimmedOverlay1}, аудио: ${audioPath}`);

    const trimmedOverlay = generateUniqueFileName('trimmed_overlay', 'mp4');
    await trimOverlayVideo(trimmedOverlay1, trimmedOverlay);

    const concatenatedOverlay = generateUniqueFileName('concatenated_overlay', 'mp4');
    await concatVideos(trimmedOverlay, trimmedOverlay1, concatenatedOverlay);

    const outputPath = generateUniqueFileName('final_output', 'mp4');
    await overlayVideoOnSegment(inputPath, concatenatedOverlay, 10, 20, outputPath);

    const outputPathNoAudio = generateUniqueFileName('final_output_no_audio', 'mp4');
    await removeAudioFromVideo(outputPath, outputPathNoAudio);

    const finalVideoWithAudio = `../../videos/${id}.mp4`
    await addAudioToVideo(outputPathNoAudio, audioPath, finalVideoWithAudio);

    console.log('Процесс завершен, итоговое видео с аудио: ' + finalVideoWithAudio);
    clearTempFolder();
  } catch (error) {
    console.error('Ошибка при обработке видео:', error);
  }
};

// processVideos("6698fb32a9b8173255b766d2");
module.exports = { processVideos };
