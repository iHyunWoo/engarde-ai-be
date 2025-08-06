import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

export const Authenticated = () => UseGuards(JwtAuthGuard);