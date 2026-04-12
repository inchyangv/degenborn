# TODO.md — DegenBorn 실전 감사 결과

> 2026-04-12 기준, 시니어 테크리드 감사.
> 모킹/페이크/안 돌아가는 것 전부 적발. 우선순위별 정리.

---

## P0-CRITICAL: 빌드 자체가 안 됨

현재 `pnpm build`가 실패한다. 배포도 불가능.

### 1. Worker 타입 불일치 (`apps/worker/src/index.ts:113`)
- **문제:** Worker 내부 `WalletProfile` 인터페이스가 `dna.sample_size`를 요구하지만, `@degenborn/shared`의 `PersonaDNA`는 `event_count`/`computed_at`를 갖고 있음
- **증상:** `TS2741: Property 'sample_size' is missing`
- **수정:** Worker의 로컬 `WalletProfile` 인터페이스를 shared의 `PersonaDNA` 타입에 맞게 수정

### 2. Next.js Route Export 위반 (`apps/web/src/app/api/relic/route.ts`)
- **문제:** `getEligibleMilestones`가 route 파일에서 named export 되어 있음. Next.js App Router는 HTTP method handler만 허용 (`GET`, `POST` 등)
- **증상:** `next build` 실패
- **수정:** `getEligibleMilestones`를 별도 lib 파일로 이동하거나 export 제거

### 3. BigInt 타겟 불일치 (`api/evolution/route.ts`, `api/relic/route.ts`)
- **문제:** `tsconfig`이 ES2017을 타겟하지만 코드에서 BigInt 리터럴(`0n`) 사용
- **증상:** `tsc --noEmit` 실패 (SWC 빌드는 통과할 수 있으나 타입체크 깨짐)
- **수정:** tsconfig target을 ES2020으로 올리거나, BigInt 리터럴을 `BigInt(0)`으로 변경

### 4. Fixture 파일명-주소 불일치
- **문제:** fixture 파일은 `0xmad_gambler.json`인데, 내부 wallet_address는 `0xmadgambler0000000000000000000000000000001`. `loadFixture`는 주소를 기반으로 파일을 찾으므로 매칭 실패
- **증상:** Worker에서 fixture 로드 항상 실패 -> 실제 API로 폴백 -> API 키 없으면 전체 실패
- **수정:** fixture 파일명을 내부 wallet_address와 일치시키거나, loadFixture 로직에 매핑 추가

---

## P0-HIGH: 돌아가긴 하는데 가짜 데이터를 보여줌

### 5. `/api/analyze`가 실패 시 조용히 가짜 데이터 반환
- **문제:** Moralis/Covalent 호출 실패 시 `generateDemoEvents()`로 20개 합성 이벤트를 생성하여 200 OK로 반환. 응답에 실제/가짜 여부 표시 없음
- **영향:** 유저가 자기 지갑의 진짜 분석 결과를 보고 있다고 착각
- **수정:** 응답에 `data_source: "live" | "demo" | "fixture"` 필드 추가. UI에서 demo 모드일 때 명확히 표시

### 6. Monster Room이 항상 Level 1에서 시작 (`apps/web/src/app/monster/page.tsx`)
- **문제:** 매 페이지 로드마다 `createInitialState()`로 새로운 레벨 1 상태 생성. 이전 mutation/evolution 이력이 반영 안 됨
- **영향:** 유저가 돌아와도 진화 상태가 리셋됨
- **수정:** 서버에서 누적 state를 로드하는 로직 추가 (diary entries를 replay하여 state 재구성, 또는 profile store에 state 영속화)

### 7. Activity Breakdown 수치가 완전 가짜 (`apps/web/src/app/monster/page.tsx`)
- **문제:** "Buys", "Sells", "Dead tokens", "Revivals" 수치가 DNA 점수에 임의 공식을 적용하여 생성 (`Math.round(dna.aggression * 0.4 + dna.event_count * 0.3)` 등). 실제 트랜잭션 카운트가 아님
- **영향:** 유저에게 거짓 정보 표시
- **수정:** analyze API 응답에서 실제 이벤트 타입별 카운트를 집계하여 전달

### 8. 상태 캡션 버그 (`apps/web/src/lib/state-machine.ts`)
- **문제:** `big_loss` 캡션이 `Math.abs(0)` 사용 → 항상 "Down 0 USD". `long_hold` 캡션이 `Math.floor(0 / 86400)` 사용 → 항상 "0 days held"
- **원인:** 이벤트 객체에서 실제 손실액/보유 기간 데이터를 받지 않고 하드코딩된 0 사용
- **수정:** `StateEvent` 타입에 `amount`/`duration` 필드 추가, 캡션 생성 시 실제 값 사용

### 9. Birth 페이지에서 Genesis 이미지 미호출
- **문제:** `/birth` 페이지가 `/api/genesis-image` 또는 `/api/genesis`를 호출하지 않음. 유저가 처음 보는 캐릭터가 placeholder SVG
- **영향:** DALL-E 통합이 있음에도 Birth에서는 항상 placeholder 표시
- **수정:** Birth 플로우의 Genesis 단계에서 이미지 생성 API 호출 추가

### 10. DALL-E 이미지 URL이 ~1시간 후 만료
- **문제:** OpenAI가 반환하는 이미지 URL은 임시(~1시간 유효). 인메모리 캐시에만 저장. 프로세스 재시작 시 캐시 소멸, URL 만료 후 이미지 깨짐
- **영향:** 생성된 캐릭터 이미지가 시간이 지나면 404
- **수정:** 이미지를 S3/Cloudflare R2/Vercel Blob 등에 영구 저장. URL 대신 저장된 경로 사용

---

## P0-MEDIUM: 핵심 기능 결함

### 11. 모든 상태가 인메모리 (DB 없음)
- **문제:** `profile-store`, `diary-store`, `image-cache` 모두 인메모리 Map 또는 `/tmp` JSON 파일. Vercel 서버리스에서는 요청마다 인스턴스가 달라서 상태 공유 불가
- **영향:** 프로필 분석, 다이어리 기록, 이미지 캐시 모두 요청 간 유실 가능
- **수정 옵션:**
  - (최소) Vercel KV / Upstash Redis로 state 영속화
  - (권장) Postgres (Supabase/Neon) 도입 → PROJECT.md 설계대로

### 12. `/api/mint` 이벤트 토픽 해시가 가짜 (`apps/web/src/app/api/mint/route.ts:153`)
- **문제:** `0x5b4e851e4f97ec3e0b1e7f0d5dfea8e1f9c5e2d0c4f8b3a2e1d0c9b8a7f6e5d4`는 실제 `SoulCoreCreated` 이벤트의 keccak256이 아님. 완전히 조작된 값
- **영향:** 트랜잭션 로그에서 token ID 파싱 실패 → fallback 주소 매칭에 의존 (약한 휴리스틱)
- **수정:** 실제 SoulCore 컨트랙트의 `SoulCoreCreated` 이벤트 시그니처로 keccak256 계산하여 교체

### 13. `/api/share`가 항상 placeholder SVG 사용
- **문제:** share card의 `image_url`이 항상 `_placeholder.svg`를 사용. DALL-E로 생성된 이미지가 있어도 무시
- **수정:** profile store에서 생성된 이미지 URL이 있으면 우선 사용

### 14. `getPreviewUrl`이 항상 base image만 반환 (`overlay-renderer.ts`)
- **문제:** trait overlay 합성 결과를 반환하는 대신 항상 원본 이미지 URL만 반환. 실시간 overlay 합성 결과가 노출 안 됨
- **수정:** 비동기 합성 완료 후 결과 URL/데이터URL을 캐시하고 반환하는 로직 추가

### 15. RPC 어댑터의 Four.meme 플래그 미작동 (`data-adapter/src/normalizer.ts:298`)
- **문제:** `log.address`(ERC-20 Transfer에서는 토큰 컨트랙트 주소)를 Four.meme 라우터 주소와 비교. Transfer 이벤트의 `log.address`는 라우터가 아니라 토큰이므로 항상 `false`
- **수정:** `log.topics` 또는 트랜잭션의 `to` 주소와 라우터 비교

### 16. Covalent/RPC 소스에서 3/5 DNA 축이 무의미
- **문제:** Covalent은 `pnl_delta: 0`, RPC는 `pnl_delta: 0` + `value_usd: 0`으로 모든 이벤트 생성. Chaos, Luck, Survival 점수가 거의 0으로 수렴
- **영향:** Moralis만 정상 작동. 다른 소스에서는 Aggression/Conviction만 유의미
- **수정:** (Covalent) 가격 API 연동하여 PnL 추정. (RPC) DEX 이벤트 디코딩 + 가격 오라클 추가. 또는 UI에서 데이터 소스 한계를 명시

---

## P1: 보안 및 안정성

### 17. Mint/Relic 엔드포인트에 인증/레이트리밋 없음
- **문제:** `/api/mint`, `/api/relic` 누구나 호출 가능. 스팸 호출로 deployer 지갑의 BNB 가스비 고갈 가능
- **수정:** 최소한 wallet signature 검증 또는 reCAPTCHA. 레이트리밋 추가 (IP 또는 지갑 기준)

### 18. SoulCore `approve()`/`setApprovalForAll()` 미차단
- **문제:** Soulbound 토큰인데 approve 함수가 정상 작동. 의미 없는 가스 소비 + 오해 유발
- **수정:** `approve()`와 `setApprovalForAll()`을 override하여 revert 처리

### 19. 스마트 컨트랙트 BscScan 미인증
- **문제:** SoulCore, SnapshotRelic 모두 BscScan에서 소스코드 미공개
- **수정:** `npx hardhat verify --network bscTestnet <address> <constructor-args>`

### 20. deployer 키 노출 리스크
- **문제:** `.env.local`과 `.env.deployer`에 평문 개인키 존재. `.gitignore`에는 있으나 주의 필요
- **수정:** 메인넷 배포 전 키 로테이션 필수. 배포 시 secret manager 사용 (Vercel env vars, Railway secrets)

---

## P1: 코드 품질 및 기능 완성도

### 21. Landing 페이지 몬스터 캐러셀이 가짜 지갑 사용
- **문제:** `0xrugnecromancer...`, `0xicewhale...` 등 가짜 주소의 하드코딩된 샘플 몬스터 표시
- **수정:** 실제 분석된 프로필에서 동적으로 로드하거나, 최소한 fixture 데이터와 일관성 맞추기

### 22. `/api/profiles`가 항상 하드코딩 fixture 프로필 반환
- **문제:** 서버 재시작 후 인메모리 프로필 스토어가 비어있으면 6개 가짜 프로필 반환 (`is_fixture: true`)
- **수정:** DB 도입 후 실제 분석된 프로필만 반환

### 23. Scan 로그 애니메이션이 코스메틱 연극 (`birth/page.tsx`)
- **문제:** `SCAN_LOG_LINES`가 하드코딩된 문자열 배열. 실제 API 처리 진행률과 무관하게 타이머 기반 표시
- **수정:** (최소) 실제 진행 상태 표시 불가 시 "분석 중..." 단일 스켈레톤으로 변경. (권장) SSE/WebSocket으로 실제 진행률 전달

### 24. Unibase 통합이 완전 데드코드 (`lib/unibase-adapter.ts`)
- **문제:** endpoint URL이 "placeholder URL"로 명시. `UNIBASE_ENABLED=false`. Cyrillic 문자 혼용 (`Unibаse`의 `а`가 키릴 문자)
- **수정:** 실제 Unibase API가 준비될 때까지 코드 제거하거나, 명확히 disabled 상태로 격리

### 25. `scoreAggression` 데드코드 (`packages/scoring/src/engine.ts:60`)
- **문제:** `raw` 변수 계산 후 사용 안 됨. 바로 다음 줄에서 다른 공식으로 재계산
- **수정:** 데드코드 제거

### 26. `narrative.ts`의 금지어 필터가 과도함
- **문제:** "buy", "sell", "invest" 등 일반 문맥에서도 정상적인 단어를 `***`로 치환. "I'd sell my soul" → "I'd *** my soul"
- **수정:** 금융 조언 맥락에서만 필터링하도록 정규식 정교화, 또는 LLM 프롬프트에서 사전 방지

### 27. `name.ts` 제목 임계값 오해 소지
- **문제:** `Twice-Rugged` 타이틀이 `scar_count >= 3`에서 발동 (3번 = "두 번"?)
- **수정:** 타이틀 이름 또는 임계값 조정

### 28. SFX가 하드코딩 합성 비프음
- **문제:** `/public/sfx/` 디렉토리 없음. Web Audio API로 오실레이터 생성하는 stub
- **수정:** (최소) 현 상태로 유지 (해커톤 수준). (권장) 짧은 사운드 에셋 추가

### 29. `/api/origin`, `/api/roast`의 JSON 파싱 취약
- **문제:** LLM 출력에서 `rawText.match(/\{[\s\S]*\}/)` 사용. 중첩 JSON이나 다중 JSON 블록에서 오매칭 가능
- **수정:** `JSON.parse` 직접 시도 → 실패 시 정규식 fallback. 또는 Anthropic structured output 사용

### 30. `deployedAt` 타임스탬프 덮어쓰기 (`packages/contracts/deployments/bscTestnet.json`)
- **문제:** deploy-relic 스크립트 실행 시 SoulCore의 deploy 타임스탬프가 SnapshotRelic 것으로 덮어써짐
- **수정:** `deployedAt`를 컨트랙트별로 분리 (`soulCoreDeployedAt`, `relicDeployedAt`)

---

## P1: 테스트 커버리지 부족

### 31. `@degenborn/shared` 패키지 테스트 0개
- **문제:** badges, horoscope, tarot, tier, lexicon, caption, dialogue 등 모든 모듈에 테스트 없음
- **수정:** 최소 badges.evaluateBadges, computeTier, checkLexicon, pickDialogue에 단위 테스트 추가

### 32. SoulCore burn 경로 테스트 없음
- **문제:** `_update`의 burn 브랜치 (`_walletToToken` cleanup)가 테스트 미커버
- **수정:** burn 시 walletToToken 매핑 정리 확인 테스트 추가

### 33. Archetype classifier 신뢰도/fallback 테스트 없음
- **문제:** 모든 점수가 중간(35-64)일 때 fallback 경로, confidence 값 검증 없음
- **수정:** all-mid DNA 입력 시 fallback 동작 테스트 추가

### 34. Scoring 엔진에서 pnl_delta=0 시나리오 테스트 없음
- **문제:** RPC/Covalent 소스에서 현실적으로 발생하는 모든 pnl_delta=0 케이스 미테스트
- **수정:** 전체 이벤트 pnl_delta=0 입력 시 점수 분포 테스트

---

## P2: 해커톤 이후 개선

### 35. Postgres DB 도입
- 인메모리 스토어를 Supabase/Neon Postgres로 교체
- `wallet_profile`, `activity_event`, `mutation_event`, `generated_asset` 테이블 생성

### 36. 이미지 영구 저장소 (S3/R2/Vercel Blob)
- DALL-E 생성 이미지를 영구 저장
- tokenURI에서 안정적인 이미지 URL 제공

### 37. Unibase 실제 연동
- 실제 API endpoint 확보 후 adapter 연결
- Cyrillic 문자 정리

### 38. 다중 데이터 소스 PnL 보강
- Covalent: CoinGecko/Moralis 가격 API 연동하여 PnL 계산
- RPC: DEX 이벤트 디코딩 + AMM 가격 추출

### 39. Analytics 연동 (PostHog)
- PostHog 키 설정 및 주요 이벤트 트래킹 활성화

### 40. CI/CD 파이프라인
- GitHub Actions: lint, typecheck, test, build
- 컨트랙트 자동 verify
- 환경별 배포 (staging/production)

---

## 요약 대시보드

| 카테고리 | 항목 수 | 상태 |
|----------|---------|------|
| 빌드 깨짐 (P0-CRITICAL) | 4 | 즉시 수정 필요 |
| 가짜 데이터 노출 (P0-HIGH) | 6 | 핵심 UX 결함 |
| 핵심 기능 결함 (P0-MEDIUM) | 6 | 실제 동작 안 함 |
| 보안/안정성 (P1) | 4 | 배포 전 수정 |
| 코드 품질 (P1) | 10 | 품질 개선 |
| 테스트 (P1) | 4 | 커버리지 확대 |
| 해커톤 이후 (P2) | 6 | 로드맵 |
| **전체** | **40** | |

### TICKET.md 최종 체크리스트 현황

| # | 기준 | 현재 상태 |
|---|------|----------|
| 1 | 지갑 연결 후 archetype이 30초 안에 나온다 | **부분** — Moralis 키 있으면 OK, 실패 시 가짜 데이터로 OK처럼 보임 |
| 2 | 캐릭터가 생성되거나 placeholder로 나타난다 | **부분** — placeholder SVG만 표시, DALL-E 호출 안 함 |
| 3 | 민팅 흐름이 한 번은 성공한다 | **OK** — BSC Testnet에 실제 배포 + 실제 트랜잭션 |
| 4 | 거래 이벤트 재생 시 trait가 바뀐다 | **부분** — state machine은 동작하나 state 영속 안 됨 |
| 5 | mutation diary가 보인다 | **부분** — 인메모리라 새로고침 시 유실 |
| 6 | 공유 카드가 생성된다 | **부분** — 항상 placeholder 이미지 사용 |
| 7 | 외부 API 죽어도 Replay Mode 돈다 | **OK** — 하드코딩 preset으로 독립 동작 |
