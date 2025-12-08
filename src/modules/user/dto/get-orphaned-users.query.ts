import { IsOptional, IsString } from 'class-validator';

export class GetOrphanedUsersQuery {
  @IsOptional()
  @IsString()
  cursor?: string;
}

