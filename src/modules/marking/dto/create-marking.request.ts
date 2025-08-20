import { IsInt, IsEnum, IsString, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  Result as MarkingResult,
  MarkingQuality as MarkingQuality,
} from '@prisma/client';
import { TechniqueResponse } from '@/modules/technique/dto/technique.response';


export class CreateMarkingRequest {
  @IsInt()
  @Transform(({ value }) => Number(value))
  matchId: number;

  @IsInt()
  @Min(0)
  timestamp: number;

  @IsEnum(MarkingResult)
  result!: MarkingResult;
  
  myTechnique!: TechniqueResponse;

  opponentTechnique!: TechniqueResponse;

  @IsEnum(MarkingQuality)
  quality!: MarkingQuality;

  @IsString()
  @MaxLength(100)
  note: string;

  @IsInt()
  @Min(0)
  remainTime: number;
}