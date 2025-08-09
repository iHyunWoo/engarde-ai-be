import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/lib/prisma/prisma.service';

@Injectable()
export class NoteService {
  constructor(private readonly prisma: PrismaService) {
  }

  async upsert(userId: number, text: string): Promise<{ id: number } | null> {
    const trimmed = text?.trim();
    if (!trimmed) return null;

    return this.prisma.note.upsert({
      where: { user_id_text: { user_id: userId, text: trimmed } },
      create: { user_id: userId, text: trimmed },
      update: { last_used_at: new Date() },
      select: { id: true },
    });
  }

  async suggest(userId: number, query: string, limit = 5): Promise<string[]> {
    console.log(query);
    const keyword = query.trim();
    if (keyword.length < 2) return [];

    const rows = await this.prisma.note.findMany({
      where: {
        user_id: userId,
        text: { contains: keyword, mode: 'insensitive' }, // 포함 + 대소문자 무시
      },
      orderBy: [
        { last_used_at: 'desc' }, // 최근 사용 우선
        { text: 'asc' }, // 같은 최신이면 알파벳 정렬
      ],
      take: Math.min(Math.max(limit, 1), 10),
      select: { text: true },
    });

    return rows.map(r => r.text);
  }

}