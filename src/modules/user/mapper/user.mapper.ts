import { UserResponse } from '../dto/user.response';

interface UserMapperInput {
  id: number;
  email: string;
  name: string;
  role: string;
  team?: {
    id: number;
    name: string;
    description?: string | null;
  } | null;
}

export function mapToUserResponse(row: UserMapperInput): UserResponse {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    team: row.team ? {
      id: row.team.id,
      name: row.team.name,
      description: row.team.description || undefined,
    } : undefined,
  };
}