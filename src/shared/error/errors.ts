export type ErrorKey =
  // AUTH
  | 'TOKEN_MISSING'
  | 'TOKEN_EXPIRED'
  | 'API_KEY_MISMATCH'

  // FILE
  | 'FILE_CONTENT_TYPE_MISSING'

  // MARKING
  | 'MARKING_NOT_FOUND'

  // MATCH
  | 'MATCH_NOT_FOUND'
  | 'MATCH_FORBIDDEN'
  | 'MATCH_GONE'
  | 'MATCH_INVALID_COUNTER_TYPE'

  // TECHNIQUE
  | 'TECHNIQUE_NOT_FOUND'
  | 'TECHNIQUE_MAX'
  | 'TECHNIQUE_DUPLICATE'

  // OPPONENT
  | 'OPPONENT_NOT_FOUND'

  // TECHNIQUE_ATTEMPT
  | 'TECHNIQUE_ATTEMPT_ALREADY_EXISTS'
  | 'TECHNIQUE_ATTEMPT_NOT_FOUND'

  // ETC
  | 'SERVER_ERROR';

export const ERRORS: Record<ErrorKey, { code: number; message: string }> = {
  // AUTH
  TOKEN_MISSING:   { code: 401, message: 'TOKEN_MISSING' },
  TOKEN_EXPIRED:   { code: 401, message: 'TOKEN_EXPIRED' },
  API_KEY_MISMATCH:   { code: 403, message: 'API_KEY_MISMATCH' },

  //FILE
  FILE_CONTENT_TYPE_MISSING: {code: 400, message: 'Content Type is required'},

  // MARKING
  MARKING_NOT_FOUND: {code: 404, message: '해당 마킹을 찾을 수 없습니다'},

  // MATCH
  MATCH_NOT_FOUND: { code: 404, message: '해당 경기를 찾을 수 없습니다' },
  MATCH_FORBIDDEN: { code: 403, message: '이 경기에 접근할 수 없습니다' },
  MATCH_GONE:      { code: 404, message: '삭제된 경기입니다' },
  MATCH_INVALID_COUNTER_TYPE: { code: 400, message: '잘못된 카운터 타입입니다' },

  // TECHNIQUE
  TECHNIQUE_NOT_FOUND: {code: 400, message: '해당 기술을 찾을 수 없습니다'},
  TECHNIQUE_MAX: {code: 400, message: '기술 수가 너무 많습니다'},
  TECHNIQUE_DUPLICATE: {code: 400, message: '이미 존재하는 기술입니다'},

  // OPPONENT
  OPPONENT_NOT_FOUND: {code: 400, message: '해당 상대를 찾을 수 없습니다'},

  // TECHNIQUE_ATTEMPT
  TECHNIQUE_ATTEMPT_ALREADY_EXISTS: { code: 400, message: '이미 존재하는 기술 시도입니다.' },
  TECHNIQUE_ATTEMPT_NOT_FOUND: { code: 400, message: '해당 기술 시도를 찾을 수 없습니다' },

  // ETC
  SERVER_ERROR:    { code: 500, message: '서버 오류가 발생했습니다' },
};