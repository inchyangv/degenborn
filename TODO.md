# TODO.md — DegenBorn 기술 개선 작업 보드

> 기준일: **2026-04-11** / 제출 마감: **2026-04-22 (D-11)** / Role: Tech Lead Review  
> PROJECT.md §17 MVP, TICKET.md §6 "최종 기준 7항목", HACKATHON.md §13 체크리스트 기준으로 레포 현상태를 훑은 뒤 정리한 기술 부채 목록이다.  
> 우선순위는 "이거 없으면 데모가 무너진다 / 제출 전에 못 피한다 / 있으면 강해진다" 기준이다.

---

## 요약

현재 M0~M4 티켓(T-001 ~ T-022)은 **코드 골격상으로는 다 통과**해 있다. 문제는 "흐름이 끝까지 연결되어 있는가"다. 데이터 파이프라인은 껍데기는 있으나 실제 API와 정합이 깨진 곳이 많고, 민팅은 **완전 시뮬레이션**이고, 이미지 오버레이 엔진은 **에셋이 0개**라 체인이 침묵 실패한다. 심사 기준 중 *Technical Implementation* 축이 가장 약하다.

**Blocker는 7개**: (1) mint 라우트가 런타임에 throw, (2) tokenURI 엔드포인트 부재, (3) trait 에셋 전무, (4) wagmi 온체인 호출 미구현, (5) WalletConnect 기본값 "demo", (6) diary in-memory only, (7) data-adapter 빌드 실패.  
**P1는 14개**, **P2는 8개**.

---

## P0 — Blocker (지금 못 고치면 데모/제출 자체가 위험)

### P0-01. `/api/mint` 가 런타임에 throw — keccak256 미지원
- **위치**: `apps/web/src/app/api/mint/route.ts:20,44`
- **문제**: Node.js `crypto`는 `keccak256` 다이제스트 이름을 **지원하지 않는다**. 호출 즉시 `Error: Digest method not supported` 로 떨어져 500 반환. try/catch에 삼켜져 있어 "왜 안 되지" 디버깅이 오래 간다.
- **해결**: `ethers.utils.id` 또는 `viem`의 `keccak256(toBytes(...))` 사용. 또는 `js-sha3`의 `keccak256` 패키지로 교체.
- **AC**: `/api/mint` POST가 200을 반환하고, 반환된 `dna_hash`가 `ethers.keccak256`과 동일.

### P0-02. tokenURI 목적지 `/api/metadata/[wallet]` 가 빈 디렉토리
- **위치**: `apps/web/src/app/api/metadata/` (핸들러 없음), 참조: `apps/web/src/app/api/mint/route.ts:43`
- **문제**: `metadata_uri`가 `/api/metadata/${wallet}` 을 가리키는데, 해당 route.ts가 **존재하지 않는다**. 컨트랙트 민팅이 붙는 순간 tokenURI는 404. OpenSea/BSCScan에서 메타데이터 조회 불가.
- **해결**: `apps/web/src/app/api/metadata/[wallet]/route.ts` 생성 → `diary-store` 또는 별도 저장소에서 최신 state를 꺼내 OpenSea-호환 JSON 반환. 데모 수준이면 in-memory cache로도 충분.
- **AC**: `curl /api/metadata/0x...`이 `{name, description, image, attributes[]}` JSON을 반환. OpenSea metadata validator 통과.

### P0-03. `public/traits/` 디렉토리가 완전히 비어 있음
- **위치**: `apps/web/public/traits/` (파일 0개), 참조: `apps/web/src/lib/overlay-renderer.ts:67`
- **문제**: 상태 머신이 왕관/상처/좀비눈 trait을 활성화해도 **오버레이가 실패하고 경고만 찍고 조용히 사라진다**. Monster Room 진화 데모가 비주얼로 드러나지 않는다. 이건 TICKET.md §6 최종 기준 #4 "거래 이벤트 재생 시 trait가 바뀐다"를 직격한다.
- **해결**:
  - (빠른 루트) 최소 6종 trait에 대해 SVG placeholder 제작: crown, scar, zombie_eye, bandage, gold_tooth, revenge_aura
  - `overlay-renderer.ts` 가 missing asset 시 콘솔 경고 대신 **대체 아이콘**을 합성하도록 보강
  - archetype placeholder와 동일한 경로 규약 사용 (`/traits/{name}.svg`)
- **AC**: Monster Room에서 상태 전환 시 최소 3종 trait이 실제로 합성되어 보인다.

### P0-04. 민팅이 완전 시뮬레이션 — 온체인 호출 없음
- **위치**: `apps/web/src/components/MintButton.tsx:52` (`simulateMint`는 `setTimeout(1500)`)
- **문제**: SoulCore 컨트랙트는 있고, 테스트도 있고, 배포 스크립트도 있는데, **프론트가 `useWriteContract`를 전혀 안 쓴다**. TICKET.md §6 최종 기준 #3 "민팅 흐름이 한 번은 성공한다"가 false.
- **해결**:
  - BSC testnet에 SoulCore 배포 → 주소 받아와서 `.env.local` 에 `NEXT_PUBLIC_SOUL_CORE_ADDRESS` 세팅
  - `packages/contracts`의 typechain ABI를 web app으로 re-export (`packages/contracts/src/abi/SoulCore.json`)
  - `MintButton`에서 `wagmi`의 `useWriteContract`로 `mint(to, archetype, dnaHash, stateHash, tokenURI_)` 호출
  - 트랜잭션 대기 → `useWaitForTransactionReceipt` → 성공 시 Monster Room으로 라우팅
  - 실패/사용자 취소 케이스: T-021에서 잡은 스낵바/모달 재사용
- **AC**: testnet 기준으로 샘플 지갑에서 실제 tx hash가 찍히고 BSCScan에서 조회된다. Demo 라벨은 유지하되, "fallback simulation" 모드로 밀어낸다.

### P0-05. WalletConnect projectId 기본값 `"demo"`
- **위치**: `apps/web/src/app/providers.tsx:13`
- **문제**: `NEXT_PUBLIC_WC_PROJECT_ID ?? "demo"`. 모바일 지갑(Trust/MetaMask mobile) 연결이 WalletConnect relay 레이트리밋에 맞아 **발표 중 랜덤 실패**. 해커톤 현장에서 지갑 붙이는 순간이 가장 위험하다.
- **해결**: WalletConnect Cloud에서 프로젝트 생성(무료) → `.env.example`에 키 추가 → README에 발급 방법 한 줄.
- **AC**: 모바일 지갑 1개로 실제 연결 성공. `.env.example`에 `NEXT_PUBLIC_WC_PROJECT_ID` 기재.

### P0-06. diary-store가 in-memory only — 서버리스 콜드스타트에 증발
- **위치**: `apps/web/src/lib/diary-store.ts:13` (`const store = new Map()`)
- **문제**: Vercel/Cloudflare 배포 시 각 요청마다 다른 lambda에 떨어져 diary가 **지갑당 0~N개로 들쭉날쭉**. 로컬 데모는 돌지만 배포 데모는 깨진다. TICKET.md §6 최종 기준 #5 "mutation diary가 보인다" 침해 위험.
- **해결** (셋 중 하나):
  - (최소) Vercel KV / Upstash Redis 붙이기 (free tier)
  - (차선) SQLite + `better-sqlite3` + `/tmp` 파일 (로컬만 된다)
  - (최악의 경우) 로컬 데모만 지원, 배포 URL에는 Replay Mode만 노출한다고 README 명시
- **AC**: 배포 URL에서 특정 지갑의 diary가 **새 요청에도 유지**된다. 또는 명시적으로 "배포는 replay 전용" 배너 표시.

### P0-07. `packages/data-adapter` 빌드 실패 (node types 누락)
- **위치**: `packages/data-adapter/src/adapter.ts:109-131` (`fs/promises`, `fetch`, `AbortController`, `setTimeout`)
- **문제**: 탐색 결과 `pnpm --filter @degenborn/data-adapter build`가 `Cannot find module 'fs/promises'` 등으로 실패. 모노레포 전체 `pnpm build`가 막힐 수 있다. T-001 AC #1 ("`pnpm install && pnpm build` 통과") 위반.
- **해결**: `packages/data-adapter/tsconfig.json`에 `"lib": ["ES2022", "DOM"]`, `"types": ["node"]`, `"skipLibCheck": true`. `@types/node`가 devDep에 있는지 확인.
- **AC**: 루트에서 `pnpm build` 한 번에 전 패키지 빌드 통과.

---

## P1 — Must-fix pre-submit (제출 전에는 닫아야 심사 방어가 된다)

### P1-01. Moralis URL이 틀렸음 — `/defi/summary` 는 요약이지 tx 목록이 아니다
- **위치**: `packages/data-adapter/src/adapter.ts:57`
- **문제**: 이 엔드포인트는 DeFi position summary만 돌려준다. 스코어링에 쓸 buy/sell 개별 이벤트가 안 온다. 실제 지갑 분석이 "숫자가 다 0" 나올 것.
- **해결**: `/{address}/erc20/transfers?chain=bsc&from_date=...` + `/{address}/swaps` 조합으로 교체. 또는 `/{address}/history`. Four.meme router 주소로 `to/from` 필터.
- **AC**: 샘플 지갑 1개에서 최근 30일 이벤트 ≥10개가 돌아온다.

### P1-02. Covalent normalizer 모든 swap을 `"buy"`로 분류
- **위치**: `packages/data-adapter/src/normalizer.ts:97-101`
- **문제**: buy/sell 구분 로직이 없고 heuristic 주석만 있다. Aggression/Luck 계산이 한 방향으로 편향된다.
- **해결**: swap 로그에서 `token0`/`token1` 중 어떤 쪽이 wallet으로 들어왔는지 log 파싱 → buy/sell 판정. 최소 Four.meme 라우터 컨벤션에 맞춰 2케이스만.
- **AC**: fixtures의 `ice_whale`/`mad_gambler` 데이터가 Covalent 경로로도 buy와 sell이 모두 나온다는 단위 테스트.

### P1-03. `FOUR_MEME_ROUTER` 상수 선언 후 미사용
- **위치**: `packages/data-adapter/src/adapter.ts:12`
- **문제**: Four.meme 활동만 분리하지 않으면 PancakeSwap/일반 BSC 거래까지 스코어링에 섞여 들어간다. 해커톤 심사 "Four.meme 기반"이라는 포지셔닝이 약해진다.
- **해결**: `normalizeMoralis`/`normalizeCovalent`에서 `tx.to_address === FOUR_MEME_ROUTER` (case-insensitive) 로 필터링. 또는 "Four.meme interaction" flag를 이벤트에 추가해서 스코어링에서 가중.
- **AC**: 실 지갑에 대해 "Four.meme only" 모드와 "all BSC" 모드 숫자가 다르게 나온다.

### P1-04. Normalizer가 `recovery` / `hold` 이벤트를 절대 생성하지 않음
- **위치**: `packages/shared/src/types/activity.ts` (타입 정의), `packages/data-adapter/src/normalizer.ts` (미생성)
- **문제**: `scoreSurvival`이 `e.event_type === "recovery"` 카운트로 점수 40%를 준다(`packages/scoring/src/engine.ts:174`). 실 데이터로는 절대 안 찍히니, fixture 제외 모든 지갑이 survival ≒ 0. 이는 Rug Necromancer / Diamond Cultist archetype이 실 지갑에서 **영원히 안 뽑히는** 걸 의미한다.
- **해결**:
  - normalizer에 "손실 후 같은 토큰 재진입" → `recovery` 이벤트 합성 규칙
  - 또는 scoring 쪽에서 comeback 로직(이미 존재, line 180-188)만 쓰고 `recoveryEvents` 가중치를 0으로 내림
  - 둘 중 하나로 결정하고 문서화
- **AC**: 실 지갑 시뮬에서 survival > 20 가 실제로 뽑히는 케이스가 존재.

### P1-05. Fixtures가 6 archetype 중 3개만 있음
- **위치**: `fixtures/wallets/` (`0xmad_gambler.json`, `0xice_whale.json`, `0xrug_necromancer.json`)
- **문제**: PROJECT.md §10은 6 archetype 정의. Replay 데모는 최소 3개 시연만 요구(T-004 AC)이지만, T-023 Gallery/Compare 뷰는 "archetype 3개 이상 나란히 비교"가 AC. 커뮤니티 투표(심사 30%) 대응에 약하다.
- **해결**: `diamond_cultist`, `sniper_jester`, `ghost_bagholder` 픽스처 3개 추가. 이벤트 시퀀스는 PROJECT.md §10 룰을 역산해서 합성.
- **AC**: Gallery 페이지에서 6 archetype 모두 CharacterDisplay로 렌더.

### P1-06. `/api/share`가 JSON을 반환 — 실제 PNG가 아님
- **위치**: `apps/web/src/app/api/share/route.ts:24-43`
- **문제**: 이름은 share card인데 Open Graph 이미지가 없다. 트위터/텔레그램 프리뷰에 썸네일이 안 뜨면 "shareable"이 아니다. 심사 기준 Practical Value (20%) 방어가 약해진다.
- **해결**: `@vercel/og` (ImageResponse) 또는 `satori`로 PNG 생성. archetype color + 캐릭터 이미지 + 캡션 + DNA 5축 미니바.
- **AC**: `/api/share?wallet=0x...`이 `Content-Type: image/png`로 응답. `/m/[wallet]` 페이지 OG 메타에서 이 URL 사용.

### P1-07. 이미지 파이프라인 seed가 선언만 되고 전달 안 됨
- **위치**: `apps/web/src/lib/image-pipeline.ts:82` (`_seed` 언더스코어 prefix)
- **문제**: PROJECT.md §5 원칙 1 "판정은 규칙, 표현은 AI"를 지키려면 동일 DNA → 동일 Genesis 이미지여야 하는데 DALL-E는 seed를 무시한다. 재생성할 때마다 캐릭터가 바뀌면 "Soul Core는 최신 정체성"이라는 서사가 깨진다.
- **해결**:
  - (최소) Genesis 이미지 1회 생성 후 asset URL을 diary/DB에 고정 저장 → 재요청 시 동일 URL 반환
  - (차선) fal.ai/replicate의 Flux 모델로 교체 (seed 파라미터 지원)
- **AC**: 같은 wallet을 두 번 analyze해도 동일한 image URL이 나온다.

### P1-08. `wallet_profile` 데이터 모델이 코드에 존재하지 않음
- **위치**: PROJECT.md §16 정의, 코드 상 부재 (`packages/shared/src/types/`에 interface 없음)
- **문제**: 스펙 문서에는 있지만 타입도 테이블도 엔드포인트도 없다. 심사에서 "where's the data model?" 질문에 답이 약하다.
- **해결**: `packages/shared/src/types/walletProfile.ts` 생성 + diary-store 옆에 profile-store 추가. P0-06와 함께 영속화.
- **AC**: `/api/analyze` 결과가 profile-store에 persist되어 같은 지갑 재요청 시 캐시 히트.

### P1-09. `apps/web/src/app/api/*` 에 지갑 주소 검증 없음
- **위치**: `analyze/route.ts`, `mint/route.ts`, `m/[wallet]/page.tsx`
- **문제**: `wallet` 파라미터를 그대로 DB key, 로그, URL에 꽂는다. 잘못된 주소로 스팸 요청 시 store가 오염. 또 로그에 PII-ish 값이 섞여 들어간다.
- **해결**: `viem`의 `isAddress(wallet)` + lowercase 정규화. 실패 시 400.
- **AC**: `curl -X POST /api/analyze -d '{"wallet":"notanaddress"}'` 가 400.

### P1-10. SoulCore tokenURI가 owner 임의 교체 가능 — metadata swap 리스크
- **위치**: `packages/contracts/contracts/SoulCore.sol:98-107` (`updateState`)
- **문제**: admin 키가 털리면 모든 Soul Core의 image/description이 교체될 수 있다. 해커톤 심사에서 "soulbound인데 표현은 mutable"은 바로 지적거리.
- **해결**:
  - 최소: state update에 `archetype` 변경은 못 하도록 guard
  - 권장: `updateState`에 `newStateHash`가 기존 state와 연결된다는 증거(previous hash 포함) 요구
  - 더 권장: 유저 서명 기반 update(EIP-712) — 시간 부족하면 생략 OK
- **AC**: 컨트랙트 테스트에서 owner가 archetype 필드를 바꾸려는 시도가 revert.

### P1-11. SnapshotRelic 마일스톤 중복 방지가 컨트랙트에 없음
- **위치**: `packages/contracts/contracts/SnapshotRelic.sol` (중복 dedup 주석만 존재, "enforced by backend")
- **문제**: 동일 wallet이 동일 milestone을 여러 번 받을 수 있다. backend off 되면 무방비. T-018 AC "milestone별로 별도 민팅"은 해석에 따라 "한 번만"인지 "여러 번 OK"인지 모호.
- **해결**: `mapping(address => mapping(MilestoneType => bool)) _claimed` 추가, mint에서 require.
- **AC**: 동일 wallet의 동일 milestone 재민팅 테스트가 revert.

### P1-12. 배포 스크립트가 contract address를 콘솔 로그로만 출력
- **위치**: `packages/contracts/scripts/deploy.ts`, `deploy-relic.ts`
- **문제**: 배포 후 수동으로 `.env`에 복붙. 해커톤 세팅에서 반복되면 실수로 다른 네트워크 주소 섞임.
- **해결**: 배포 스크립트가 `deployments/<network>.json` 에 `{SoulCore, SnapshotRelic, blockNumber, txHash}` 기록. 프론트는 이 파일을 Next.js `env()` / build-time으로 주입.
- **AC**: `pnpm --filter @degenborn/contracts deploy:testnet` 한 번으로 프론트에서도 주소 인식.

### P1-13. 데이터 파이프라인(adapter/normalizer/event-store) 단위 테스트 0개
- **위치**: `packages/data-adapter/` (테스트 디렉토리 없음)
- **문제**: 테스트 커버리지가 scoring/archetype/state-machine에만 있다. 파이프라인 앞단이 가장 바뀔 곳인데 방어가 없다. 심사 "Technical Implementation" (30%) 점수 까임.
- **해결**: fixture 1개에 대해 normalizer가 buy N개, sell M개, recovery K개를 뽑는지 스냅샷 테스트. event-store idempotency 1건. adapter `source: "fixture"` 경로 1건.
- **AC**: `pnpm -r test`가 data-adapter 테스트를 최소 5개 통과.

### P1-14. Luck score가 sells 없을 때 `return 30` 이라는 임의 기본값
- **위치**: `packages/scoring/src/engine.ts:145`
- **문제**: 신규/휴면 지갑이 운빨 보너스 30을 그냥 받음. 결정론 엔진에서 "이유 설명 가능"이 깨진다. T-006 AC "극단값 처리"에 대한 설명 책임도 같이 약해짐.
- **해결**: 0으로 내리거나, `event_count`에 따라 감쇠.
- **AC**: `event_count === 0`인 DNA의 luck = 0. 회귀 테스트.

---

## P2 — Nice to have (시간 있으면 시도)

### P2-01. Classifier tie-breaker가 RULES 배열 순서에 암묵적으로 의존
- **위치**: `packages/archetype/src/classifier.ts:27` (주석은 있으나 코드상 명시 없음)
- **개선**: tie-breaker 우선순위 상수로 분리 + 테스트에서 tie 케이스 1개 이상 강제.

### P2-02. Classifier fallback confidence 0.3이 DNA(0,0,0,0,0) 같은 극단값에 오판을 유도
- **위치**: `packages/archetype/src/classifier.ts:107-117`
- **개선**: `event_count`가 적으면 archetype 대신 "Unhatched Egg" 같은 sentinel 반환. UI는 "데이터 부족" 메시지.

### P2-03. Unibase adapter는 placeholder URL
- **위치**: `apps/web/src/lib/unibase-adapter.ts:54`
- **개선**: 실제 Unibase endpoint로 교체. 불가능하면 README에 "P1, off by default" 명시. 심사 bonus (Unibase 파트너 정합성).

### P2-04. Narrative 템플릿이 archetype별로 별로 안 다름
- **위치**: `apps/web/src/lib/narrative.ts:96-142`
- **개선**: archetype별 고유 tone seed + 3~5종 한 줄 템플릿. Diary가 비슷한 문장 반복하는 걸 줄인다.

### P2-05. PostHog analytics에 README 언급 부재
- **위치**: `.env.example:` (키 없음), `apps/web/src/lib/analytics.ts`
- **개선**: `.env.example`에 `NEXT_PUBLIC_POSTHOG_KEY=` 추가, README 한 줄.

### P2-06. RPC 어댑터 미구현 — fallback 루트 없음
- **위치**: `packages/data-adapter/src/adapter.ts:40` (`throw new Error("RPC adapter not implemented")`)
- **개선**: moralis/covalent 둘 다 죽었을 때 viem `getLogs`로 Four.meme router 이벤트 직접 조회. 시연 안정성용 2차 보험.

### P2-07. Major evolution 규칙이 상태머신 테스트에 부분만 커버
- **위치**: `apps/web/src/__tests__/major-evolution.test.ts`
- **개선**: PROJECT.md §12 "대형 진화 4조건"이 모두 단위 테스트에 있는지 체크. 한 개라도 빠지면 추가.

### P2-08. Genesis 이미지 캐시 누락
- **위치**: `apps/web/src/lib/image-pipeline.ts`
- **개선**: DALL-E 호출 결과를 `public/genesis/{walletLower}.png`로 저장하고 재요청 시 재사용. 비용/속도 동시에 잡힌다.

---

## 데모 시나리오 역산 — TICKET.md §6 "최종 7질문" 현재 상태

| # | 질문 | 현재 상태 | 블로커 |
|---|---|---|---|
| 1 | 지갑 연결 후 archetype 30초 내 | 🟡 | P0-05 (WC "demo"), P1-01 (Moralis URL) |
| 2 | 캐릭터 생성/placeholder | 🟢 | — (archetype placeholder 6종 있음) |
| 3 | 민팅 1회 성공 | 🔴 | P0-01, P0-04 |
| 4 | 이벤트 재생 시 trait 변화 | 🔴 | P0-03 |
| 5 | mutation diary 표시 | 🟡 | P0-06 (로컬 OK, 배포 불확실) |
| 6 | 공유 카드 생성 | 🟡 | P1-06 (PNG 아님) |
| 7 | API 죽어도 Replay 작동 | 🟢 | — (fixture 로딩 경로 살아있음) |

**🔴 2개, 🟡 3개, 🟢 2개.** 🔴 먼저 닫는다 → P0-01 → P0-02 → P0-03 → P0-04 순.

---

## 권장 작업 순서 (D-11, 1인 기준)

### D-10 ~ D-9 (2026-04-12 ~ 04-13) — Blocker 전부 닫기
1. P0-07 (빌드 복구, 10분)
2. P0-01 (keccak256, 30분)
3. P0-02 (metadata route, 1h)
4. P0-05 (WC projectId, 15분)
5. P0-03 (trait SVG 6종 + fallback, 3h)
6. P0-04 (실제 mint, 3h) ← testnet 배포 포함
7. P0-06 (diary 영속화 or 배포 replay-only 결정, 1~3h)

### D-8 ~ D-6 (2026-04-14 ~ 04-16) — P1 핵심
8. P1-01 + P1-02 + P1-03 (데이터 파이프라인 정합, 4h)
9. P1-04 (recovery 생성, 1h)
10. P1-05 (fixture 3종 추가, 2h)
11. P1-06 (share PNG, 2h)
12. P1-09 (address 검증, 30분)
13. P1-07 (Genesis 캐시, 1h)

### D-5 ~ D-3 (2026-04-17 ~ 04-19) — 보안/제출 대비
14. P1-10 + P1-11 (컨트랙트 guard, 2h)
15. P1-12 (배포 스크립트 개선, 1h)
16. P1-13 (data-adapter 테스트, 2h)
17. P1-14 (luck 기본값, 15분)
18. P1-08 (wallet_profile 타입, 30분)

### D-2 ~ D-1 (2026-04-20 ~ 04-21) — 폴리싱 + 영상
19. 선택 P2 항목 2~3개
20. 데모 영상 촬영 (T-022 AC)
21. README 최종, 제출

---

## 섹션 밖: 짚어둘 설계 리스크

- **라이브 모드 vs Replay 모드의 경계가 코드 안에서 느슨하다.** `useFixture: true`가 하드코딩된 곳(`apps/web/src/app/birth/page.tsx:117`, `monster/page.tsx:63`)이 있어서 "진짜 live"와 "fixture"가 프론트 플래그로만 갈린다. 발표 직전에 플래그 스위치 1군데만 바꿔서 live ↔ replay가 뒤집혀야 하는데, 지금은 여러 파일을 만져야 한다. **1개 config 소스로 모으는 작업**을 P1-08 근처에 묶어둬도 좋다.
- **Soul Core 업데이트 권한이 완전 중앙화(onlyOwner).** 해커톤 발표 맥락에선 "backend가 mint/update 대행"이 자연스럽지만, Q&A에서 "그럼 진짜 소울바운드 맞나"라는 질문 방어 멘트를 미리 만들어두자. (답: "지갑 이동 방지는 컨트랙트 레벨, 표현 갱신은 backend-attested — P1은 signature-based update로 분리" 정도)
- **IPFS 부재.** 현재 metadata는 전부 hosted URL. 제출 시 "영속성"에 대한 질문이 나올 수 있다. 시간이 없으면 README에 "post-hackathon: Pinata 마이그레이션 계획"이라고 후속 로드맵(T-024)에 넣는 걸로 방어.
- **심사 축 대비**:
  - *Innovation*: 🟢 (지갑 → 살아있는 정체성이라는 메시지가 레포 전체에서 일관)
  - *Technical Implementation*: 🟡 (데이터 파이프라인이 가장 약함 → P1-01~04가 이걸 직접 올림)
  - *Practical Value*: 🟡 (share card가 JSON인 점이 치명 → P1-06)
  - *Presentation*: 🟢 (Replay + Gallery + Monster Room 흐름 존재)

---

## 완료 선언 조건

이 TODO가 "닫혔다"고 말하려면 아래 3개가 모두 참이어야 한다:

1. TICKET.md §6 7질문이 모두 🟢 (위 표 참고)
2. `pnpm -r build && pnpm -r test` 루트에서 통과
3. testnet에서 1회 이상 실제 SoulCore 민팅 성공한 tx hash가 README에 기록

P0 7개만 닫혀도 **"제출은 가능"** 상태다. P1까지 닫히면 **"심사 방어 가능"** 상태.
