export class TeamListResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  coach?: {
    id: number;
    name: string;
    email: string;
  };
  memberCount: number;
}

