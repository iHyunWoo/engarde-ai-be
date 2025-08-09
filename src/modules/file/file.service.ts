import { Injectable, BadRequestException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import { PostSignedUrlResponse } from '@/modules/file/dto/post-signed-url.response';
import { dateFolder } from '@/modules/file/lib/date-folder';

function sanitize(name: string) {
  // GCS object name에 안전하지 않은 문자 치환
  return name.replace(/[^\w.\-]/g, '_');
}
function prefixByMime(contentType: string) {
  const ct = contentType.toLowerCase();
  if (ct.startsWith('video/')) return 'videos';
  if (ct.startsWith('image/')) return 'images';
  return 'files';
}
@Injectable()
export class FileService {
  private storage = new Storage();
  private bucketName = process.env.GCS_BUCKET!;
  private expiresSec = 3600;

  // write signed url 발급
  async issueWriteSignedUrl(filename: string, contentType: string): Promise<PostSignedUrlResponse> {
    if (!this.bucketName) {
      throw new BadRequestException('GCS_BUCKET is not set');
    }
    if (!contentType) {
      throw new BadRequestException('contentType is required');
    }

    const prefix = prefixByMime(contentType);
    const safe = sanitize(filename);
    const objectName = `${prefix}/${dateFolder()}/${randomUUID()}_${safe}`;

    const [uploadUrl] = await this.storage
      .bucket(this.bucketName)
      .file(objectName)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        contentType,
        expires: Date.now() + this.expiresSec * 1000,
      });

    return { uploadUrl, objectName };
  }

  // read signed url 발급
  async issueReadSignedUrl(objectName: string) {
    const ttlSeconds = 24 * 60 * 60; // 24시간
    const expires = Date.now() + ttlSeconds * 1000;
    const [url] = await this.storage
      .bucket(this.bucketName)
      .file(objectName)
      .getSignedUrl({ version: 'v4', action: 'read', expires });
    return { url, expiresAt: expires };
  }
}