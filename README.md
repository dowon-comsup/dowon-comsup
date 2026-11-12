# dowon-comsup — 노무법인 도원 기업지원팀 개발 저장소

기업지원팀(고용지원금·4대보험 환급 대행)의 자동화·도구 저장소 모음. 2026-11-12 정리.

## 저장소 목록

| 저장소 | 공개 | 상태 | 역할 |
|---|---|---|---|
| [dowon-knowledge-bot](https://github.com/dowon-comsup/dowon-knowledge-bot) | 비공개 | 운영 | 에이전트 기업지원팀(슬랙 봇) — 아래 「에이전트 시스템」 |
| [4-repo](https://github.com/dowon-comsup/4-repo) | 공개 | 운영 | 4대보험 적용제외 판정 MCP 서버(Render) |
| [korean-law-mcp](https://github.com/dowon-comsup/korean-law-mcp) | 비공개 | 운영 | 국가법령정보(법령·판례·행정규칙) 조회 MCP 서버 |
| [team-dashboard](https://github.com/dowon-comsup/team-dashboard) | 비공개 | 운영 | 기업지원팀 월간 대시보드 — 노션→원장→집계, GitHub Actions 매시 갱신 |
| [team-dashboard-view](https://github.com/dowon-comsup/team-dashboard-view) | 공개 | 운영 | 대시보드 게시본(GitHub Pages, 데이터 암호화·열람 키 필요) |
| [call-repo](https://github.com/dowon-comsup/call-repo) | 비공개 | 운영 | Call Pipeline — 통화녹음 → STT → 노션 통화기록(안드로이드 앱+n8n) |
| dowon-comsup (이 저장소) | 공개 | 운영 | 4대보험 환급 도구 웹포털(GitHub Pages) + 계정 프로필 |
| [dowo-doc-portal](https://github.com/dowon-comsup/dowo-doc-portal) | 비공개 | 보관 | 서류요청포탈 v1 — v2(n8n+Supabase)로 대체 |

정리 기록(2026-11-12): 빈 저장소 `-`, `dowon-predictor`(2026-04 이후 미사용), `refund-workbench`(4대보험 임시 워크벤치 — 신 ERP로 이관) 삭제. 삭제 전 전체 이력은 로컬 bundle로 백업.

## 에이전트 시스템 (dowon-knowledge-bot)

슬랙에서 팀원마다 붙는 전담 에이전트와, 뒤에서 일을 나눠 맡는 업무 에이전트로 이루어진 「에이전트 기업지원팀」.

```
팀원 ──(슬랙 DM)── 전담 에이전트(1인 1명, 창구·알림 하나)
                        │
                     총괄(팀장) ── 일 배분 · 알림을 하루 2회 한 통으로 묶음
                        │
   ┌──────────┬─────────┼──────────┬───────────┐
 지원금      환급      대리인      기록       메일 · 정산수금 · 어드민
 결과보고서 · 소통 · 메일조회 · 검증·반론(다른 에이전트 답 반박 검토)
                        │
   도구: 노션(읽기 허용목록·쓰기는 승인 카드) · 도원어드민 · NAS · 고용24/근복(조회)
         · 법령 MCP · 기한 계산기
                        │
   개발팀 파이프라인: 기능 요청 → 작업트리 개발 → 검수 게이트 → 승인 후 반영
```

| 구성 | 내용 |
|---|---|
| 에이전트 | 총괄 1 + 업무 에이전트 11 + 팀원별 전담 에이전트. 판단·법령·금액은 상위 모델, 정형·조회는 하위 모델로 분기 |
| 안전장치 | 외부 시스템 쓰기·발송은 사람 승인 카드 뒤에만 실행 · 개인정보 줄 가림 · 도구별 감사 로그 · 새 규칙은 1명 시범 후 전파 |
| 예약 작업 | 아침 브리핑·할 일 찾기, 계약·기초정보 회신 대조, 임채 자료요청 상태, 정산·수금 점검, 메일 첨부 NAS 점검, 새벽 지식 조사, 업무일지 초안, 주간 성장 회고, 주 1회 지식·도구 평가 등 20여 종 |
| 실행 환경 | 사내 Mac 1대(launchd 상시 기동·다운 감시·재부팅 자동 복귀), 관리 콘솔 웹, 매일 새벽 암호화 백업 → NAS |
| 지식 정본 | 별도 로컬 저장소 `dowon-knowledge`(제도·기한 규칙) — 비공개 |

GitHub의 `dowon-knowledge-bot`은 로컬 원본 `main`의 **개인정보 마스킹 사본**(주민·사업자·관리번호, 휴대전화, 외부 메일 치환)이다. 갱신은 원본에 원격을 달지 말고 `02_automation/github-snapshot/snapshot_bot.sh`로만 한다.
