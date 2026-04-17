/**
 * 도원 포털 - 노션 연동 API
 * n8n webhook을 통해 기업지원팀DB 데이터를 가져옵니다.
 * 웹훅 URL, 캐시 TTL 등은 js/config.js (DW_CONFIG)에서 관리합니다.
 */

const DOWON_API = DW_CONFIG.WEBHOOK;

const CACHE_KEY = 'dowon_businesses_cache';
const CACHE_TTL = DW_CONFIG.CACHE_TTL;

const DowonAPI = {

  /** 사업장 목록 전체 (10분 캐시) */
  async fetchBusinesses() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) return data;
      }
    } catch(e) {}

    const res = await fetch(DOWON_API.businesses);
    if (!res.ok) throw new Error(`사업장 목록 조회 실패 (${res.status})`);
    const json = await res.json();
    if (!json.success) throw new Error('사업장 목록 응답 오류');

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: json.data }));
    } catch(e) {}

    return json.data;
  },

  /** 캐시 강제 초기화 후 재조회 */
  async refreshBusinesses() {
    sessionStorage.removeItem(CACHE_KEY);
    return this.fetchBusinesses();
  },

  /** 사업장 상세 조회 */
  async fetchBusinessDetail(pageId) {
    const res = await fetch(`${DOWON_API.businessDetail}?id=${pageId}`);
    if (!res.ok) throw new Error(`상세 조회 실패 (${res.status})`);
    const json = await res.json();
    if (!json.success) throw new Error('상세 조회 응답 오류');
    return json.data;
  },

  /** 0원 안내 발송 로그 */
  async logZeroMail(pageId) {
    try {
      await fetch(DOWON_API.logZeroMail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_id: pageId }),
      });
    } catch(e) {
      console.warn('로그 기록 실패 (무시)', e);
    }
  },
};

/**
 * 사업장 선택기 컴포넌트
 * 사용법:
 *   BusinessSelector.init('container-id', (biz) => { console.log(biz) });
 */
const BusinessSelector = {

  _instances: {},

  /**
   * @param {string} containerId - 삽입할 div id
   * @param {function} onSelect - 선택 콜백. 인자: { id, name, contact, contract, dowon, ... }
   * @param {object} options - { placeholder, showDetail }
   */
  init(containerId, onSelect, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const placeholder = options.placeholder || '사업장 검색 또는 선택...';

    container.innerHTML = `
      <div class="bs-wrapper">
        <div class="bs-search-row">
          <div class="bs-input-wrap">
            <span class="bs-icon">🏢</span>
            <input type="text" class="bs-input" placeholder="${placeholder}" autocomplete="off" />
            <button class="bs-clear" title="초기화">✕</button>
          </div>
          <button class="bs-refresh" title="목록 새로고침">↺</button>
        </div>
        <div class="bs-dropdown" style="display:none">
          <div class="bs-list"></div>
        </div>
        <div class="bs-selected-card" style="display:none"></div>
        <div class="bs-status"></div>
      </div>
    `;

    this._applyStyles();

    const input    = container.querySelector('.bs-input');
    const dropdown = container.querySelector('.bs-dropdown');
    const list     = container.querySelector('.bs-list');
    const clearBtn = container.querySelector('.bs-clear');
    const refreshBtn = container.querySelector('.bs-refresh');
    const card     = container.querySelector('.bs-selected-card');
    const status   = container.querySelector('.bs-status');

    let allBiz = [];
    let selected = null;

    const showStatus = (msg, isError = false) => {
      status.textContent = msg;
      status.style.color = isError ? '#ef4444' : '#94a3b8';
    };

    const renderList = (items) => {
      list.innerHTML = '';
      if (items.length === 0) {
        list.innerHTML = '<div class="bs-empty">검색 결과 없음</div>';
        return;
      }
      items.slice(0, 50).forEach(biz => {
        const item = document.createElement('div');
        item.className = 'bs-item';
        const immediate = biz.subsidy_immediate ? `<span class="bs-badge-green">즉시 ${Number(biz.subsidy_immediate).toLocaleString()}원</span>` : '';
        const manager = biz.dowon_subsidy_manager ? `<span class="bs-mgr">${biz.dowon_subsidy_manager}</span>` : '';
        item.innerHTML = `
          <div class="bs-item-name">${biz.name} ${immediate}</div>
          <div class="bs-item-sub">${biz.contact_person || '-'} · ${biz.biz_reg_no || '-'} ${manager}</div>
        `;
        item.addEventListener('mousedown', (e) => {
          e.preventDefault();
          selectBiz(biz);
        });
        list.appendChild(item);
      });
      if (items.length > 50) {
        list.innerHTML += `<div class="bs-empty">외 ${items.length - 50}개 → 검색어를 입력하세요</div>`;
      }
    };

    const selectBiz = (biz) => {
      selected = biz;
      input.value = biz.name;
      dropdown.style.display = 'none';
      clearBtn.style.display = 'block';

      card.style.display = 'block';
      card.innerHTML = `
        <div class="bs-card-row">
          <span class="bs-card-label">사업장명</span><span class="bs-card-val">${biz.name}</span>
        </div>
        <div class="bs-card-row">
          <span class="bs-card-label">담당자</span><span class="bs-card-val">${biz.contact_person || '-'}</span>
        </div>
        <div class="bs-card-row">
          <span class="bs-card-label">이메일</span><span class="bs-card-val">${biz.contact_email || '-'}</span>
        </div>
        <div class="bs-card-row">
          <span class="bs-card-label">사업자번호</span><span class="bs-card-val">${biz.biz_reg_no || '-'}</span>
        </div>
        <div class="bs-card-row">
          <span class="bs-card-label">도원담당</span><span class="bs-card-val">${biz.dowon_subsidy_manager || '-'}</span>
        </div>
        <div class="bs-card-row">
          <span class="bs-card-label">즉시금액</span><span class="bs-card-val bs-green">${biz.subsidy_immediate ? Number(biz.subsidy_immediate).toLocaleString() + '원' : '-'}</span>
        </div>
      `;

      if (onSelect) onSelect(biz);
    };

    const clearSelection = () => {
      selected = null;
      input.value = '';
      card.style.display = 'none';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
      if (onSelect) onSelect(null);
    };

    const loadBiz = async () => {
      showStatus('사업장 목록 불러오는 중...');
      input.disabled = true;
      try {
        allBiz = await DowonAPI.fetchBusinesses();
        showStatus(`총 ${allBiz.length}개 사업장`);
        input.disabled = false;
        input.placeholder = placeholder;
      } catch(e) {
        showStatus('목록 로드 실패 → n8n 연결을 확인하세요', true);
        input.disabled = false;
      }
    };

    input.addEventListener('focus', () => {
      // 빈 상태 포커스에서는 자동으로 드롭다운을 열지 않음 (아래 업로드 영역 클릭 가로채는 문제 방지)
      const q = input.value.trim();
      if (q && allBiz.length > 0) {
        renderList(allBiz.filter(b => b.name.includes(q) || (b.contact_person||'').includes(q) || (b.biz_reg_no||'').includes(q)));
        dropdown.style.display = 'block';
      }
    });

    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) {
        dropdown.style.display = 'none';
        return;
      }
      renderList(allBiz.filter(b =>
        b.name.includes(q) ||
        (b.contact_person||'').includes(q) ||
        (b.biz_reg_no||'').includes(q) ||
        (b.mgmt_no||'').includes(q)
      ));
      dropdown.style.display = 'block';
    });

    // 바깥 클릭 시 즉시 드롭다운 숨김 (setTimeout 제거 → 업로드 영역 클릭 가로채기 방지)
    document.addEventListener('mousedown', (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    }, true);

    clearBtn.addEventListener('click', clearSelection);

    refreshBtn.addEventListener('click', async () => {
      refreshBtn.textContent = '...';
      refreshBtn.disabled = true;
      try {
        allBiz = await DowonAPI.refreshBusinesses();
        showStatus(`총 ${allBiz.length}개 사업장 (새로고침 완료)`);
      } catch(e) {
        showStatus('새로고침 실패', true);
      }
      refreshBtn.textContent = '↺';
      refreshBtn.disabled = false;
    });

    loadBiz();

    this._instances[containerId] = { getSelected: () => selected, clearSelection };
    return this._instances[containerId];
  },

  getSelected(containerId) {
    return this._instances[containerId]?.getSelected() || null;
  },

  _applyStyles() {
    if (document.getElementById('bs-styles')) return;
    const style = document.createElement('style');
    style.id = 'bs-styles';
    style.textContent = `
      .bs-wrapper { position: relative; font-family: inherit; }
      .bs-search-row { display: flex; gap: 6px; align-items: center; }
      .bs-input-wrap { position: relative; flex: 1; display: flex; align-items: center;
        background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 0 10px; }
      .bs-icon { font-size: 14px; margin-right: 6px; }
      .bs-input { flex: 1; background: transparent; border: none; outline: none;
        color: #e2e8f0; font-size: 14px; padding: 10px 0; }
      .bs-input::placeholder { color: #64748b; }
      .bs-input:disabled { opacity: 0.5; }
      .bs-clear { background: none; border: none; color: #64748b; cursor: pointer;
        font-size: 14px; padding: 4px; display: none; }
      .bs-clear:hover { color: #e2e8f0; }
      .bs-refresh { background: #1e293b; border: 1px solid #334155; border-radius: 8px;
        color: #94a3b8; cursor: pointer; padding: 10px 12px; font-size: 16px;
        transition: all 0.2s; }
      .bs-refresh:hover { background: #334155; color: #e2e8f0; }
      .bs-dropdown { position: absolute; top: 100%; left: 0; right: 40px; z-index: 1000;
        background: #1e293b; border: 1px solid #334155; border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4); max-height: 220px; overflow-y: auto;
        margin-top: 4px; }
      .bs-dropdown[style*="display: none"], .bs-dropdown[style*="display:none"] { pointer-events: none; }
      .bs-list { }
      .bs-item { padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #1a2535;
        transition: background 0.15s; }
      .bs-item:hover { background: #263347; }
      .bs-item:last-child { border-bottom: none; }
      .bs-item-name { font-size: 14px; color: #e2e8f0; font-weight: 500; display: flex;
        align-items: center; gap: 6px; }
      .bs-item-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
      .bs-badge-green { font-size: 11px; background: rgba(16,185,129,0.15);
        color: #10b981; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
      .bs-mgr { font-size: 11px; color: #818cf8; background: rgba(129,140,248,0.1);
        padding: 1px 6px; border-radius: 4px; }
      .bs-empty { padding: 12px 14px; color: #64748b; font-size: 13px; text-align: center; }
      .bs-selected-card { background: #0f172a; border: 1px solid #334155; border-radius: 8px;
        padding: 12px 14px; margin-top: 8px; display: grid;
        grid-template-columns: 1fr 1fr; gap: 6px; }
      .bs-card-row { display: flex; flex-direction: column; gap: 1px; }
      .bs-card-label { font-size: 10px; color: #64748b; text-transform: uppercase;
        letter-spacing: 0.05em; }
      .bs-card-val { font-size: 13px; color: #e2e8f0; }
      .bs-green { color: #10b981 !important; font-weight: 600; }
      .bs-status { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    `;
    document.head.appendChild(style);
  },
};
