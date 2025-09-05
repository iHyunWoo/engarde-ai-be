import { Injectable } from '@nestjs/common';
import { JWT } from 'google-auth-library'
import fs from 'fs';

@Injectable()
export class CloudRunService {
  // private jwtClient: JWT;

  constructor() {
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "";
    // this.jwtClient = new JWT({
    //   email: process.env.GCP_SA_CLIENT_EMAIL,
    //   key: fs.readFileSync(path, 'utf8'),
    //   scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    // });
  }

  async triggerVideoMergeJob(matchId: number, objectNames: string[]) {
    // const tokens = await this.jwtClient.authorize();
    // const accessToken = tokens.access_token;
    const accessToken = process.env.GCP_ACCESS_TOKEN

    const region = 'asia-northeast1'
    const jobName = 'match-video-merge'

    return await fetch(
      `https://run.googleapis.com/v2/projects/${process.env.GCP_PROJECT_ID}/locations/${region}/jobs/${jobName}:run`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overrides: {
            containerOverrides: [
              {
                name: 'job-1',
                env: [
                  { name: 'MATCH_ID', value: String(matchId) },
                  { name: 'OBJECT_NAMES_JSON', value: JSON.stringify(objectNames) },
                ],
              },
            ],
          },
        }),
      }
    );
  }
}