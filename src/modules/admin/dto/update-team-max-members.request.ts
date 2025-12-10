import { IsInt, Min, IsOptional } from 'class-validator';

export class UpdateTeamMaxMembersRequest {
  @IsInt()
  @Min(1)
  @IsOptional()
  maxMembers?: number | null;
}
