/**
 * dowon-comsup 공통 결과 모달
 *
 * 사용법:
 *   DwModal.show('제목', '<div>결과 HTML</div>');
 *   DwModal.close();
 */
(function () {
  'use strict';

  // 이미 초기화된 경우 스킵
  if (window.DwModal) return;

  // ─── 모달 DOM 생성 ───
  const overlay = document.createElement('div');
  overlay.id = 'dwModalOverlay';

  const panel = document.createElement('div');
  panel.id = 'dwModalPanel';

  const header = document.createElement('div');
  header.id = 'dwModalHeader';

  const title = document.createElement('span');
  title.id = 'dwModalTitle';

  const controls = document.createElement('div');
  controls.id = 'dwModalControls';

  const btnFull = document.createElement('button');
  btnFull.id = 'dwModalFullscreen';
  btnFull.title = '전체화면';
  btnFull.innerHTML = '&#x26F6;'; // ⛶

  const btnClose = document.createElement('button');
  btnClose.id = 'dwModalClose';
  btnClose.title = '닫기';
  btnClose.innerHTML = '&times;';

  controls.appendChild(btnFull);
  controls.appendChild(btnClose);
  header.appendChild(title);
  header.appendChild(controls);

  const body = document.createElement('div');
  body.id = 'dwModalBody';

  panel.appendChild(header);
  panel.appendChild(body);
  overlay.appendChild(panel);

  // ─── 스타일 ───
  const style = document.createElement('style');
  style.textContent = `
    #dwModalOverlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9000;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(2px);
      justify-content: center;
      align-items: center;
      padding: 24px;
      animation: dwFadeIn 0.15s ease;
    }
    #dwModalOverlay.active { display: flex; }

    #dwModalPanel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 24px 48px -12px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      width: 90%;
      max-width: 960px;
      max-height: 85vh;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    #dwModalPanel.fullscreen {
      width: 100% !important;
      max-width: 100% !important;
      max-height: 100vh !important;
      border-radius: 0 !important;
    }

    #dwModalOverlay.active.fullscreen {
      padding: 0;
    }

    #dwModalHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid #e5e5e5;
      background: #fafafa;
      flex-shrink: 0;
    }

    #dwModalTitle {
      font-size: 14px;
      font-weight: 700;
      color: #171717;
      letter-spacing: -0.3px;
    }

    #dwModalControls {
      display: flex;
      gap: 4px;
    }

    #dwModalControls button {
      width: 32px;
      height: 32px;
      border: 1px solid #e5e5e5;
      background: #fff;
      border-radius: 6px;
      font-size: 16px;
      color: #737373;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.12s;
      font-family: inherit;
      line-height: 1;
    }

    #dwModalControls button:hover {
      background: #f5f5f5;
      color: #171717;
      border-color: #d4d4d4;
    }

    #dwModalClose:hover {
      background: #dc2626 !important;
      color: #fff !important;
      border-color: #dc2626 !important;
    }

    #dwModalBody {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
      font-size: 13px;
      line-height: 1.65;
      color: #262626;
    }

    /* 모달 내부 테이블 */
    #dwModalBody table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin: 8px 0;
    }

    #dwModalBody table th,
    #dwModalBody table td {
      padding: 7px 10px;
      border: 1px solid #e5e5e5;
      text-align: left;
      vertical-align: top;
    }

    #dwModalBody table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #525252;
      font-size: 11px;
      white-space: nowrap;
    }

    #dwModalBody table tr:hover td { background: #fafafa; }

    /* 모달 내부 섹션 */
    #dwModalBody .section { margin-bottom: 12px; }

    @keyframes dwFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (max-width: 768px) {
      #dwModalOverlay { padding: 8px; }
      #dwModalPanel { width: 100%; max-height: 90vh; border-radius: 10px; }
      #dwModalBody { padding: 14px; }
    }
  `;

  // ─── 상태 ───
  let isFullscreen = false;

  // ─── 이벤트 ───
  btnClose.addEventListener('click', close);

  btnFull.addEventListener('click', function () {
    isFullscreen = !isFullscreen;
    panel.classList.toggle('fullscreen', isFullscreen);
    overlay.classList.toggle('fullscreen', isFullscreen);
    btnFull.innerHTML = isFullscreen ? '&#x2750;' : '&#x26F6;'; // ❐ or ⛶
    btnFull.title = isFullscreen ? '창 모드' : '전체화면';
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) close();
  });

  // ─── API ───
  function show(titleText, html) {
    title.textContent = titleText || '결과';
    body.innerHTML = html || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('active', 'fullscreen');
    panel.classList.remove('fullscreen');
    isFullscreen = false;
    btnFull.innerHTML = '&#x26F6;';
    document.body.style.overflow = '';
  }

  function appendToBody(html) {
    body.insertAdjacentHTML('beforeend', html);
  }

  // ─── 초기화 ───
  function init() {
    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── Export ───
  window.DwModal = { show, close, appendToBody };
})();
