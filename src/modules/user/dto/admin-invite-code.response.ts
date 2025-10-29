export class AdminInviteCodeResponse {
  id: number;
  code: string;
  createdAt: Date;
  expiresAt: Date | null;
  isExpired: boolean;
}

