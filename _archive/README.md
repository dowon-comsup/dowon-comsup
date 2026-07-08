# _archive — 보존용 (배포 제외)

이 폴더는 GitHub Pages 빌드(레거시 Jekyll, `_` 접두 폴더 자동 제외)에서 **서빙되지 않습니다.**
아래 도구들은 삭제가 아니라 **되돌리기 가능하게 격리**된 것입니다. 복구하려면 `git mv _archive/tools/<파일> tools/` 후 index.html에 링크를 다시 추가하세요.

## 격리 사유 (2026-07-08)
포털 최소 구성 재기획을 위해 실사용 핵심 7종만 남기고 격리:
- `payroll-v9_1.html` — 死파일(index 미링크·구버전, payroll-verify가 대체)
- `businesses.html` — 사업장 현황(n8n→노션). 재기획 시 노션 API 연계로 재설계 예정
- `call-dashboard.html` — 통화 대시보드(Supabase). ⚠ anon키 하드코딩분 서빙 중단됨
- `meeting-minutes.html` — 회의록 자동화
- `investigation-tool.html` — 조사 문답지 자동완성(WIP 보존됨)
