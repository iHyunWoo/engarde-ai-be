import { TeamListResponse } from '../dto/team-list.response';

interface TeamListMapperInput {
  id: number;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  coach: {
    id: number;
    name: string;
    email: string;
  } | null;
  memberCount: number;
  maxMembers?: number | null;
}

export function mapToTeamListResponse(row: TeamListMapperInput): TeamListResponse {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    coach: row.coach ? {
      id: row.coach.id,
      name: row.coach.name,
      email: row.coach.email,
    } : undefined,
    memberCount: row.memberCount,
    maxMembers: row.maxMembers || undefined,
  };
}

export function mapToTeamListResponseList(rows: TeamListMapperInput[]): TeamListResponse[] {
  return rows.map(mapToTeamListResponse);
}

