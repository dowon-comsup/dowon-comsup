/**
 * 도원 포털 - 공유 유틸리티
 * 여러 도구에서 공통으로 사용하는 함수를 한 곳에서 관리합니다.
 */

/** HTML 특수문자 이스케이프 (XSS 방지) */
function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const escHtml = escapeHtml;
const esc = escapeHtml;

/** 스캔 PDF 페이지 감지 (텍스트 레이어 품질 기반) */
function detectScannedPage(nativeText) {
  const t = (nativeText || '').replace(/[\s\u00A0\u3000]+/g, '');
  if (t.length < 20) return true;
  const broken = (t.match(/[\uFFFD\u0000-\u001F]/g) || []).length;
  if (broken / t.length > 0.1) return true;
  const meaningful = t.match(/[가-힣A-Za-z0-9]/g) || [];
  if (meaningful.length < 15) return true;
  const hangul = t.match(/[가-힣]/g) || [];
  if (hangul.length < 5 && t.length < 80) return true;
  return false;
}
