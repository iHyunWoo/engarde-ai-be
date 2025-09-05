"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const uuid_1 = require("uuid");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
// process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../../../secrets/gcp-sa.json');
const storage = new storage_1.Storage();
const [, , matchId, objectNamesJson] = process.argv;
async function downloadFromGCS(bucketName, objectName, localPath) {
    const file = storage.bucket(bucketName).file(objectName);
    await file.download({ destination: localPath });
    console.log(`Downloaded ${objectName}`);
}
async function uploadToGCS(bucketName, destName, localPath) {
    await storage.bucket(bucketName).upload(localPath, {
        destination: destName,
        public: false,
    });
    console.log(`Uploaded ${destName}`);
}
async function deleteFromGCS(bucketName, objectName) {
    await storage.bucket(bucketName).file(objectName).delete();
    console.log(`Deleted ${objectName}`);
}
async function mergeVideos(videoPaths, outputPath) {
    return new Promise((resolve, reject) => {
        const command = (0, fluent_ffmpeg_1.default)();
        videoPaths.forEach(path => command.input(path));
        command
            .on('end', () => {
            console.log('Merge complete');
            resolve();
        })
            .on('error', err => {
            console.error('❌ Merge error:', err);
            reject(err);
        })
            .mergeToFile(outputPath, path_1.default.dirname(outputPath));
    });
}
async function requestMergeFailed() {
    const backendApiUrl = process.env.API_BASE_URL;
    const apiKey = process.env.API_KEY;
    const notifyUrl = `${backendApiUrl}/matches/${matchId}/merge-failed`;
    await axios_1.default.post(notifyUrl, {
        apiKey,
    });
}
const main = async () => {
    if (!matchId || !objectNamesJson) {
        throw new Error('MATCH_ID or OBJECT_NAMES_JSON is not defined in args');
    }
    const bucketName = process.env.GCS_BUCKET_NAME || 'engarde-bucket';
    const objectNames = JSON.parse(objectNamesJson);
    const tmpDir = '/tmp';
    const localVideoPaths = [];
    try {
        // 1. GCS에서 영상 다운로드
        for (const name of objectNames) {
            const localPath = path_1.default.join(tmpDir, (0, uuid_1.v4)() + '.mp4');
            await downloadFromGCS(bucketName, name, localPath);
            localVideoPaths.push(localPath);
        }
        // 2. Merge
        const outputPath = path_1.default.join(tmpDir, 'merged-' + matchId + '.mp4');
        await mergeVideos(localVideoPaths, outputPath);
        // 3. GCS에 업로드
        const mergedObjectName = `videos/merged/merged-${matchId}.mp4`;
        await uploadToGCS(bucketName, mergedObjectName, outputPath);
        // 4. 원본 삭제
        for (const name of objectNames) {
            await deleteFromGCS(bucketName, name);
        }
        // 5. BE에 완료 알림
        const backendApiUrl = process.env.API_BASE_URL;
        const apiKey = process.env.API_KEY;
        const notifyUrl = `${backendApiUrl}/matches/${matchId}/merge-done`;
        await axios_1.default.post(notifyUrl, {
            apiKey,
            objectName: mergedObjectName,
        });
        console.log('Done!');
    }
    catch (err) {
        console.error('❌ Job failed:', err);
        // 실패 처리
        await requestMergeFailed();
        process.exit(1);
    }
    finally {
        // 6. temp 파일 정리
        for (const filePath of localVideoPaths) {
            await promises_1.default.rm(filePath).catch(() => { });
        }
    }
};
main().catch(async (err) => {
    console.error(err);
    await requestMergeFailed();
    process.exit(1);
});
