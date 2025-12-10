export class TeamDetailResponse {
  id: number;
  name: string;
  description?: string;
  inviteCode: string;
  inviteCodeExpiresAt?: Date;
  maxMembers?: number;
  createdAt: Date;
  updatedAt: Date;
  coach?: {
    id: number;
    name: string;
    email: string;
  };
  members: {
    id: number;
    name: string;
    email: string;
  }[];
}

