import { TeamDetailResponse } from '../dto/team-detail.response';

interface TeamDetailMapperInput {
  id: number;
  name: string;
  description?: string | null;
  inviteCode: string | null;
  inviteCodeExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  coach: {
    id: number;
    name: string;
    email: string;
  } | null;
  members: {
    id: number;
    name: string;
    email: string;
  }[];
}

export function mapToTeamDetailResponse(row: TeamDetailMapperInput): TeamDetailResponse {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    inviteCode: row.inviteCode || '',
    inviteCodeExpiresAt: row.inviteCodeExpiresAt || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    coach: row.coach ? {
      id: row.coach.id,
      name: row.coach.name,
      email: row.coach.email,
    } : undefined,
    members: row.members.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
    })),
  };
}

