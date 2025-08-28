import * as api from '@/../api-sdk';
import { getApp, getCookie, getHost, loginAndSetCookie, setupApp } from './e2e/_helpers/setup.helper';
import { prismaTestClient } from './e2e/_helpers/prisma.helper';
import typia from 'typia';
import { CreateMatchRequest } from '../modules/match/dto/create-match.request';


describe('Match', () => {

  beforeAll(async () => {
    await setupApp();
  });

  beforeEach(async () => {
    await loginAndSetCookie();
  });

  afterAll(async () => {
    await getApp().close();
  });

  describe('Create Match', () => {

    test('경기를 성공적으로 생성하고, 그 ID를 반환함', async () => {
      const req = typia.random<CreateMatchRequest>()
      const result = await api.functional.matches.create(
        {
          host: getHost(),
          headers: {
            Cookie: getCookie(),
          },
        },
        req
      );

      if(!result?.data) return

      expect(result.data).toStrictEqual({ id: 1 });
      const match = await prismaTestClient.match.findUnique({
        where: {
          id: result.data.id,
        },
      });
      expect(match).toContain(req);
    });

    test.each([
      ['objectName'],
      ['tournamentName'],
      ['tournamentDate'],
      ['opponentName'],
      ['opponentTeam'],
      ['myScore'],
      ['opponentScore'],
      ['stage'],
    ])('%s이 없으면 400 에러를 반환함', () => {});
  });

  describe('Read Match', () => {

    describe('findManyWithPagination', () => {
      test('경기를 성공적으로 생성하고, 그 ID를 반환함', () => {

      })

      test('from과 to에 올바르지 않은 date 포맷이 들어오면 400 에러를 반환함', () => {

      })
    })

    describe('findOne', () => {
      test('경기를 성공적으로 조회하고, 그 경기를 반환함', () => {

      })

      test('해당 경기가 없다면 404 에러를 반환함', () => {

      })

      test('해당 경기가 본인의 경기가 아니라면 404 에러를 반환함', () => {

      })

      test('해당 경기가 삭제된 경기라면 404 에러를 반환함', () => {

      })
    })


    describe('getMatchByOpponent', () => {
      test('해당 상대와의 경기를 성공적으로 반환함', () => {

      })

      test('해당 상대와의 경기가 아니라면 반환하지 않음', () => {

      })
    })
  })

  describe('update', () => {
    test('경기를 성공적으로 수정하고, 그 수정된 경기를 반환함', () => {

    })

    test('해당 경기가 없다면 404 에러를 반환함', () => {

    })

    test('해당 경기가 본인의 경기가 아니라면 404 에러를 반환함', () => {

    })

    test('해당 경기가 삭제된 경기라면 404 에러를 반환함', () => {

    })

    test.each([
      ['objectName'],
      ['tournamentName'],
      ['tournamentDate'],
      ['opponentName'],
      ['opponentTeam'],
      ['myScore'],
      ['opponentScore'],
      ['stage'],
    ])('%s이 없으면 400 에러를 반환한다', ()=> {

    })
  })

  describe('delete', () => {
    test('경기를 성공적으로 삭제, 그 수정된 경기를 반환함', () => {

    })

    test('해당 경기가 없다면 404 에러를 반환함', () => {

    })

    test('해당 경기가 본인의 경기가 아니라면 404 에러를 반환함', () => {

    })

    test('해당 경기가 이미 삭제된 경기라면 404 에러를 반환함', () => {

    })
  })


});