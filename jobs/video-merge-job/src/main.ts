import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import 'dotenv/config';

// process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../../../secrets/gcp-sa.json');
const storage = new Storage();

async function downloadFromGCS(bucketName: string, objectName: string, localPath: string) {
  const file = storage.bucket(bucketName).file(objectName);
  await file.download({ destination: localPath });
  console.log(`Downloaded ${objectName}`);
}

async function uploadToGCS(bucketName: string, destName: string, localPath: string) {
  await storage.bucket(bucketName).upload(localPath, {
    destination: destName,
    public: false,
  });
  console.log(`Uploaded ${destName}`);
}

async function deleteFromGCS(bucketName: string, objectName: string) {
  await storage.bucket(bucketName).file(objectName).delete();
  console.log(`Deleted ${objectName}`);
}

async function mergeVideos(videoPaths: string[], outputPath: string) {
  return new Promise<void>((resolve, reject) => {
    const command = ffmpeg();

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
      .mergeToFile(outputPath, path.dirname(outputPath));
  });
}

async function requestMergeFailed() {
  const backendApiUrl = process.env.API_BASE_URL;
  const apiKey = process.env.API_KEY;
  const matchId = process.env.MATCH_ID;

  const notifyUrl = `${backendApiUrl}/matches/${matchId}/merge-failed`;
  await axios.post(notifyUrl, {
    apiKey,
  });
}

const main = async () => {
  console.log("find this!: ", process.env);
  const matchId = process.env.MATCH_ID;
  const objectNamesJson = process.env.OBJECT_NAMES_JSON;

  if (!matchId || !objectNamesJson) {
    throw new Error('MATCH_ID or OBJECT_NAMES_JSON is not defined in args');
  }

  const bucketName = process.env.GCS_BUCKET_NAME || 'engarde-bucket';
  const objectNames = JSON.parse(objectNamesJson) as string[];

  const tmpDir = '/tmp';
  const localVideoPaths: string[] = [];

  try {
    // 1. GCS에서 영상 다운로드
    for (const name of objectNames) {
      const localPath = path.join(tmpDir, uuidv4() + '.mp4');
      await downloadFromGCS(bucketName, name, localPath);
      localVideoPaths.push(localPath);
    }

    // 2. Merge
    const outputPath = path.join(tmpDir, 'merged-' + matchId + '.mp4');
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
    await axios.post(notifyUrl, {
      apiKey,
      objectName: mergedObjectName,
    });

    console.log('Done!');
  } catch (err) {
    console.error('❌ Job failed:', err);
    // 실패 처리
    await requestMergeFailed()
    process.exit(1);
  } finally {
    // 6. temp 파일 정리
    for (const filePath of localVideoPaths) {
      await fs.rm(filePath).catch(() => {});
    }
  }
}

main().catch(async err => {
  console.error(err);
  await requestMergeFailed()
  process.exit(1);
});