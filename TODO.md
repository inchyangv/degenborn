# TODO.md — DegenBorn 실제 동작하지 않는 것 전체 정리

> 시니어 테크리드 관점 감사 결과. 2026-04-12 기준.
> "데모용 시뮬레이션"이 아니라 **실제로 동작하는 제품**을 만들기 위해 고쳐야 할 모든 항목.

---

## 범례

- **[CRITICAL]** — 이것 없으면 핵심 플로우가 가짜다
- **[HIGH]** — 기능이 존재한다고 보이지만 실제로는 안 돈다
- **[MEDIUM]** — 인프라/품질 이슈, 프로덕션에 필요
- **[LOW]** — 개선 사항

---

## 1. [CRITICAL] 민팅이 가짜다

**현재 상태:** `MintButton.tsx:82` — `await new Promise((r) => setTimeout(r, 1500))` 로 1.5초 대기 후 성공 화면 표시. 실제 블록체인 트랜잭션 없음.

**문제:**
- SoulCore 컨트랙트가 BSC Testnet에 배포되어 있음 (`0xAfD84220645Dd21A8214E30f70f0738234Ca37B6`)
- 하지만 프론트엔드에서 `writeContract` 호출이 없음
- 메타데이터를 IPFS에 업로드하지 않음 (`mint/route.ts:47` — "In production: upload metadata to IPFS" 주석만 존재)
- 민팅 성공 후 token ID를 받아서 화면에 반영하는 로직 없음

**해야 할 일:**
- [ ] wagmi `useWriteContract` 훅으로 SoulCore.mint() 호출 연결
- [ ] SoulCore ABI를 프론트엔드에 import (packages/contracts에서)
- [ ] 메타데이터를 IPFS (Pinata 또는 NFT.Storage)에 업로드하는 로직 추가
- [ ] 민팅 트랜잭션 해시, token ID를 UI에 반영
- [ ] 트랜잭션 실패/거부 시 에러 핸들링
- [ ] 가스비 추정 및 표시

**관련 파일:**
- `apps/web/src/components/MintButton.tsx`
- `apps/web/src/app/api/mint/route.ts`
- `packages/contracts/contracts/SoulCore.sol`

---

## 2. [CRITICAL] 지갑 데이터가 항상 가짜다

**현재 상태:** `monster/page.tsx:70`, `birth/page.tsx:127` — 모든 페이지에서 `/api/analyze`를 `useFixture: true`로 호출. 실제 지갑을 연결해도 fixture 데이터 또는 `generateDemoEvents()`가 반환됨.

**문제:**
- `analyze/route.ts:31` — `useFixture || process.env.NODE_ENV === "development"` 조건에 의해 개발 환경에서는 무조건 fixture 우선
- Moralis API 키가 `.env.local`에 존재하지만 절대 호출되지 않음
- 사용자가 실제 지갑을 연결해도 미리 만들어둔 데모 데이터가 나옴

**해야 할 일:**
- [ ] `useFixture: true` 하드코딩을 제거하고, 실제 지갑이면 실제 데이터를 가져오도록 변경
- [ ] fixture는 `0xmad_gambler...` 등 데모 지갑 주소에만 매칭되도록 제한
- [ ] 실제 지갑 → Moralis API → 정규화 → 스코어링 파이프라인 검증
- [ ] Moralis API 호출 실패 시에만 fallback 사용 (현재처럼 무조건 fixture 아님)
- [ ] 데이터 없는 지갑(신규/활동 없음) 대응 UI 추가

**관련 파일:**
- `apps/web/src/app/monster/page.tsx` (line 70)
- `apps/web/src/app/birth/page.tsx` (line 127)
- `apps/web/src/app/api/analyze/route.ts` (line 31)
- `apps/web/src/app/m/[wallet]/page.tsx` (확인 필요)
- `apps/web/src/app/compare/page.tsx` (확인 필요)
- `apps/web/src/app/battle/page.tsx` (확인 필요)

---

## 3. [CRITICAL] ANTHROPIC_API_KEY 미설정

**현재 상태:** `.env.local`에 `ANTHROPIC_API_KEY`가 없음. `.env.example`에만 템플릿 존재.

**영향 범위:**
- `/api/confession` — Claude 대신 아키타입별 고정 문자열 3개 중 랜덤 반환
- `/api/roast` — Claude 대신 DNA 수치를 텍스트에 넣은 템플릿 반환
- `/api/origin` — 원본 스토리 대신 fallback 텍스트

**해야 할 일:**
- [ ] `.env.local`에 `ANTHROPIC_API_KEY` 추가
- [ ] 최신 모델 ID 확인 (`claude-haiku-4-5-20251001` → 현재 유효한지 검증)
- [ ] 각 API 엔드포인트에서 실제 Claude 응답 동작 확인

**관련 파일:**
- `.env.local`
- `apps/web/src/app/api/confession/route.ts` (line 38)
- `apps/web/src/app/api/roast/route.ts` (line 54)
- `apps/web/src/app/api/origin/route.ts`

---

## 4. [CRITICAL] 데이터 영속성 없음 — DB가 없다

**현재 상태:**
- `profile-store.ts:17` — `new Map<string, WalletProfile>()` 인메모리. 프로세스 재시작 시 전부 소멸.
- `diary-store.ts:24` — 인메모리 Map. `DIARY_PERSIST_PATH` 설정 시 JSON 파일에 기록하지만 프로덕션 수준 아님.
- 이미지 캐시, 로스트 캐시 — 전부 인메모리.

**문제:**
- 서버 재시작하면 모든 분석 결과, 다이어리, 프로필이 사라짐
- Vercel 서버리스 환경에서는 요청마다 새 인스턴스 → 데이터 공유 불가
- `.env.example`에 `DATABASE_URL`이 정의되어 있지만 실제 DB 연결 코드 없음

**해야 할 일:**
- [ ] Postgres (또는 최소 SQLite) 데이터베이스 설정
- [ ] `wallet_profile` 테이블: DNA 점수, 아키타입, 시드, 마지막 분석 시각
- [ ] `activity_event` 테이블: 정규화된 이벤트 (현재 `event-store.ts`도 인메모리)
- [ ] `mutation_event` 테이블: 다이어리 항목
- [ ] `generated_asset` 테이블: 생성된 이미지 URL, 프롬프트, 시드
- [ ] `soul_core` 테이블: 민팅된 토큰 정보
- [ ] profile-store.ts를 DB 기반으로 교체
- [ ] diary-store.ts를 DB 기반으로 교체
- [ ] Drizzle, Prisma, 또는 raw pg 중 택 1

**관련 파일:**
- `apps/web/src/lib/profile-store.ts`
- `apps/web/src/lib/diary-store.ts`
- `packages/data-adapter/src/event-store.ts`

---

## 5. [HIGH] 이미지 생성 — 실제 동작하지만 placeholder 폴백 가능성

**현재 상태:** `image-pipeline.ts:63` — `OPENAI_API_KEY`가 있으면 DALL-E 3 호출. 키는 `.env.local`에 존재함.

**문제:**
- DALL-E 호출이 실패하면 `/archetypes/{archetype}_placeholder.svg`로 폴백
- placeholder SVG 파일이 실제로 `public/archetypes/`에 존재하는지 불명
- 이미지 캐시가 인메모리 → 재시작 시 같은 지갑도 재생성 필요
- 이미지를 영구 저장하지 않음 (CDN/S3/IPFS 없음)

**해야 할 일:**
- [ ] placeholder SVG 6종이 실제로 존재하는지 확인
- [ ] DALL-E 호출 성공 시 이미지를 영구 저장소(S3/Cloudinary/IPFS)에 업로드
- [ ] 이미지 URL을 DB에 기록하여 재사용
- [ ] DALL-E 실패 로그 모니터링 추가
- [ ] 생성된 이미지의 일관성 검증 (같은 시드 → 유사 이미지)

**관련 파일:**
- `apps/web/src/lib/image-pipeline.ts`
- `apps/web/src/app/api/genesis/route.ts`
- `apps/web/public/archetypes/` (확인 필요)

---

## 6. [HIGH] 랜딩 페이지 / 갤러리 / 묘지 — 전부 하드코딩

**현재 상태:**
- `page.tsx` (랜딩) — `SAMPLE_MONSTERS` 배열에 5개 몬스터 하드코딩
- `gallery/page.tsx` — `GALLERY_SAMPLES` 배열에 6개 엔트리 하드코딩 ("In production, replace with DB query" 주석)
- `graveyard/page.tsx` — `FLATLINED_SOULS` 배열에 6개 하드코딩

**해야 할 일:**
- [ ] DB에서 실제 민팅된/분석된 캐릭터를 조회하여 랜딩 페이지에 표시
- [ ] 갤러리를 DB 쿼리 기반으로 전환 (아키타입 필터, 페이지네이션)
- [ ] 묘지를 실제 "죽은" 지갑 (survival 낮음, 활동 중단) 기반으로 전환
- [ ] 또는 최소한 fixture에서 동적으로 로드하도록 변경

**관련 파일:**
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/gallery/page.tsx`
- `apps/web/src/app/graveyard/page.tsx`

---

## 7. [HIGH] Evolution(진화)이 온체인에 반영되지 않음

**현재 상태:** `evolution/route.ts` — 상태 변화 감지 → 이미지 재렌더링만 수행. 블록체인 상태 업데이트 없음.

**문제:**
- SoulCore 컨트랙트에 `updateState(tokenId, newStateHash, newTokenURI)` 함수 존재
- 하지만 프론트엔드/API에서 이 함수를 호출하는 코드 없음
- 진화가 일어나도 온체인 기록은 genesis 상태 그대로

**해야 할 일:**
- [ ] 주요 진화 발생 시 SoulCore.updateState() 호출 로직 추가
- [ ] 새 메타데이터를 IPFS에 업로드 후 tokenURI 갱신
- [ ] stateHash 갱신 트랜잭션 처리
- [ ] 관리자(deployer) 지갑에서 서명하는 백엔드 서비스 또는 유저 서명 방식 결정

**관련 파일:**
- `apps/web/src/app/api/evolution/route.ts`
- `packages/contracts/contracts/SoulCore.sol` (updateState 함수)

---

## 8. [HIGH] Snapshot Relic 프론트엔드 연결 없음

**현재 상태:** `SnapshotRelic.sol` — BSC Testnet에 배포 완료 (`0xFBdDD26861F9676376E73Cc538dFb118A0E13b46`). 하지만 프론트엔드에서 민팅/조회하는 코드가 전혀 없음.

**해야 할 일:**
- [ ] 마일스톤 달성 시 Relic 민팅 CTA 표시
- [ ] SnapshotRelic ABI 프론트엔드 import
- [ ] 유저의 보유 Relic 목록 조회 UI (Monster Room에 탭 추가)
- [ ] `.env.local`에 `NEXT_PUBLIC_SNAPSHOT_RELIC_ADDRESS` 추가
- [ ] Relic 메타데이터 생성 및 IPFS 업로드

**관련 파일:**
- `packages/contracts/contracts/SnapshotRelic.sol`
- `apps/web/src/app/monster/page.tsx` (Relic 탭 없음)

---

## 9. [HIGH] Worker가 결과를 저장하지 않음

**현재 상태:** `apps/worker/src/index.ts` — 지갑 활동 가져오기 → DNA 스코어링 → 아키타입 분류까지 수행하지만 결과를 DB에 저장하지 않음. 콘솔 로그만 출력.

**해야 할 일:**
- [ ] Worker에서 스코어링 결과를 DB에 저장
- [ ] 주기적 폴링으로 기존 지갑의 상태 변화 감지
- [ ] 상태 변화 시 mutation event 생성
- [ ] 필요시 evolution 트리거

**관련 파일:**
- `apps/worker/src/index.ts`

---

## 10. [HIGH] RPC 어댑터 미구현

**현재 상태:** `packages/data-adapter/src/adapter.ts` — `throw new Error("RPC adapter not implemented — use moralis or fixture")`

**해야 할 일:**
- [ ] BSC RPC를 통한 직접 트랜잭션 조회 구현 (ethers/viem)
- [ ] Moralis/Covalent 모두 실패 시 fallback으로 사용

**관련 파일:**
- `packages/data-adapter/src/adapter.ts`

---

## 11. [MEDIUM] Moralis API 실제 동작 검증 안 됨

**현재 상태:** Moralis API 키가 `.env.local`에 있지만, `useFixture: true` 때문에 한 번도 호출된 적 없을 가능성 높음.

**해야 할 일:**
- [ ] Moralis API를 직접 호출하여 샘플 지갑 데이터 반환 확인
- [ ] Four.meme 라우터(`0x5c952063c7fc8610ffdb798152d69f0b9550762b`) 필터 동작 검증
- [ ] 정규화(normalizer) 결과가 fixture와 동일한 스키마인지 확인
- [ ] rate limit, timeout, 에러 핸들링 실 환경 테스트

**관련 파일:**
- `packages/data-adapter/src/adapter.ts`
- `packages/data-adapter/src/normalizer.ts`

---

## 12. [MEDIUM] 공유 기능 — 실제 소셜 공유 불완전

**현재 상태:** Share Card UI 존재. html2canvas로 이미지 생성 가능. 하지만:
- Web Share API fallback은 있지만 실제 테스트 안 됨
- OG 이미지(`/api/og/[wallet]`)가 placeholder 사용 가능
- 트위터/X 공유 링크가 실제로 동작하는지 미확인

**해야 할 일:**
- [ ] OG 이미지가 실제 생성된 캐릭터를 반영하는지 확인
- [ ] 공유 URL(`/m/[wallet]`)이 외부에서 접근 가능한지 확인 (배포 후)
- [ ] X(Twitter) 공유 링크 동작 검증
- [ ] 카드 다운로드 기능 검증

**관련 파일:**
- `apps/web/src/components/ShareCard.tsx`
- `apps/web/src/components/TradingCard.tsx`
- `apps/web/src/app/api/og/[wallet]/route.ts`
- `apps/web/src/app/api/share/route.ts`

---

## 13. [MEDIUM] Trait Overlay 에셋 실재 여부 불명

**현재 상태:** CharacterDisplay에서 trait을 렌더링하지만, 실제 오버레이 이미지 에셋(왕관, 상처, 좀비 눈 등)이 존재하는지 확인 안 됨.

**해야 할 일:**
- [ ] `public/` 디렉토리에 trait 에셋 파일 존재 여부 확인
- [ ] SVG 기반 trait overlay가 실제로 base 이미지 위에 합성되는지 확인
- [ ] 6종 이상의 trait가 시각적으로 구분 가능한지 검증
- [ ] trait overlay + DALL-E 생성 이미지의 합성 결과물 확인

**관련 파일:**
- `apps/web/src/components/CharacterDisplay.tsx`
- `apps/web/public/` (trait 에셋 확인 필요)

---

## 14. [MEDIUM] 배포 환경에서의 동작 미검증

**현재 상태:**
- `vercel.json` — 웹앱 배포 설정 존재
- `railway.toml` — 워커 배포 설정 존재
- 하지만 실제 배포 후 동작이 검증되지 않음

**해야 할 일:**
- [ ] Vercel 배포 → 모든 API 라우트 동작 확인
- [ ] Railway 워커 배포 → health 엔드포인트 확인
- [ ] 환경 변수가 배포 환경에 설정되었는지 확인
- [ ] Vercel 서버리스 환경에서 인메모리 스토어의 한계 대응 (DB 필수)
- [ ] CORS, 도메인, SSL 설정 확인

---

## 15. [MEDIUM] DailyDeltaBanner 모킹된 데이터

**현재 상태:** DailyDeltaBanner 컴포넌트에서 mock delta 값 사용.

**해야 할 일:**
- [ ] 실제 지갑의 24시간 내 상태 변화를 계산하여 표시
- [ ] 또는 컴포넌트 제거

---

## 16. [MEDIUM] Battle/Compare — 실제 대전 큐 없음

**현재 상태:** Battle 페이지는 두 지갑의 DNA를 비교하여 결정론적 결과를 보여줌. 실제 매칭 시스템 없음. SummoningBanner에 "incoming challenge" 표시하지만 실제 대전 요청 메커니즘 없음.

**해야 할 일:**
- [ ] 현재 상태 유지 (해커톤 범위에서 P2) 또는 제거
- [ ] SummoningBanner가 오해를 주지 않도록 문구 수정

---

## 17. [LOW] WeeklyRecapModal — 실제 주간 이벤트 아님

**현재 상태:** 월요일에 모달 표시하지만 실제 주간 활동 요약이 아닌 상태 기반 데이터 사용.

**해야 할 일:**
- [ ] 실제 주간 mutation 이벤트 기반으로 요약 생성
- [ ] 또는 기능 비활성화

---

## 18. [LOW] 보안 — 민감 정보 노출

**현재 상태:**
- `.env.local`에 실제 API 키 포함 (Moralis JWT, OpenAI, WalletConnect)
- `packages/contracts/.env.deployer`에 배포자 프라이빗 키 포함
- `.gitignore`에 포함되어 있지만 주의 필요

**해야 할 일:**
- [ ] `.env.local`이 .gitignore에 포함되어 있는지 재확인
- [ ] `.env.deployer`가 .gitignore에 포함되어 있는지 재확인
- [ ] API 키가 git history에 커밋된 적 없는지 확인
- [ ] 해커톤 종료 후 키 로테이션

---

## 요약 — 우선순위별 작업 수

| 등급 | 항목 수 | 설명 |
|------|---------|------|
| CRITICAL | 4 | 핵심 플로우가 가짜 (민팅, 데이터, AI, DB) |
| HIGH | 6 | 기능이 있지만 실제로 안 돈다 |
| MEDIUM | 6 | 인프라/품질/검증 |
| LOW | 2 | 개선 사항 |

## 해커톤 제출 기준 최소 작업 (4/22 마감)

아래만 해결하면 "실제로 돌아가는 데모" 가능:

1. **[CRITICAL] #2** — `useFixture: true` 제거, 실제 지갑은 Moralis로 조회
2. **[CRITICAL] #1** — 실제 SoulCore 민팅 연결 (wagmi writeContract)
3. **[CRITICAL] #3** — ANTHROPIC_API_KEY 설정
4. **[HIGH] #5** — 이미지 생성 동작 확인 (OPENAI_API_KEY는 이미 있음)
5. **[MEDIUM] #11** — Moralis API 실제 호출 검증

DB(#4)는 해커톤에서는 `DIARY_PERSIST_PATH`로 임시 대응 가능하지만, 제품으로서는 필수.
