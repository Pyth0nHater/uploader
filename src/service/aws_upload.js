const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Настройка клиента S3
const s3 = new S3Client({
    region: "ru-1",
    endpoint: "https://s3.timeweb.cloud",
    credentials: {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
    },
});

// Рекурсивная функция для обхода файлов в папке
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

// Функция загрузки файла на S3
async function uploadFileToS3(bucketName, key, filePath) {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fileStream,
    };
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    console.log(`Uploaded ${key} successfully.`);
}

// Функция загрузки целой папки
async function uploadFolderToS3(bucketName, folderPath, s3Folder) {
    const files = getAllFiles(folderPath);
    
    for (const filePath of files) {
        const relativePath = path.relative(folderPath, filePath); // путь относительно папки
        const s3Key = path.join(s3Folder, relativePath).replace(/\\/g, "/"); // корректируем путь для S3
        await uploadFileToS3(bucketName, s3Key, filePath);
    }
}

// Пример использования
let folder = "audio"
uploadFolderToS3(
    "dcb8c081-633ff4d7-f95f-48c8-8af0-5bc715990d2d", // имя бакета
    path.resolve(__dirname, `../creos/${folder}`), // путь к локальной папке
    folder // путь в S3, куда будет загружена папка
);
