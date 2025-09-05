import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import { PostSignedUrlResponse } from '@/modules/file/dto/post-signed-url.response';
import { dateFolder } from '@/modules/file/lib/date-folder';
import { sanitize } from '@/modules/file/lib/sanitize';
import { prefixByMime } from '@/modules/file/lib/prefix-by-mime';
import { AppError } from '@/shared/error/app-error';
import { GetSignedUrlResponse } from '@/modules/file/dto/get-signed-url.response';
import { PostSignedUrlRequestDto } from '@/modules/file/dto/post-signed-url.request';

@Injectable()
export class FileService {
  private storage = new Storage();
  private bucketName = process.env.GCS_BUCKET!;
  private expiresSec = 3600;

  // write signed url 발급
  async issueWriteSignedUrl(
    filename: string,
    contentType: string
  ): Promise<PostSignedUrlResponse> {
    if (!this.bucketName) {
      throw new AppError('SERVER_ERROR');
    }
    if (!contentType) {
      throw new AppError('FILE_CONTENT_TYPE_MISSING');
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
  async issueReadSignedUrl(objectName: string): Promise<GetSignedUrlResponse> {
    const ttlSeconds = 24 * 60 * 60; // 24시간
    const expires = Date.now() + ttlSeconds * 1000;
    const [url] = await this.storage
      .bucket(this.bucketName)
      .file(objectName)
      .getSignedUrl({ version: 'v4', action: 'read', expires });
    return { url, expiresAt: expires };
  }

  async issueWriteSignedUrlsByMatch(
    matchId: number,
    dto: PostSignedUrlRequestDto[]
  ): Promise<PostSignedUrlResponse[]> {
    if (!this.bucketName) {
      throw new AppError('SERVER_ERROR');
    }

    return await Promise.all(
      dto.map(async ({ contentType, fileName }) => {
        const prefix = prefixByMime(contentType);
        const safe = sanitize(fileName);
        const objectName = `${prefix}/match-${matchId}/${randomUUID()}_${safe}`;

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
      })
    );
  }
}