/**
 * 도원 포털 - 중앙 설정
 * 웹훅 URL, localStorage 키 이름, 캐시 TTL 등을 한 곳에서 관리합니다.
 * URL이나 키 이름 변경 시 이 파일만 수정하면 됩니다.
 */

const DW_CONFIG = {

  /** n8n 웹훅 엔드포인트 */
  WEBHOOK: {
    businesses:     'https://n8n-docker.dowonbiz.com/webhook/businesses',
    businessDetail: 'https://n8n-docker.dowonbiz.com/webhook/business-detail',
    logZeroMail:    'https://n8n-docker.dowonbiz.com/webhook/log-zero-mail',
  },

  /** localStorage 키 이름 (도구 간 공유) */
  STORAGE_KEYS: {
    anthropic: 'ANTHROPIC_API_KEY',
    claude:    'CLAUDE_API_KEY',
    gemini:    'GEMINI_API_KEY',
  },

  /** 사업장 목록 캐시 TTL (ms) */
  CACHE_TTL: 10 * 60 * 1000,  // 10분
};
