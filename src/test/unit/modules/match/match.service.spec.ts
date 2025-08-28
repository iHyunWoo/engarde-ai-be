import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from '../../../../modules/match/match.service';
import { createUser } from '../../utils/create-user';
import { createMatch, createMatchRequest } from '../../utils/create-match';
import { PrismaService } from '../../../../shared/lib/prisma/prisma.service';
import { OpponentService } from '../../../../modules/opponent/opponent.service';
import { CreateMatchRequest } from '../../../../modules/match/dto/create-match.request';
import { AppError } from '../../../../shared/error/app-error';
import { mapToDeleteRes } from '../../../../modules/match/mapper/match.mapper';
import { Match } from '@prisma/client';

describe('MatchService', () => {
  let service: MatchService;
  let prisma: jest.Mocked<PrismaService>;
  let opponentService: jest.Mocked<OpponentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: {
            match: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: OpponentService,
          useValue: {
            findOrCreate: jest.fn(),
            useOpponent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MatchService);
    prisma = module.get(PrismaService);
    opponentService = module.get(OpponentService);
  });


  describe('create', () => {
    test('경기를 생성하고 opponent를 사용처리한다', async () => {
      // given
      const userId = 1;
      const matchRequest = createMatchRequest();

      const opponent = { id: 101 };
      const createdMatch = { id: 1 };

      (opponentService.findOrCreate as jest.Mock).mockResolvedValue(opponent);
      (prisma.match.create as jest.Mock).mockResolvedValue(createdMatch as any);

      // when
      const result = await service.create(userId, matchRequest);

      // then
      expect(opponentService.findOrCreate).toHaveBeenCalledWith(
        userId,
        matchRequest.opponentName,
        matchRequest.opponentTeam
      );
      expect(prisma.match.create).toHaveBeenCalledWith({
        data: {
          userId,
          objectName: matchRequest.objectName,
          tournamentName: matchRequest.tournamentName,
          tournamentDate: new Date(matchRequest.tournamentDate),
          opponentId: opponent.id,
          myScore: matchRequest.myScore,
          opponentScore: matchRequest.opponentScore,
          stage: matchRequest.stage,
        },
      });
      expect(opponentService.useOpponent).toHaveBeenCalledWith(opponent.id);
      expect(result).toEqual({ id: createdMatch.id });
    });
  });

  describe('update', () => {
    test('정상적으로 경기를 업데이트한다', async () => {
      // given
      const userId = 1;
      const matchId = 11;
      const matchRequest = createMatchRequest()

      const existingMatch = {
        id: matchId,
        userId,
        deletedAt: null,
      };
      const opponent = { id: 101 };
      const updated = { id: matchId };

      (prisma.match.findUnique as jest.Mock).mockResolvedValue(existingMatch);
      (opponentService.findOrCreate as jest.Mock).mockResolvedValue(opponent);
      (prisma.match.update as jest.Mock).mockResolvedValue(updated);

      // when
      const result = await service.update(userId, matchId, matchRequest);

      // then
      expect(prisma.match.findUnique).toHaveBeenCalledWith({ where: { id: matchId } });
      expect(opponentService.findOrCreate).toHaveBeenCalledWith(userId, matchRequest.opponentName, matchRequest.opponentTeam);
      expect(prisma.match.update).toHaveBeenCalledWith({
        where: { id: matchId },
        data: {
          objectName: matchRequest.objectName,
          tournamentName: matchRequest.tournamentName,
          tournamentDate: new Date(matchRequest.tournamentDate),
          opponentId: opponent.id,
          myScore: matchRequest.myScore,
          opponentScore: matchRequest.opponentScore,
          stage: matchRequest.stage,
        },
      });
      expect(result).toEqual({ id: updated.id });
    });

    test('경기가 존재하지 않으면 MATCH_NOT_FOUND 예외를 던진다', async () => {
      // given
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(null);

      // when & then
      const error = new AppError('MATCH_NOT_FOUND')
      await expect(service.update(1, 999, {} as any)).rejects.toThrow(error.message);
    });

    test('다른 유저의 경기일 경우 MATCH_FORBIDDEN 예외를 던진다', async () => {
      // given
      const match = { id: 1, userId: 2, deletedAt: null };
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(match);

      // when & then
      const error = new AppError('MATCH_FORBIDDEN')
      await expect(service.update(1, 1, {} as any)).rejects.toThrow(error.message);
    });

    test('경기가 삭제되었을 경우 MATCH_GONE 예외를 던진다', async () => {
      // given
      const match = { id: 1, userId: 1, deletedAt: new Date() };
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(match);

      // when & then
      const error = new AppError('MATCH_GONE')
      await expect(service.update(1, 1, {} as any)).rejects.toThrow(error.message);
    });

    test('상대를 찾지 못하면 OPPONENT_NOT_FOUND 예외를 던진다', async () => {
      // given
      const match = { id: 1, userId: 1, deletedAt: null };
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(match);
      (opponentService.findOrCreate as jest.Mock).mockResolvedValue(null);

      // when & then
      const error = new AppError('OPPONENT_NOT_FOUND')
      await expect(service.update(1, 1, {} as any)).rejects.toThrow(error.message);
    });
  });

  describe('delete', () => {
    test('정상적으로 경기를 삭제한다', async () => {
      // given
      const userId = 1;
      const matchId = 10;
      const existingMatch = createMatch(userId, 1) as Match

      const updatedMatch = {
        ...existingMatch,
        deletedAt: new Date(),
      };

      (prisma.match.findUnique as jest.Mock).mockResolvedValue(existingMatch);
      (prisma.match.update as jest.Mock).mockResolvedValue(updatedMatch);

      // when
      const result = await service.delete(userId, matchId);

      // then
      expect(prisma.match.findUnique).toHaveBeenCalledWith({ where: { id: matchId } });
      expect(prisma.match.update).toHaveBeenCalledWith({
        where: { id: matchId },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result).toEqual(mapToDeleteRes(updatedMatch));
    });

    test('경기가 존재하지 않으면 MATCH_NOT_FOUND 예외를 던진다', async () => {
      // given
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(null);

      // when & then
      const error = new AppError('MATCH_NOT_FOUND')
      await expect(service.delete(1, 123)).rejects.toThrow(error.message);
    });

    test('다른 유저의 경기일 경우 MATCH_FORBIDDEN 예외를 던진다', async () => {
      // given
      const match = { id: 1, userId: 2, deletedAt: null };
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(match);

      // when & then
      const error = new AppError('MATCH_FORBIDDEN')
      await expect(service.delete(1, 1)).rejects.toThrow(error.message);
    });

    test('이미 삭제된 경기일 경우 MATCH_GONE 예외를 던진다', async () => {
      // given
      const match = { id: 1, userId: 1, deletedAt: new Date() };
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(match);

      // when & then
      const error = new AppError('MATCH_GONE')
      await expect(service.delete(1, 1)).rejects.toThrow(error.message);
    });
  });

  describe('findManyWithPagination', () => {
    test('다음 페이지가 있을 때 nextCursor를 반환한다', async () => {
      // given
      const user = createUser();
      const matches = createMatch(user.id, 5) as any[];

      (prisma.match.findMany as jest.Mock).mockResolvedValue(matches.slice(0, 4));

      // when
      const res = await service.findManyWithPagination(user.id, 3);

      // then
      expect(res.items).toHaveLength(3);
      expect(res.nextCursor).toBe(matches[2].id);
    });

    test('다음 페이지가 없을 때 nextCursor는 null이다', async () => {
      // given
      const user = createUser();
      const matches = createMatch(user.id, 3) as any[];

      (prisma.match.findMany as jest.Mock).mockResolvedValue(matches);

      // when
      const result = await service.findManyWithPagination(user.id, 5);

      // then
      expect(result.items).toHaveLength(3);
      expect(result.nextCursor).toBe(null);
    });
  })

  describe('findAllByDateRange', () => {
    test('from ~ to 사이에 해당하는 경기만 검색한다', async () => {
      // given
      const userId = 1;
      const from = new Date('2025-08-01');
      const to = new Date('2025-08-31');

      (prisma.match.findMany as jest.Mock).mockResolvedValue([]);

      // when
      const result = await service.findAllByDateRange(userId, from, to);

      // then
      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            deletedAt: null,
            tournamentDate: {
              gte: from,
              lte: to,
            },
          },
        })
      );
    });
  });

  describe('findOne', () => {
    test('id로 경기를 조회한다', async () => {
      // given
      const userId = 1;
      const matchId = 1;
      const match = createMatch(userId, 1) as Match;

      const mockOpponent = {
        id: match.opponentId,
        name: '상대 이름',
        team: '상대 팀',
      };

      const matchWithOpponent = {
        ...match,
        opponent: mockOpponent,
      };

      (prisma.match.findUnique as jest.Mock).mockResolvedValue(matchWithOpponent);

      // when
      const result = await service.findOne(userId, matchId);

      // then
      expect(result.id).toBe(match.id);
      expect(result.opponent?.id).toBe(match.opponentId);
    });

    test('경기가 없으면 MATCH_NOT_FOUND 에러를 던진다', async () => {
      // given
      const userId = 1;
      const matchId = 999;
      (prisma.match.findUnique as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(service.findOne(userId, matchId)).rejects.toThrow(
        new AppError('MATCH_NOT_FOUND'),
      );
    });
  });

  describe('findAllByOpponent', () => {
    test('상대 선수 id로 모든 경기 기록을 조회한다', async () => {
      // given
      const userId = 1;
      const opponentId = 101;
      const matches = createMatch(userId, 3) as any[];
      (prisma.match.findMany as jest.Mock).mockResolvedValue(matches);

      // when
      const result = await service.findAllByOpponent(userId, opponentId);

      // then
      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          opponentId,
          deletedAt: null,
        },
        include: {
          opponent: true,
        },
      });
      expect(result).toHaveLength(matches.length);
    });
  });
});
