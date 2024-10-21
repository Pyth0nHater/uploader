const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const targetResolution = '1080x1920';  // Целевое разрешение

// Получаем случайный файл из директории
const getRandomFile = (dir) => {
  const files = fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isFile());
  return path.join(dir, files[Math.floor(Math.random() * files.length)]);
};

// Обрезаем наложенное видео до 10 секунд и приводим к целевому разрешению
const trimOverlayVideo = (overlayPath, outputTrimmed) => {
  return new Promise((resolve, reject) => {
    ffmpeg(overlayPath)
      .setStartTime(0)  // Начало с 0 секунды
      .duration(10)     // Длительность обрезки 10 секунд
      .videoFilter(`scale=${targetResolution}`) // Устанавливаем целевое разрешение
      .output(outputTrimmed)
      .on('end', () => {
        console.log('Наложенное видео обрезано до 10 секунд и приведено к разрешению ' + targetResolution);
        resolve(outputTrimmed);
      })
      .on('error', (err) => reject(err))
      .run();
  });
};

// Склеиваем обрезанное и полное наложенное видео с приведением к одному разрешению
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

// Накладываем видео на основной файл в заданный интервал, приводя к одному разрешению
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

// Убираем аудио из видео
const removeAudioFromVideo = (inputVideo, outputVideo) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputVideo)
      .outputOptions('-an')  // Убираем аудио
      .output(outputVideo)
      .on('end', () => {
        console.log('Аудио успешно убрано из видео.');
        resolve(outputVideo);
      })
      .on('error', (err) => reject(err))
      .run();
  });
};

// Добавляем аудио к финальному видео
const addAudioToVideo = (videoPath, audioPath, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(audioPath)  // Входной аудиофайл
      .outputOptions('-c:v', 'copy')  // Сохраняем видео как есть
      .outputOptions('-c:a', 'aac')  // Кодируем аудио в AAC
      .outputOptions('-strict', 'experimental')  // Флаг для использования experimental AAC
      .outputOptions('-shortest')  // Делаем выходное видео длиной в короткую часть (видео или аудио)
      .output(output)
      .on('end', () => {
        console.log('Аудио успешно наложено на видео.');
        resolve(output);
      })
      .on('error', (err) => reject(err))
      .run();
  });
};

// Асинхронная функция для выполнения процесса
const processVideos = async () => {
  try {
    // Выбираем случайные файлы для видео и аудио
    const inputPath = getRandomFile('../creos/mori');  // Случайное основное видео
    const trimmedOverlay1 = getRandomFile('../creos/money');  // Случайное наложенное видео
    const audioPath = getRandomFile('../creos/audio');  // Случайное аудио

    console.log(`Выбрано видео: ${inputPath}, наложенное видео: ${trimmedOverlay1}, аудио: ${audioPath}`);

    // Обрезаем наложенное видео до 10 секунд
    const trimmedOverlay = './temp/trimmed_overlay.mp4';
    await trimOverlayVideo(trimmedOverlay1, trimmedOverlay);

    // Склеиваем обрезанное и полное наложенное видео
    const concatenatedOverlay = './temp/concatenated_overlay.mp4';
    await concatVideos(trimmedOverlay, trimmedOverlay1, concatenatedOverlay);

    // Накладываем склеенное наложенное видео на основное
    const outputPath = './temp/final_output.mp4';
    await overlayVideoOnSegment(inputPath, concatenatedOverlay, 10, 20, outputPath);

    // Убираем аудио из итогового видео
    const outputPathNoAudio = './temp/final_output_no_audio.mp4';
    await removeAudioFromVideo(outputPath, outputPathNoAudio);

    // Добавляем новое аудио к итоговому видео без звука
    const finalVideoWithAudio = '../../videos/6716388828070da0c2c38517.mp4';
    await addAudioToVideo(outputPathNoAudio, audioPath, finalVideoWithAudio);

    console.log('Процесс завершен, итоговое видео с аудио: ' + finalVideoWithAudio);
  } catch (error) {
    console.error('Ошибка при обработке видео:', error);
  }
};

module.exports = { processVideos }
