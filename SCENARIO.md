# SCENARIO.md — DegenBorn User Scenarios

이 문서는 DegenBorn를 사용하는 **유저 입장**에서 일어날 수 있는 모든 시나리오를 상세하게 정리한 것이다.
PROJECT.md는 "무엇을 만드는가", TICKET.md는 "어떻게 쪼갤 것인가"라면,
SCENARIO.md는 "유저가 실제로 어떤 흐름을 겪는가"에 대한 문서다.

구현 판단이 애매할 때는 이 문서에 적힌 유저 동선을 기준선으로 삼는다.

---

## 0. 등장 인물 (Personas)

### P1. 디젠 트레이더 (주인공)
- Four.meme에서 활발하게 거래 중 (지난 30일 기준 50+ txs)
- 지갑 1개에 자기 서사가 붙길 원함
- 손익표보다 캐릭터가 더 재미있음
- 트위터/텔레그램에 자랑할 거리를 찾음
- 기본 환경: 데스크톱 Chrome + MetaMask, 간혹 모바일 Rabby

### P2. 복귀자
- 과거 3개월 안에 큰 손실(-80% 이상) 기록 있음
- 2주~2개월 공백기 후 복귀
- "나 망했었지만 돌아왔다"는 서사를 원함
- Survival/Chaos 점수가 높을 가능성

### P3. 관전자
- 직접 트레이딩은 잘 안 함
- 다른 사람 지갑을 구경하는 게 취미
- Gallery/Compare 뷰에서 시간을 보냄
- 지갑은 있지만 Four.meme 활동이 적음

### P4. 커뮤니티 러너 / KOL
- Four.meme 커뮤니티 매니저 또는 인플루언서
- 활발한 유저를 발굴하고 띄우고 싶음
- 투표/이벤트용 공유 카드가 필요
- 여러 지갑을 연속으로 조회할 가능성 있음

### P5. 해커톤 심사위원 / 첫 구경꾼
- 2분 안에 "이게 뭔지" 이해되어야 함
- 자기 지갑이 없거나 Four.meme 활동 없음
- 라이브 데이터가 흔들리면 안 됨
- Replay Mode의 타겟 관객

### P6. 신규 지갑 유저
- Four.meme 활동이 0~2건
- 방금 만든 지갑이거나, 다른 체인에서만 활동
- "왜 내 캐릭터가 안 나오는가"를 이해해야 함

---

## 1. 코어 동선 한눈에

```
(1) 랜딩 접속
  → (2) 지갑 연결
    → (3) Awakening — 데이터 fetch
      → (3.5) Awakening — DNA 계산 + 점수 공개
        → (4) Archetype Reveal
          → (5) Genesis — 이미지 생성
            → (6) Soul Core 민팅
              → (7) Monster Room 진입
                → (8) Live Evolution — 이벤트별 trait 변화
                  → (9) Mutation Diary 누적
                    → (10) Share Card 생성
                      → (11) 재방문 — 업데이트 감지 → (8)로 루프
```

아래는 이 흐름의 **모든 분기**를 상세하게 서술한다.

---

## 2. 신규 유저 온보딩 시나리오

---

### S-01. 최초 방문 — 지갑 미연결 상태

**Actor:** P1 (디젠), P3 (관전자), P5 (심사위원)
**Precondition:** 처음 접속, 지갑 미연결
**Entry Point:** `/` (랜딩 페이지)

#### 화면 구성
```
┌──────────────────────────────────────┐
│  DegenBorn                   [Connect Wallet]  │
├──────────────────────────────────────┤
│                                              │
│          Your wallet has a soul.             │
│    Every trade leaves a mark. Every rug      │
│    leaves a scar. Meet your monster.         │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Mad Gambler│  │Ice Whale │  │Rug Necro │   │
│  │  (sample) │  │ (sample) │  │ (sample) │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                              │
│     [Connect Wallet]   [Try Replay Demo]     │
│                                              │
│  "Built on BNB Chain × Four.meme"            │
└──────────────────────────────────────┘
```

#### Flow — 상세
1. 유저가 URL 입력 또는 링크 클릭으로 진입
2. 첫 paint: 배경 + 히어로 카피 (300ms 내)
3. 샘플 아키타입 카드 3장이 fade-in (각 0.5초 간격 stagger)
   - 각 카드: 썸네일(사전 생성 static asset) + 아키타입 이름 + 한 줄 설명
   - **Mad Gambler** — "모든 걸 태우고, 또 태운다"
   - **Ice Whale** — "고요하게 잠수하지만, 올라올 때는 파도가 된다"
   - **Rug Necromancer** — "죽어도 죽지 않는다. 다시 일어선다."
4. 두 CTA 버튼 동시 노출
   - Primary: "Connect Wallet" (큰 버튼)
   - Secondary: "Try Replay Demo" (텍스트 링크 또는 아웃라인 버튼)
5. 스크롤 하면 추가 섹션:
   - "How it works" (3단계 다이어그램: Connect → Awaken → Evolve)
   - "What you'll get" (Soul Core 미리보기)

#### 타이밍 기대
- FCP(First Contentful Paint): < 1초
- 전체 로딩 완료: < 3초
- 유저가 "이게 뭔 서비스인지" 파악하는 데: < 5초

#### Failure Modes
- **F-01a**: 히어로 이미지/폰트 로딩 느림 → 스켈레톤 placeholder 필수 (그레이 박스 + 펄스 애니메이션)
- **F-01b**: 샘플 아키타입 에셋 로딩 실패 → 에셋은 번들에 포함 (CDN 의존 X), CSS gradient 실루엣 fallback
- **F-01c**: JS 번들 로딩 실패 → "Connect Wallet" 버튼이라도 보이게 SSR 또는 static HTML fallback

---

### S-02. 지갑 연결

**Actor:** P1
**Precondition:** MetaMask / Rabby / OKX Wallet / WalletConnect 중 하나 설치됨
**Entry Point:** "Connect Wallet" 버튼 클릭

#### Flow — 상세

**Step 1: 모달 오픈 (0~1초)**
1. 유저가 "Connect Wallet" 클릭
2. wagmi/RainbowKit 연결 모달이 오버레이로 뜸
3. 지원 지갑 목록 표시:
   - MetaMask (아이콘)
   - Rabby (아이콘)
   - OKX Wallet (아이콘)
   - WalletConnect (QR 포함)
4. 모달 밖 클릭 또는 X 버튼으로 닫기 가능

**Step 2: 지갑 선택 (유저 동작)**
5. 유저가 MetaMask 선택
6. MetaMask 팝업 열림 → "이 사이트에 연결하시겠습니까?"
7. **서명 요청 없음** (읽기 전용 — 이 시점에선 트랜잭션 없음)
8. 유저가 "연결" 승인

**Step 3: 네트워크 확인 (0.5초)**
9. 현재 연결된 네트워크 확인
10. BNB Chain mainnet (chainId: 56) 또는 BNB testnet (chainId: 97) → 통과
11. 다른 네트워크 → S-02-branch-a (네트워크 스위치)

**Step 4: 연결 완료 (즉시)**
12. 헤더 우상단에 주소 표시: `0xAB...CD` (앞 4자리 + 뒤 4자리)
13. 네트워크 아이콘 (BNB 로고) 표시
14. "Connect Wallet" 버튼 → "Connected" 상태 변경 (체크 아이콘)
15. **자동 네비게이션**: 0.8초 후 `/birth` 페이지로 redirect (S-03 시작)

#### Branch S-02-a: 잘못된 네트워크
1. 유저가 Ethereum mainnet 등으로 연결됨
2. 모달 대신 **인라인 배너** 등장: "Please switch to BNB Chain"
3. "Switch Network" 버튼 제공
4. 클릭 시 `wallet_switchEthereumChain` 호출
5. 성공 → Step 4로
6. 유저가 거부 → 배너 유지, Birth 접근 차단, "Connect Wallet" 비활성 + 이유 표시

#### Branch S-02-b: 지갑 팝업 취소
1. 유저가 MetaMask 팝업에서 "취소" 클릭
2. 모달 닫힘
3. 에러 토스트 없음 (의도적 취소이므로)
4. 랜딩 원래 상태로 복귀
5. "Connect Wallet" 버튼 다시 활성

#### Branch S-02-c: 지갑 미설치
1. 유저가 데스크톱에서 접속했지만 확장 프로그램 없음
2. WalletConnect QR 옵션은 계속 표시
3. 또는 "Install MetaMask" 링크 표시 (metamask.io 연결)

#### Branch S-02-d: 모바일 접속
1. 모바일 브라우저 → 지갑 앱 내 브라우저가 아님
2. "Open in wallet app" 딥링크 제공
3. 또는 WalletConnect QR 제공
4. 지갑 앱 내 브라우저에서 접속한 경우 → injected provider 자동 인식

#### 화면 전환
- 연결 성공 시 랜딩 → `/birth` 페이지로 소프트 transition (fade)
- URL 변경: `degenborn.xyz/birth?wallet=0xAB...CD`

---

### S-03. The Awakening — 데이터 수집 단계

**Actor:** P1
**Precondition:** 지갑 연결 완료 (S-02 Step 4)
**Entry Point:** `/birth` 페이지

#### 화면 구성 — 로딩 상태
```
┌──────────────────────────────────────┐
│  DegenBorn          0xAB...CD  [BNB] │
├──────────────────────────────────────┤
│                                              │
│           Reading your soul...               │
│                                              │
│   ┌──────────────────────────────┐           │
│   │  [1/4] Scanning transactions │ ██████░░  │
│   │  [2/4] Classifying events    │ ░░░░░░░░  │
│   │  [3/4] Calculating DNA       │ ░░░░░░░░  │
│   │  [4/4] Determining archetype │ ░░░░░░░░  │
│   └──────────────────────────────┘           │
│                                              │
│     "Every scar tells a story..."            │
│                                              │
└──────────────────────────────────────┘
```

#### Flow — 상세

**Phase 1: 트랜잭션 스캐닝 (3~15초)**
1. Birth 페이지 진입
2. "Reading your soul..." 히어로 텍스트 + 어두운 배경 + 미세한 파티클 애니메이션
3. 프로그레스 바 4단계 표시:
   - `[1/4] Scanning transactions` — 현재 활성 (pulsing)
   - `[2/4] Classifying events` — 대기 (dimmed)
   - `[3/4] Calculating DNA` — 대기
   - `[4/4] Determining archetype` — 대기
4. 백엔드 호출: `POST /api/analyze` body: `{ wallet: "0xAB..." }`
5. Data adapter가 3개 윈도우 순차 또는 병렬 fetch:
   - 최근 7일 (빠른 반환용)
   - 최근 30일
   - 최근 180일
6. 각 윈도우 완료 시 프로그레스 bar 갱신 (33% / 66% / 100%)
7. 로딩 중 하단에 랜덤 한 줄 flavor text가 4초마다 교체:
   - "Every scar tells a story..."
   - "Counting your rugs..."
   - "Measuring your conviction..."
   - "The chain remembers everything..."

**Phase 2: 이벤트 분류 (1~3초)**
8. raw 트랜잭션 → normalized events로 변환
9. 프로그레스: `[2/4] Classifying events` 활성
10. 이벤트 타입별 카운트가 실시간 표시:
    - Buys: 23
    - Sells: 18
    - Rugs detected: 3
    - Recoveries: 2
11. 각 숫자가 0에서 카운트업 애니메이션

**Phase 3: DNA 계산 (0.5~1초)**
12. 프로그레스: `[3/4] Calculating DNA` 활성
13. scoring engine 실행 → 5개 축 점수 계산
14. 아직 유저에게 점수를 보여주지 않음 (S-03.5에서 공개)

**Phase 4: 아키타입 결정 (즉시)**
15. 프로그레스: `[4/4] Determining archetype` 활성
16. archetype classifier 실행
17. 결과 저장 (메모리/DB)
18. 0.5초 인위적 지연 (극적 효과)
19. 프로그레스 바 100% → "Analysis complete" 텍스트로 교체

**Phase 5: 전환 (0.5초)**
20. "Analysis complete" 표시 후 0.5초 대기
21. 자동으로 DNA 공개 화면(S-03.5)으로 전환

#### 타이밍 기대
- 전체 Phase 1~5: 5~20초 (API 상태에 따라)
- 30초 초과 시 → timeout 처리 (F-03a)

#### Failure Modes
- **F-03a**: 데이터 소스 API 타임아웃 (30초 초과)
  1. "Taking longer than expected..." 문구로 변경
  2. 15초 추가 대기 + 재시도 1회
  3. 여전히 실패 → "We couldn't reach the blockchain right now."
  4. 두 가지 CTA: "Retry" / "Try Replay Demo instead"
  5. "Retry"는 마지막 실패 지점부터 재개 (이미 가져온 데이터는 캐시)

- **F-03b**: 0건 활동 → S-14로 분기 (별도 상세)

- **F-03c**: API rate limit (429 응답)
  1. 자동으로 exponential backoff (2초 → 4초 → 8초)
  2. 프로그레스 텍스트: "Still reading... your soul is complex"
  3. 최대 3회 재시도 후 실패 → F-03a와 동일 처리

- **F-03d**: 부분 성공 (7일은 됐지만 180일 실패)
  1. 가져온 데이터만으로 계산 진행
  2. "Based on recent activity (7 days)" 경고 배지
  3. DNA 정확도가 낮을 수 있다는 면책 문구

- **F-03e**: 유저가 로딩 중 페이지 이탈/새로고침
  1. 분석 결과는 서버에 캐시 (wallet address 키, 5분 TTL)
  2. 재진입 시 캐시 hit → 즉시 결과 표시 (Phase 5로 점프)
  3. 캐시 miss → 처음부터 다시

---

### S-03.5. DNA 점수 공개

**Actor:** P1
**Precondition:** S-03 Phase 4 완료
**Entry Point:** `/birth` 페이지 내 DNA reveal 화면

#### 화면 구성
```
┌──────────────────────────────────────┐
│                                              │
│         Your Persona DNA                     │
│                                              │
│   Aggression    ████████████████░░░░   82    │
│   Conviction    ██████░░░░░░░░░░░░░░   34    │
│   Chaos         ███████████████░░░░░   76    │
│   Luck          ████████░░░░░░░░░░░░   41    │
│   Survival      ██████████████████░░   91    │
│                                              │
│          [Reveal Your Archetype →]           │
│                                              │
└──────────────────────────────────────┘
```

#### Flow — 상세

1. 어두운 화면에서 "Your Persona DNA" 타이틀 fade-in
2. 5개 DNA 바가 하나씩 등장 (0.6초 간격 stagger):
   - 바 이름 표시 → 바가 0에서 목표값까지 fill 애니메이션 (0.8초 ease-out)
   - 바 끝에 숫자 카운트업 (0 → N)
   - 각 바 컬러:
     - Aggression: 빨간색 (#FF4444)
     - Conviction: 파란색 (#4488FF)
     - Chaos: 보라색 (#AA44FF)
     - Luck: 금색 (#FFD700)
     - Survival: 초록색 (#44FF88)
3. 5개 바 모두 완료 후 1.5초 정지 (유저가 점수를 읽는 시간)
4. "Reveal Your Archetype →" 버튼 fade-in
5. 유저 클릭 → S-04로 전환

#### 구체적 점수 예시 — 아키타입별

| 아키타입 | Aggression | Conviction | Chaos | Luck | Survival |
|---|---|---|---|---|---|
| Mad Gambler | 88 | 22 | 79 | 35 | 44 |
| Ice Whale | 31 | 85 | 18 | 72 | 78 |
| Rug Necromancer | 55 | 48 | 82 | 29 | 88 |
| Diamond Cultist | 38 | 91 | 45 | 25 | 76 |
| Sniper Jester | 92 | 15 | 38 | 84 | 52 |
| Ghost Bagholder | 42 | 78 | 71 | 31 | 22 |

---

### S-04. Archetype Reveal

**Actor:** P1
**Precondition:** DNA 계산 완료, "Reveal" 버튼 클릭
**Entry Point:** `/birth` 페이지 내 reveal 화면

#### Flow — 아키타입별 분기 (공통 구조)

**공통 연출 (2.5초)**
1. 화면 전체가 0.3초간 암전 (fade to black)
2. 중앙에 archetype 이름이 타이핑 효과로 한 글자씩 등장 (0.8초)
3. 이름 아래 한 줄 설명이 fade-in (0.5초)
4. 배경이 archetype 고유 컬러/무드로 전환 (0.5초 gradient transition)
5. 서브틀한 파티클/이펙트 (archetype별로 다름)

#### 아키타입별 디테일

**Mad Gambler**
- 배경: 불꽃/용암 gradient (#FF2200 → #FF6600)
- 파티클: 불씨가 위로 올라가는 이펙트
- 이름: "Mad Gambler"
- 한 줄: "You burn everything. And then you burn some more."
- 한국어: "모든 걸 태우고, 또 태운다."
- 톤: reckless, chaotic energy

**Ice Whale**
- 배경: 깊은 바다 gradient (#001144 → #004488)
- 파티클: 천천히 떨어지는 빙결 이펙트
- 이름: "Ice Whale"
- 한 줄: "Silent in the deep. Devastating on the surface."
- 한국어: "고요하게 잠수하지만, 올라올 때는 파도가 된다."
- 톤: calm, immense, patient

**Rug Necromancer**
- 배경: 어둡고 독한 초록 (#002200 → #006600)
- 파티클: 독안개가 바닥에서 올라옴
- 이름: "Rug Necromancer"
- 한 줄: "You died. Again. And again. You always come back."
- 한국어: "죽어도 죽지 않는다. 다시 일어선다."
- 톤: ominous, undead resilience

**Diamond Cultist**
- 배경: 다이아몬드 빛 (#AACCFF → #FFFFFF)
- 파티클: 반짝이는 크리스탈 가루
- 이름: "Diamond Cultist"
- 한 줄: "Holding while the world burns. Praying to the chart."
- 한국어: "세상이 불타도 놓지 않는다. 차트에 기도한다."
- 톤: obsessive devotion

**Sniper Jester**
- 배경: 네온 핑크/시안 (#FF00FF → #00FFFF)
- 파티클: 레이저 라인이 교차
- 이름: "Sniper Jester"
- 한 줄: "In and out before you blink. Laughing all the way."
- 한국어: "눈 깜짝할 사이에 들어가고, 웃으며 나온다."
- 톤: cocky, fast, chaotic joy

**Ghost Bagholder**
- 배경: 안개 (#444444 → #888888)
- 파티클: 서서히 사라지는 유령 실루엣
- 이름: "Ghost Bagholder"
- 한 줄: "Still holding. Still waiting. The bags never leave."
- 한국어: "아직 들고 있다. 아직 기다린다. 가방은 사라지지 않는다."
- 톤: melancholic, stubborn, fading hope

#### 공통 후속
6. 2초간 archetype 화면 유지
7. "Continue to Genesis →" 버튼 등장
8. 유저 클릭 → S-05로 전환

#### Failure Modes
- **F-04a**: DNA 동점 → tie-breaker 우선순위:
  1. Chaos + Survival 합산이 가장 높으면 Rug Necromancer
  2. Aggression 단독 최고이면 Mad Gambler
  3. Conviction 단독 최고이면 Diamond Cultist
  4. 그래도 결정 안 되면 → Chaos가 가장 높은 쪽
  5. 유저에게 tie-break 과정은 보이지 않음

---

### S-05. Genesis Birth — 이미지 생성

**Actor:** P1
**Precondition:** Archetype 결정됨
**Entry Point:** `/birth` 페이지 내 genesis 화면

#### 화면 구성 — 로딩
```
┌──────────────────────────────────────┐
│                                              │
│         Summoning your soul...               │
│                                              │
│   ┌───────────────────────────┐              │
│   │                           │              │
│   │   (로딩 애니메이션 영역)     │              │
│   │   어둠 속에서 실루엣이       │              │
│   │   서서히 형체를 잡는 연출    │              │
│   │                           │              │
│   └───────────────────────────┘              │
│                                              │
│      "The chain is remembering you..."       │
│                                              │
└──────────────────────────────────────┘
```

#### Flow — 상세

**Step 1: 이미지 생성 요청 (즉시)**
1. 프론트엔드 → `POST /api/genesis` body:
   ```json
   {
     "wallet": "0xAB...",
     "archetype": "rug_necromancer",
     "dna": { "aggression": 55, "conviction": 48, "chaos": 82, "luck": 29, "survival": 88 },
     "seed": "0xAB...CD-rug_necromancer-v1"
   }
   ```
2. seed = `walletAddress + archetype + version` 의 해시 → 동일 입력 = 동일 이미지

**Step 2: 로딩 연출 (3~15초)**
3. 로딩 화면:
   - 어두운 배경에 archetype 컬러의 실루엣이 서서히 형체를 잡는 CSS 애니메이션
   - 하단 flavor text 4초 간격 교체:
     - "The chain is remembering you..."
     - "Your scars are being etched..."
     - "Assembling your true form..."
4. 진행 시간 표시: 경과 시간 표시하지 않음 (불안 유발). 대신 "Almost there..." 같은 단계적 텍스트

**Step 3: 이미지 반환 (서버)**
5. 이미지 모델(Flux 등)이 base portrait 생성
6. 서버가 결과를 S3/IPFS에 업로드
7. 응답:
   ```json
   {
     "imageUrl": "https://assets.degenborn.xyz/genesis/0xAB...CD.png",
     "seed": "0xAB...CD-rug_necromancer-v1",
     "caption": "Born from 11 rugs and a revenge trade",
     "traitAnchors": { "head": [128, 32], "chest": [128, 160], ... }
   }
   ```

**Step 4: 캐릭터 등장 (1.5초)**
8. 실루엣이 풀 이미지로 교체 — 0.8초 fade-in
9. 캐릭터 아래 1줄 캡션 등장: "Born from 11 rugs and a revenge trade"
10. 좌우에 DNA 미니 뱃지 (점수 top 2만): `Chaos 82 | Survival 88`
11. 하단에 "Mint your Soul Core →" CTA

#### Failure Modes
- **F-05a**: 이미지 모델 실패 (API 에러, 500)
  1. 1회 자동 재시도 (3초 후)
  2. 여전히 실패 → archetype별 사전 생성 placeholder 이미지 사용
  3. 유저에게: "We used a default portrait. You can regenerate later."
  4. 민팅 플로우는 계속 진행 가능 (이미지 없이도 metadata는 만들 수 있음)

- **F-05b**: 이미지 모델 safety filter 트리거
  1. archetype-specific prompt 중 특정 키워드가 필터에 걸림
  2. neutral fallback prompt로 재시도: `"dark fantasy character portrait, [archetype] theme"`
  3. 2차도 실패 → placeholder (F-05a 경로)

- **F-05c**: 30초 초과
  1. "Taking a bit longer..." 텍스트
  2. 45초 시 "Skip and use placeholder" 버튼 노출
  3. 유저 skip → placeholder 이미지로 진행

- **F-05d**: 이미지 저장 실패 (S3/IPFS 에러)
  1. 로컬 blob으로 임시 저장
  2. 민팅 시 retry upload

---

### S-06. Soul Core 민팅

**Actor:** P1
**Precondition:** Genesis 이미지 완성됨 (또는 placeholder)
**Entry Point:** "Mint your Soul Core" 클릭

#### 화면 구성 — 민팅 대기
```
┌──────────────────────────────────────┐
│                                              │
│         Mint your Soul Core                  │
│                                              │
│   ┌─────────────┐  ┌──────────────────┐      │
│   │              │  │ Archetype: Rug   │      │
│   │  (캐릭터    │  │   Necromancer    │      │
│   │   이미지)    │  │                  │      │
│   │              │  │ Chaos: 82        │      │
│   │              │  │ Survival: 88     │      │
│   └─────────────┘  │                  │      │
│                     │ ⚠ Non-transferable │    │
│                     │ Bound to 0xAB..CD │     │
│                     └──────────────────┘      │
│                                              │
│   Est. gas: ~0.002 BNB                       │
│                                              │
│         [Mint Soul Core]                     │
│   "Skip for now" (텍스트 링크)                │
│                                              │
└──────────────────────────────────────┘
```

#### Flow — 상세

**Step 1: 민팅 전 확인 (유저 판독 시간)**
1. 민팅 정보 카드 표시:
   - 캐릭터 이미지 + archetype 이름
   - DNA 요약 (상위 2개 축)
   - "Non-transferable" 경고 (아이콘 + 볼드)
   - "Bound to wallet: 0xAB...CD"
   - 예상 가스비: `~0.002 BNB` (실시간 estimate)
2. "Skip for now" 텍스트 링크 → 민팅 없이 Monster Room으로 (read-only 모드)

**Step 2: 민팅 실행**
3. "Mint Soul Core" 클릭
4. 지갑 팝업: 트랜잭션 서명 요청 표시
   - to: SoulCore contract address
   - value: 0 (가스비만)
   - data: `mint(dnaHash, archetype, metadataURI)`
5. 유저 서명 승인

**Step 3: 트랜잭션 대기 (5~30초)**
6. 화면 전환: "Minting..." 오버레이
7. txHash 표시 + BscScan 링크: "View on BscScan"
8. 블록 confirmation 대기 (1 confirm 기준)
9. 대기 중 flavor text:
   - "Your soul is being inscribed on-chain..."
   - "This is permanent. Like your diamond hands."

**Step 4: 민팅 완료**
10. 확인 완료 → 축하 연출:
    - 캐릭터 이미지에 glow 이펙트
    - "Soul Core #1234 — Bound to your wallet"
    - confetti 또는 파티클 (archetype 컬러)
11. token ID 표시
12. "Enter Monster Room →" CTA

#### Branch S-06-skip: 민팅 스킵
1. "Skip for now" 클릭
2. Monster Room으로 이동 (read-only)
3. 민팅 없어도 DNA/archetype/이미지/diary 기능은 작동
4. 다만 온체인 기록 없음
5. 상단에 "Mint your Soul Core to claim on-chain" 배너 지속

#### Failure Modes
- **F-06a**: 잔고 부족
  1. 가스 estimate 시점에 잔고 확인
  2. 부족 시 버튼 위에: "Insufficient BNB for gas"
  3. testnet이면: "Get test BNB from faucet →" + faucet URL
  4. mainnet이면: "Top up your wallet with BNB"

- **F-06b**: 유저 지갑에서 reject
  1. "Transaction cancelled" 토스트 (2초)
  2. 원래 민팅 화면 복귀
  3. "Changed your mind? You can always mint later." 문구
  4. "Mint Soul Core" 버튼 다시 활성

- **F-06c**: 트랜잭션 실패 (on-chain revert)
  1. BscScan 링크와 함께: "Transaction failed"
  2. 가능한 원인 표시:
     - "Already minted" → S-06d로
     - "Contract paused" → "Service temporarily unavailable"
     - 기타: "Unexpected error" + txHash
  3. "Retry" 버튼

- **F-06d**: 이미 민팅된 지갑
  1. 컨트랙트에서 `alreadyMinted` 체크
  2. Birth 페이지 진입 시 자동 감지
  3. 민팅 화면 대신: "Welcome back! You have Soul Core #1234"
  4. "Enter Monster Room →" 직행

- **F-06e**: 트랜잭션 pending이 너무 오래 (2분+)
  1. "Transaction is taking longer than usual..."
  2. "Check on BscScan →" 링크
  3. "You can navigate away — we'll notify you when it confirms"
  4. Monster Room으로 이동 허용 (pending 상태 배지 표시)

---

## 3. Monster Room 시나리오

---

### S-07. Monster Room 진입 — 첫 방문

**Actor:** P1
**Precondition:** Soul Core 민팅 완료 또는 스킵
**Entry Point:** `/monster?wallet=0xAB...CD`

#### 화면 구성
```
┌──────────────────────────────────────────────┐
│  DegenBorn   [Monster Room] [Diary] [Share]  0xAB..CD │
├──────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────────────────────┐          │
│  │ DNA      │  │                          │          │
│  │          │  │     (캐릭터 이미지)        │          │
│  │ AGG  82  │  │     base portrait         │          │
│  │ CON  34  │  │     overlay: (없음)       │          │
│  │ CHA  76  │  │                          │          │
│  │ LCK  41  │  │                          │          │
│  │ SRV  91  │  └──────────────────────────┘          │
│  │          │                                        │
│  │ Archetype│  ┌──────────────────────────┐          │
│  │ Rug      │  │ Level: 1                 │          │
│  │ Necro-   │  │ Mood: awakened           │          │
│  │ mancer   │  │ Crowns: 0  Scars: 0      │          │
│  └──────────┘  │ Corruption: 0            │          │
│                │ Prestige: 0              │          │
│                │ Survival Streak: 0       │          │
│                └──────────────────────────┘          │
│                                                      │
│  ┌──────────────────────────────────────┐            │
│  │ Equipped Traits                       │            │
│  │ (none yet)                            │            │
│  │ "Your first trade will leave a mark." │            │
│  └──────────────────────────────────────┘            │
│                                                      │
│  Soul Core #1234 · Bound · Non-transferable          │
└──────────────────────────────────────────────┘
```

#### Flow — 상세

1. Monster Room 진입
2. 중앙: 캐릭터 일러스트 (base portrait, overlay 없음)
3. 좌측 패널: DNA score 5개 바
   - 각 바 옆에 숫자 표시
   - 점수에 따라 컬러 진하기 변화 (높을수록 vivid)
4. 우측 패널: 상태값
   - Level: 1 (첫 방문)
   - Mood: "awakened"
   - Crowns: 0 / Scars: 0 / Corruption: 0 / Prestige: 0 / Survival Streak: 0
5. 하단: Equipped Traits 영역
   - 처음엔 비어 있음
   - placeholder 텍스트: "Your first trade will leave a mark."
6. 최하단: Soul Core 토큰 정보
   - `Soul Core #1234 · Bound · Non-transferable`
   - 민팅 스킵한 경우: `[Mint Soul Core]` 버튼

#### 네비게이션 탭
- **Monster Room** (현재 활성)
- **Diary** → S-19 (Mutation Diary)
- **Share** → S-18 (Share Card)
- **Relics** → S-20 (P1 scope, 비어 있으면 숨김)

---

### S-08. Monster Room 재방문 — 업데이트 감지

**Actor:** P1 (재방문)
**Precondition:**
- 이전에 분석/민팅 완료
- 마지막 방문 이후 Four.meme에서 새 거래 발생

#### Flow — 상세

**Step 1: 재진입 (즉시)**
1. 유저가 지갑 재연결 후 `/monster`로 진입
2. 기존 캐릭터 + 상태값이 즉시 표시 (캐시된 마지막 상태)

**Step 2: 업데이트 확인 (3~10초, 비동기)**
3. 백그라운드에서 `POST /api/check-updates` 호출
4. `last_scored_at` 이후 발생한 새 이벤트 count 반환
5. 새 이벤트가 있으면 → 상단에 배너 슬라이드-인:
   ```
   ┌──────────────────────────────────────┐
   │ 🔄 Your soul has changed since last visit.  │
   │    7 new events detected.                    │
   │    [Update Now →]    [Later]                 │
   └──────────────────────────────────────┘
   ```

**Step 3: 업데이트 실행 (유저 클릭)**
6. "Update Now" 클릭
7. 새 이벤트를 state machine에 순차 적용
8. 각 mutation이 적용될 때마다:
   - 해당 상태값에 숫자 변화 애니메이션 (0 → +1 등)
   - 새 trait 장착 시 overlay 추가 + 하이라이트 pulse
   - diary에 entry 추가

**Step 4: 업데이트 완료**
9. "Update complete" 토스트
10. 변화 요약: "3 mutations applied: +1 crown, +2 scars, mood → revenge"
11. 최근 mutation 1개가 diary 미니 프리뷰로 하단에 노출

#### Branch S-08-nochange: 변화 없음
1. 새 이벤트 0건
2. 배너 대신 작은 텍스트: "No new changes. Keep trading on Four.meme."
3. 기존 Monster Room 상태 유지

#### Branch S-08-bulk: 대량 변화 (50건+)
1. 새 이벤트가 50건 이상
2. 개별 애니메이션 하지 않음 → 배치 처리
3. "Processing 67 events..." 프로그레스 바
4. 최종 결과만 한 번에 적용
5. 요약: "67 events processed. Major changes: Level 1 → 4, +3 crowns, +2 scars"

#### Branch S-08-archetype-change: 아키타입 변경
1. 새 이벤트로 인해 DNA 점수가 대폭 변동
2. 기존 archetype과 다른 archetype이 계산됨
3. **아키타입은 바뀌지 않는다** (고정 결정, PROJECT.md §23)
4. 대신: DNA 점수만 업데이트, archetype 옆에 작은 마크:
   "Your DNA shifted, but your soul remembers who you are."

---

## 4. 진화 (Evolution) 시나리오 — 이벤트 타입별

모든 진화 시나리오는 **Monster Room 안에서** 또는 **Replay Mode 안에서** 발생한다.
유저가 직접 "진화" 버튼을 누르는 게 아니라, 이벤트 적용 시 자동으로 일어난다.

---

### S-09. 수익 이벤트 — 단건 수익

**Actor:** P1
**Trigger:** sell 이벤트에서 pnl_delta > 0 (양수)

#### State 변화
```
mood: (이전 값) → "winning"
```

#### Overlay 변화
- 없음 (단건 수익은 trait 변화 없음, mood만 변경)

#### Diary Entry
```json
{
  "reason": "Profitable trade",
  "trait_delta": { "mood": "winning" },
  "state_before": { "mood": "neutral" },
  "state_after": { "mood": "winning" },
  "caption": "A taste of profit. Don't get used to it."
}
```

#### 유저 경험
- Monster Room에서 mood 텍스트 변화 (예: "neutral" → "winning")
- 캐릭터 이미지 변화 없음
- diary에 entry 추가 → 작은 notification dot

---

### S-09a. 연속 수익 3회 — 왕관 획득

**Actor:** P1
**Trigger:** 연속 수익 3회 (state rule: 직전 3개 sell 이벤트가 모두 pnl_delta > 0)

#### State 변화
```
crownCount: N → N+1
mood: (이전 값) → "triumph"
level: (이전 값) → +1 (if crownCount crosses threshold)
```

#### Overlay 변화
- 캐릭터 머리 위에 왕관 trait 장착
- crownCount별 왕관 변형:
  - 1: 작은 금빛 왕관
  - 2: 보석 박힌 왕관
  - 3+: 불꽃 왕관 (fire crown)

#### 시각적 연출
1. 캐릭터 위에 빛줄기 이펙트 (0.5초)
2. 왕관이 위에서 내려오는 애니메이션 (0.3초)
3. 왕관 착지 시 반짝임 pulse
4. 상태 패널에서 `crownCount` 숫자가 flash + 증가

#### Diary Entry
```json
{
  "reason": "Three wins in a row — crowned",
  "trait_delta": { "crownCount": "+1", "mood": "triumph" },
  "state_before": { "crownCount": 0, "mood": "winning" },
  "state_after": { "crownCount": 1, "mood": "triumph" },
  "caption": "The crowd bowed. You finally tasted a throne.",
  "asset": "overlay://crown_v1"
}
```

---

### S-10. 큰 손실 — 흉터 획득

**Actor:** P1, P2
**Trigger:** sell 이벤트에서 pnl_delta < -30% (포트폴리오 대비 비율) 또는 절대 금액이 임계치 초과

#### State 변화
```
scarCount: N → N+1
mood: (이전 값) → "despair"
```

#### Overlay 변화
- scarCount별 시각 변화:
  - 1: 볼에 작은 흉터 1줄
  - 2: 눈 아래 붕대
  - 3: 찢어진 옷 + 붕대
  - 4+: 균열이 깊어지고 피부가 갈라짐

#### 시각적 연출
1. 화면 전체가 0.2초간 붉게 flash
2. 캐릭터 얼굴에 흉터 slash 이펙트 (왼쪽 → 오른쪽)
3. 흉터가 남고 fade-settle
4. 배경 톤이 1단계 어두워짐 (mood → despair)
5. 상태 패널 `scarCount` 증가 애니메이션

#### Diary Entry
```json
{
  "reason": "Major loss (-42%)",
  "trait_delta": { "scarCount": "+1", "mood": "despair" },
  "state_before": { "scarCount": 0, "mood": "neutral" },
  "state_after": { "scarCount": 1, "mood": "despair" },
  "caption": "You touched the fire. It remembered you."
}
```

#### 유저 감정 의도
- 손실을 "실패"로 보여주지 않는다. "상처"로 보여준다.
- 캡션 톤: 비관/비난 X, 시적/어두운 서사 O

---

### S-10a. 소규모 손실 — 기록만

**Trigger:** pnl_delta < 0이지만 -10% 미만

#### State 변화
```
mood: "cautious" (일시적, 다음 이벤트에서 덮어씌워짐)
```

#### Overlay 변화: 없음

#### Diary Entry
```json
{
  "reason": "Minor loss",
  "caption": "A scratch. Nothing that won't heal."
}
```

---

### S-11. 럭풀 이벤트 — 좀비화

**Actor:** P1, P2
**Trigger:** 럭풀 추정 이벤트 감지
- 조건: 특정 토큰의 유동성이 급감 (>90% 이상) 하면서 해당 토큰 보유 중이었던 경우
- data adapter에서 `event_type: "rug_estimated"` 로 분류

#### State 변화
```
corruption: N → N+20
zombieTrait: false → true (최초) / corruption 누적
mood: (이전 값) → "corrupted"
scarCount: N → N+1
```

#### Overlay 변화 — corruption 단계별
- **corruption 1~20**: 한쪽 눈이 녹색으로 변함 (좀비 눈)
- **corruption 21~40**: 피부에 균열 + 검은 연기
- **corruption 41~60**: 전신에 부패 텍스처
- **corruption 61~80**: 검은 입김 + 독안개 오라
- **corruption 81~100**: 완전 좀비화 — 해골 요소 + 붉은 눈

#### 시각적 연출 (극적)
1. 화면 전체 0.5초 암전
2. 붉은 flicker 2~3회 (horror 느낌)
3. 캐릭터 이미지에 corruption overlay가 "번지듯" 등장 (0.8초)
4. 좀비 눈이 발광 이펙트
5. 배경에 독안개 파티클 추가
6. "RUGGED" 텍스트가 화면 중앙에 0.3초간 flash 후 사라짐

#### Diary Entry
```json
{
  "reason": "Rug pull detected — $SCAM token",
  "trait_delta": { "corruption": "+20", "zombieTrait": true, "scarCount": "+1", "mood": "corrupted" },
  "state_before": { "corruption": 0, "zombieTrait": false },
  "state_after": { "corruption": 20, "zombieTrait": true },
  "caption": "You were liquidated by the dead. Now you walk with them."
}
```

#### 유저 감정 의도
- 럭풀은 가장 극적인 이벤트. 연출도 가장 강해야 함.
- 유저가 스크린샷을 찍고 공유하고 싶은 순간.
- 캡션 톤: 공포 → 수용 → "나도 좀비가 됐다" (밈으로 승화)

---

### S-11a. 연속 럭풀 — corruption 누적

**Trigger:** 2번째 이상 럭풀

#### 추가 State 변화
```
corruption: N → N+20 (누적, 최대 100)
```

#### 추가 연출
- "Another one." 캡션
- corruption 단계가 올라갈 때마다 overlay가 더 심해짐
- corruption 100 도달 시 → S-13 Major Evolution 후보 트리거

---

### S-12. 회복 이벤트 — 복수 오라

**Actor:** P1, P2
**Trigger:** 다음 조건 모두 충족:
1. 직전 상태에 scar ≥ 1 또는 corruption ≥ 20
2. 이후 연속 수익 2회 이상

#### State 변화
```
survivalStreak: N → N+1
mood: (이전 값) → "revenge"
prestige: N → N+10
```

#### Overlay 변화
- 기존 흉터가 금빛으로 변환 (상처 → 훈장)
- 붉은 오라가 캐릭터 뒤에 추가
- survivalStreak별 추가 요소:
  - 1: 붉은 오라
  - 2: 오라 + 검은 날개 (작음)
  - 3+: 오라 + 날개 + 금 테두리

#### 시각적 연출
1. 캐릭터에서 흉터 부분이 0.5초간 반짝 (golden flash)
2. 흉터 텍스처가 "Medal of Scars"로 교체 (scarring → gilded scar)
3. 붉은 오라가 캐릭터 뒤에 확산 (0.5초)
4. mood 텍스트가 "revenge"로 변경되며 붉은색 glow

#### Diary Entry
```json
{
  "reason": "Recovery after loss — revenge mode activated",
  "trait_delta": { "survivalStreak": "+1", "mood": "revenge", "prestige": "+10" },
  "state_before": { "survivalStreak": 0, "mood": "despair", "prestige": 0 },
  "state_after": { "survivalStreak": 1, "mood": "revenge", "prestige": 10 },
  "caption": "What killed you now feeds you."
}
```

#### 유저 감정 의도
- 가장 감정적으로 풍부한 순간
- "나 망했었는데 돌아왔다"를 시각적으로 증명
- 이전 상처가 **지워지지 않고 승격**됨 → 캐릭터 서사의 연속성

---

### S-12a. 장기 생존 보너스

**Trigger:** survivalStreak ≥ 3

#### 추가 State 변화
```
prestige: +15 (추가 보너스)
royalTrait: true (if prestige ≥ 50)
```

#### 추가 Overlay
- prestige ≥ 50: 금빛 테두리 프레임이 캐릭터 주위에 추가
- prestige ≥ 80: 배경에 왕좌/옥좌 실루엣

---

### S-13. 대형 진화 — Major Evolution

**Actor:** P1
**Trigger (OR 조건 — 하나만 충족하면 발동):**
1. 7일 순이익이 이전 7일 대비 300% 이상 급등
2. 럭풀 3회 이상 생존 (corruption ≥ 60 AND survivalStreak ≥ 1)
3. level이 특정 임계치 도달 (level 5, 10, 15...)
4. 연속 3건 이상 손실 후 2건 이상 수익 복귀 (극적 복귀)

#### 화면 구성 — 트리거 시
```
┌──────────────────────────────────────┐
│  ⚡ MAJOR EVOLUTION TRIGGERED ⚡      │
│                                              │
│  Your soul has reached a new stage.          │
│  A full transformation awaits.               │
│                                              │
│  [Transform Now]   [Keep current form]       │
└──────────────────────────────────────┘
```

#### Flow — 상세

**Step 1: 트리거 감지**
1. 이벤트 적용 중 Major Evolution 조건 충족
2. 일반 mutation 적용을 일시 정지
3. 특수 배너가 화면 전체를 덮는 오버레이로 등장

**Step 2: 유저 선택**
4. "Transform Now" → AI 재렌더링 실행 (S-13a)
5. "Keep current form" → overlay만 업그레이드, 이미지 재생성 건너뜀

**S-13a: Transform Now 선택**

6. "Transforming..." 풀스크린 로딩
7. AI에 재렌더 요청:
   ```json
   {
     "wallet": "0xAB...",
     "archetype": "rug_necromancer",
     "dna": { ... },
     "reference_image": "https://assets.degenborn.xyz/genesis/0xAB...CD.png",
     "current_state": { "corruption": 60, "crownCount": 2, "scarCount": 3 },
     "evolution_stage": 2,
     "instruction": "Same character, evolved form. More battle-worn, more powerful."
   }
   ```
8. 10~30초 대기
9. 새 이미지 생성 완료
10. **Before/After 슬라이드:**
    - 좌: 이전 캐릭터
    - 우: 진화된 캐릭터
    - 중앙에 화살표 + "Evolution Stage 1 → 2"
11. "This is your new form."
12. Snapshot Relic 발행 제안 (P1 범위):
    - "Mint this moment as a Snapshot Relic?"
    - [Mint Relic] / [Skip]
13. Monster Room 캐릭터 이미지 교체

**S-13b: Keep current form 선택**
6. Major Evolution 로그만 diary에 기록
7. overlay만 추가 업그레이드 (golden frame 등)
8. 나중에 변환 가능한 건 아님 (이 시점의 Evolution은 스킵됨)

#### Failure Modes
- **F-13a**: 재렌더 실패 → overlay만 업그레이드 + "Transform failed. Your scars speak for themselves."
- **F-13b**: 재렌더 결과가 기존 캐릭터와 너무 다름 → reference image weight를 높여 재시도 1회

---

## 5. Mutation Diary 시나리오

---

### S-14. Diary 읽기

**Actor:** P1, P2
**Entry Point:** Monster Room 상단 "Diary" 탭 클릭

#### 화면 구성
```
┌──────────────────────────────────────┐
│  Mutation Diary              0xAB..CD │
├──────────────────────────────────────┤
│                                              │
│  ┌─ Apr 12, 2026 ────────────────────┐      │
│  │ 🏆 Three wins in a row — crowned  │      │
│  │ crown +1 · mood → triumph          │      │
│  │ "The crowd bowed."                 │      │
│  │           [Share this moment]      │      │
│  └───────────────────────────────────┘      │
│                                              │
│  ┌─ Apr 11, 2026 ────────────────────┐      │
│  │ 💀 Rug pull — $SCAM               │      │
│  │ corruption +20 · zombieTrait ON    │      │
│  │ "You walk with the dead now."      │      │
│  │           [Share this moment]      │      │
│  └───────────────────────────────────┘      │
│                                              │
│  ┌─ Apr 10, 2026 ────────────────────┐      │
│  │ 🩸 Major loss (-42%)              │      │
│  │ scar +1 · mood → despair           │      │
│  │ "The fire remembered you."         │      │
│  │           [Share this moment]      │      │
│  └───────────────────────────────────┘      │
│                                              │
│  (load more...)                              │
└──────────────────────────────────────┘
```

#### Flow — 상세

1. Diary 탭 클릭
2. 최근 10개 entry가 역시간순으로 표시
3. 각 entry 구성:
   - **아이콘**: 이벤트 타입별 (🏆 왕관, 💀 럭풀, 🩸 손실, ⚡ 진화, 🔥 복수)
   - **제목**: reason 요약
   - **상태 변화**: trait_delta의 한 줄 요약
   - **캡션**: AI 생성 서사
   - **"Share this moment"** 버튼
4. 스크롤 시 추가 로딩 (10개씩 pagination)
5. 총 entry 수 표시: "23 mutations recorded"

#### 빈 Diary
- entry 0건: "No mutations yet. Your story begins with your next trade."

---

### S-14a. Diary entry 상세 보기

**Trigger:** diary entry 카드 클릭

#### 확장 카드 내용
```
┌─ Apr 11, 2026 ─────────────────────────┐
│ 💀 Rug pull detected — $SCAM token       │
│                                          │
│ Before:                                  │
│   corruption: 0, zombieTrait: false      │
│   mood: neutral                          │
│                                          │
│ After:                                   │
│   corruption: 20, zombieTrait: true      │
│   mood: corrupted                        │
│                                          │
│ "You were liquidated by the dead.        │
│  Now you walk with them."                │
│                                          │
│ [Share this moment] [View on BscScan]    │
└──────────────────────────────────────────┘
```

---

## 6. Edge Case 유저 시나리오

---

### S-15. 활동 없는 지갑 (콜드 월렛)

**Actor:** P6
**Precondition:** Four.meme 거래 0건인 지갑

#### Flow — 상세

**Step 1: Awakening 진입**
1. S-03 Phase 1 시작
2. 트랜잭션 스캔 → 결과 0건

**Step 2: 빈 상태 감지**
3. normalized events 0건
4. scoring engine에 빈 배열 입력
5. 모든 DNA 점수 = 0 또는 기본값 (Aggression: 0, Conviction: 0, ...)

**Step 3: "Unborn Soul" 상태**
6. archetype classifier → 분류 불가 → `archetype: "unborn"`
7. 화면 전환: 일반 Archetype Reveal 대신 특수 화면
```
┌──────────────────────────────────────┐
│                                              │
│        Your soul is still sleeping.          │
│                                              │
│   ┌───────────────────────────┐              │
│   │  (반투명 egg/embryo 형태  │              │
│   │   placeholder 이미지)     │              │
│   └───────────────────────────┘              │
│                                              │
│   We couldn't find Four.meme activity        │
│   linked to this wallet.                     │
│                                              │
│   Start trading on Four.meme to              │
│   awaken your monster.                       │
│                                              │
│   [Go to Four.meme →]  [Try Replay Demo]    │
│                                              │
│   ── Or enter another wallet ──              │
│   [ 0x... ]  [Analyze]                       │
│                                              │
└──────────────────────────────────────┘
```

**Step 4: 민팅 가능 여부**
8. "Unborn" 상태에서도 Soul Core 민팅 가능 (optional)
9. 단, dormant 상태로 표시
10. 나중에 거래 후 다시 와서 Update 시 활성화

#### 유저에게 주는 선택지
- Four.meme 바로가기 (외부 링크)
- Replay Demo로 체험
- 다른 지갑 주소 입력 (read-only 조회)

---

### S-16. 거래 1~2건인 지갑 (극소량)

**Actor:** P6
**Precondition:** Four.meme 거래 1~2건

#### Flow
1. scoring engine 실행 → 점수가 극단적 (데이터 부족으로 왜곡 가능)
2. 경고 배지: "Based on limited data (2 trades)"
3. archetype은 결정하되 confidence 낮음
4. DNA 바 옆에 "?" 아이콘 (hover: "Not enough data for accurate scoring")
5. Genesis 이미지 생성은 정상 진행
6. Monster Room에서 "Trade more to sharpen your DNA" 프롬프트

---

### S-17. 혼합 지갑 (Four.meme + 다른 DEX)

**Actor:** P1
**Precondition:** 지갑에 PancakeSwap, Uniswap 등 다른 DEX 활동이 훨씬 많음

#### Flow — 상세
1. data adapter가 전체 tx 중 Four.meme 관련만 필터링
2. 필터링 기준: Four.meme router contract 주소와의 interaction
3. Awakening 화면에서: "We read only your Four.meme soul" 안내 문구
4. DNA 계산은 필터된 이벤트만 사용
5. 유저가 혼란스러울 수 있는 지점: "내 PancakeSwap 거래는 왜 안 보이지?"
6. FAQ 또는 tooltip: "DegenBorn focuses on Four.meme activity exclusively."

---

### S-18. 남의 지갑 조회 (read-only)

**Actor:** P3 (관전자), P4 (커뮤니티)
**Entry Point:** URL에 `?wallet=0x...` 파라미터 또는 검색창

#### Flow — 상세

1. 관전자가 링크를 받음: `degenborn.xyz/monster?wallet=0xDEAD...`
2. 접속 시 자기 지갑 연결 없이 바로 해당 주소의 Monster Room 표시
3. 화면에 배지: "👁 Viewing 0xDEAD...BEEF's soul"
4. 볼 수 있는 것:
   - DNA 점수
   - Archetype
   - 캐릭터 이미지 + overlay
   - 상태값 (level, mood, crown, scar...)
   - Mutation Diary (read-only)
5. 할 수 없는 것:
   - Mint (버튼 비활성 + "Only the wallet owner can mint")
   - Share Card 생성 (자기 캐릭터만 가능)
   - Update (자기 것만)
6. 하단: "This is not your wallet. [Connect your wallet →]"

#### 보안 고려
- 남의 지갑을 대신 민팅하는 경로 차단
- 컨트랙트 레벨: `msg.sender == wallet` 검증
- 프론트엔드 레벨: 연결된 지갑 ≠ 조회 지갑이면 write 동작 전부 비활성

---

### S-19. 지갑 스위칭 (같은 세션에서 다른 지갑 연결)

**Actor:** P1, P4
**Trigger:** Monster Room 보는 중 지갑 변경 (MetaMask에서 계정 변경 등)

#### Flow — 상세
1. wagmi가 account change 이벤트 감지
2. 현재 화면의 캐릭터가 새 지갑과 불일치
3. 모달 또는 배너: "Wallet changed to 0xNEW...ADDR"
4. 선택지:
   - "Load new wallet's soul" → 새 지갑으로 전체 분석 재실행 (S-03부터)
   - "Stay as viewer" → 기존 지갑의 read-only 모드 유지
5. 자동으로 아무 데이터도 덮어쓰지 않음

---

### S-20. 세션 중단/복구 시나리오

#### S-20a: Awakening 중 새로고침
1. Phase 2 진행 중 F5
2. 재진입 시 서버 캐시 확인
3. 캐시 있음 → 바로 결과 표시
4. 캐시 없음 → S-03 처음부터 (1~2초 추가 소요)

#### S-20b: 민팅 트랜잭션 pending 중 탭 닫기
1. 트랜잭션은 블록체인에서 처리 중 (지갑에 종속)
2. 탭 재진입 → 최근 txHash로 상태 확인
3. confirmed → 축하 화면 표시
4. 여전히 pending → pending 상태 복원
5. failed → 에러 + retry

#### S-20c: Monster Room에서 장시간 방치 (30분+)
1. 특별한 처리 없음 (정적 페이지)
2. 재상호작용 시 API 호출은 fresh하게
3. 지갑 연결 상태 확인 (disconnect 되었으면 reconnect 프롬프트)

---

### S-21. 모바일 사용자

**Actor:** P1 (모바일)
**Precondition:** MetaMask 앱 내 브라우저 또는 모바일 Chrome

#### 화면 조정
- 좌/우 패널 → 상하 스택으로 전환
- 캐릭터 이미지: 화면 상단 60%
- DNA + 상태: 아래 탭으로 전환 가능
- Share Card: 모바일 공유 sheet 연동 (navigator.share API)

#### 터치 인터랙션
- Diary: 세로 스크롤
- Overlay trait 확인: 캐릭터 long-press → trait 리스트 팝오버
- Share: 탭 → 즉시 카드 + 공유 옵션

#### 제한
- WalletConnect QR은 모바일에서 불편 → 딥링크 우선
- 이미지 합성이 무거우면 → 서버사이드 렌더링 우선

---

### S-22. 극단적 활동 패턴

#### S-22a: 올 럭풀 지갑 (럭풀만 5회+, 수익 0)
- corruption 100 (캡)
- scarCount 5+
- archetype: Rug Necromancer 또는 Ghost Bagholder
- 캐릭터: 완전 좀비화
- 캡션 톤: "존경"에 가까운 톤 — "You survived the impossible."
- 특수 trait: "Unkillable" 칭호

#### S-22b: 올 수익 지갑 (손실 0, 수익만)
- crownCount 높음
- prestige 높음
- archetype: Ice Whale 또는 Sniper Jester
- 캐릭터: 금빛 풀 왕관 + 로얄 프레임
- 캡션 톤: "Built different."
- 특수 trait: "Untouched" 칭호

#### S-22c: 초대량 트레이더 (1000+ txs in 30d)
- 매우 높은 Aggression (90+)
- scoring 시 정규화가 중요 (Aggression이 100 포화되지 않게)
- 분석 시간 더 길어질 수 있음 → progress bar 상세

#### S-22d: 단일 토큰 몰빵
- Conviction 극히 높음 (95+)
- 다른 축은 상대적 저점
- archetype: Diamond Cultist 거의 확정
- 캡션: "One token. One belief. Diamond until death."

---

## 7. 공유 / 소셜 시나리오

---

### S-23. Share Card 생성

**Actor:** P1, P4
**Precondition:** Monster Room 진입 + 최소 archetype 결정됨
**Entry Point:** "Share" 탭 클릭

#### 화면 구성
```
┌──────────────────────────────────────┐
│  Share Your Monster                          │
├──────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────┐            │
│  │  SHARE CARD PREVIEW          │            │
│  │                              │            │
│  │  ┌────────┐                  │            │
│  │  │(캐릭터)│  Rug Necromancer │            │
│  │  │        │  Level 3         │            │
│  │  └────────┘                  │            │
│  │                              │            │
│  │  Chaos 82 · Survival 88     │            │
│  │  3 scars · 1 crown          │            │
│  │                              │            │
│  │  "What killed me now feeds   │            │
│  │   me. I walk with the dead." │            │
│  │                              │            │
│  │  degenborn.xyz · 0xAB..CD   │            │
│  └──────────────────────────────┘            │
│                                              │
│  Caption:                                    │
│  "What killed me now feeds me. 💀👑"          │
│  [🔄 Regenerate caption]                     │
│                                              │
│  [📥 Download PNG]                           │
│  [📋 Copy caption]                           │
│  [🔗 Copy link]                              │
│                                              │
└──────────────────────────────────────┘
```

#### Flow — 상세

**Step 1: 카드 생성 (0.5~2초)**
1. "Share" 탭 클릭
2. 서버에 카드 데이터 요청:
   - 현재 캐릭터 이미지 (overlay 포함)
   - archetype + DNA top 2
   - 상태값 요약 (scars, crowns)
   - AI 캡션 1줄
3. 카드 preview 렌더링

**Step 2: 캡션 확인/편집**
4. AI 생성 캡션 표시
5. "Regenerate caption" → 다른 캡션 요청 (최대 3회)
6. 캡션은 유저가 편집할 수 없음 (AI 전용, 톤 일관성 유지)
7. 캡션 규칙:
   - 1~2줄 이내
   - 밈 톤 (진지하지 않게)
   - 투자 조언 문구 절대 불포함
   - 절대 지갑 전체 주소 노출 안 함

**Step 3: 내보내기**
8. "Download PNG" → canvas → PNG blob → download 트리거
   - 이미지 크기: 1200x630px (OpenGraph 최적)
   - 아래에 `degenborn.xyz` watermark
9. "Copy caption" → 클립보드 복사 + "Copied!" 토스트
10. "Copy link" → `degenborn.xyz/monster?wallet=0xAB...CD` 복사
    - 이 링크를 받은 사람은 S-18 (read-only 뷰) 로 진입

#### 자동 게시 금지 확인
- **이 화면에 "Post to X" 직접 게시 버튼은 존재하지 않는다.**
- 유저가 다운받은 이미지/카피를 직접 X/텔레그램에 올린다.
- 이것은 PROJECT.md §5.4 설계 원칙을 따름.

#### Failure Modes
- **F-23a**: 이미지 합성 실패 → 텍스트 전용 카드 (캐릭터 이미지 없이 archetype + DNA 텍스트만)
- **F-23b**: 캡션에 부적절한 문구 → 자동 재생성, 2회 연속 실패 시 기본 캡션:
  "My soul was born on DegenBorn. What's yours?"

---

### S-24. Mutation Diary에서 단일 모먼트 공유

**Actor:** P1, P2
**Precondition:** diary에 최소 1개 entry
**Entry Point:** diary entry의 "Share this moment" 버튼

#### Flow — 상세
1. 특정 diary entry에서 "Share this moment" 클릭
2. 모먼트 전용 카드 생성:
   - 이벤트 아이콘 + 날짜
   - before → after 상태 diff
   - 해당 이벤트의 캡션
   - 캐릭터 이미지 (해당 시점 overlay 스냅샷)
3. S-23과 동일한 내보내기 옵션 (PNG/caption/link)
4. 모먼트 링크: `degenborn.xyz/monster?wallet=0xAB..CD&moment=m_12`

---

### S-25. Snapshot Relic 민팅 (P1)

**Actor:** P1
**Precondition:** Major Evolution 발생 (S-13)
**Entry Point:** Major Evolution 후 "Mint Relic" 제안

#### Flow — 상세

1. S-13 Transform 완료 후
2. "Mint this moment as a Snapshot Relic?" 모달:
   ```
   ┌──────────────────────────────┐
   │  Snapshot Relic               │
   │                              │
   │  "Rug Survivor"              │
   │  Survived 3 rug pulls        │
   │  Evolution Stage 2           │
   │                              │
   │  This NFT is transferable.   │
   │  Unlike your Soul Core,      │
   │  Relics can be traded.       │
   │                              │
   │  [Mint Relic]  [Skip]        │
   └──────────────────────────────┘
   ```
3. "Mint Relic" → ERC-721 mint tx (transferable)
4. pending / confirmed / fail 은 S-06과 동일 패턴
5. 완료 후 Monster Room "Relics" 탭에 추가됨

#### Relics 탭 (Monster Room)
```
┌ Relics ──────────────────────────┐
│                                  │
│  [Rug Survivor]  [First Crown]  │
│  Apr 11, 2026    Apr 12, 2026   │
│  Stage 2         Stage 3        │
│                                  │
│  These are tradeable NFTs.       │
│  Your Soul Core stays bound.     │
└──────────────────────────────────┘
```

---

## 8. 관전자 / 갤러리 / Compare 시나리오

---

### S-26. Gallery 탐색

**Actor:** P3, P4
**Precondition:** 없음 (지갑 연결 불필요)
**Entry Point:** `/gallery`

#### 화면 구성
```
┌──────────────────────────────────────┐
│  Monster Gallery                             │
│                                              │
│  Filter: [All] [Mad Gambler] [Ice Whale]     │
│          [Rug Necro] [Diamond] [Sniper]      │
│          [Ghost]                             │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │(캐릭터) │ │(캐릭터) │ │(캐릭터) │        │
│  │Rug Necro│ │Ice Whale│ │Mad Gambl│        │
│  │Lv.3    │ │Lv.5    │ │Lv.2    │        │
│  │"Walk..."│ │"Silent."│ │"Burn..." │        │
│  │0xAB..CD │ │0xDE..EF │ │0x12..34 │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │ ...     │ │ ...     │ │ ...     │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│                                              │
│  Page 1 of 3                                 │
└──────────────────────────────────────┘
```

#### Flow — 상세
1. Gallery 페이지 진입 (지갑 불필요)
2. 등록된 Soul Core 보유 지갑들의 카드 리스트 (3x grid)
3. 각 카드:
   - 캐릭터 썸네일 (현재 overlay 포함)
   - archetype 이름
   - level
   - 한 줄 캡션
   - 지갑 주소 (축약)
4. 필터: archetype별
5. 정렬: 최신순 / 레벨순 / corruption 순
6. 카드 클릭 → `/monster?wallet=0x...` (S-18 read-only)
7. pagination (12개씩)

#### MVP에서의 한계
- 실제 유저가 적으면 → 샘플 지갑(fixture)으로 채움
- "Featured Souls" 섹션으로 curated 리스트 제공

---

### S-27. Compare 뷰

**Actor:** P3, P4
**Precondition:** 2개 이상 지갑 선택 가능
**Entry Point:** `/compare` 또는 Gallery에서 "Compare" 버튼

#### 화면 구성
```
┌──────────────────────────────────────────────┐
│  Compare Souls                                       │
├─────────────────────┬────────────────────────┤
│  0xAB..CD            │  0xDE..EF               │
│  Rug Necromancer     │  Ice Whale               │
│  Level 3             │  Level 5                 │
│                      │                          │
│  ┌────────┐          │  ┌────────┐              │
│  │(캐릭터)│          │  │(캐릭터)│              │
│  └────────┘          │  └────────┘              │
│                      │                          │
│  AGG  55 ████░░░░░   │  AGG  31 ███░░░░░░░     │
│  CON  48 █████░░░░   │  CON  85 █████████░     │
│  CHA  82 █████████   │  CHA  18 ██░░░░░░░░     │
│  LCK  29 ███░░░░░░   │  LCK  72 ████████░░     │
│  SRV  88 █████████░  │  SRV  78 ████████░░     │
│                      │                          │
│  Scars: 3            │  Scars: 0                │
│  Crowns: 1           │  Crowns: 4               │
│  Corruption: 60      │  Corruption: 0           │
├─────────────────────┴────────────────────────┤
│  Verdict: "One walks with the dead.                  │
│   The other rules the deep. Who wins?"               │
│                                                      │
│  [Share comparison card]                             │
└──────────────────────────────────────────────┘
```

#### Flow — 상세
1. Compare 페이지에서 좌/우 지갑 주소 입력 (또는 Gallery에서 선택)
2. 양쪽 분석 데이터 로딩
3. 좌우 나란히 표시:
   - 캐릭터 이미지
   - DNA 5개 바 (같은 스케일)
   - 상태값
4. 점수 차이가 큰 축은 하이라이트 (빨간색 바 차이 표시)
5. 하단: AI 생성 "대결 캡션" ("One walks with the dead...")
6. "Share comparison card" → 비교 카드 PNG 내보내기

---

## 9. 발표 / Replay Mode 시나리오

---

### S-28. Replay Mode — 해커톤 발표용

**Actor:** P5 (심사위원), PM (발표자)
**Precondition:** 라이브 데이터 불안정 또는 지갑 없음
**Entry Point:** 랜딩 "Try Replay Demo" 또는 `/replay`

#### 화면 구성 — 초기
```
┌──────────────────────────────────────┐
│  Replay Demo                                 │
│                                              │
│  Choose a sample wallet:                     │
│                                              │
│  [1] The Rug Necromancer — survived 3 rugs   │
│  [2] The Ice Whale — silent king of the deep │
│  [3] The Mad Gambler — ashes and glory       │
│                                              │
│  Or paste a wallet address:                  │
│  [ 0x... ]  [Start]                          │
│                                              │
└──────────────────────────────────────┘
```

#### Flow — 상세

**Step 1: 프리셋 선택**
1. Replay 페이지 진입
2. 3~5개 샘플 지갑 프리셋 표시
   - 각 프리셋: archetype + 한 줄 스토리라인
   - fixture에서 로딩 (외부 API 호출 0)
3. 유저/발표자가 프리셋 1개 선택

**Step 2: Awakening 재생 (자동)**
4. S-03과 동일 화면이지만 **fixture 데이터로 즉시** 동작
   - 프로그레스 바는 시각 효과로만 동작 (실제 API 호출 없음)
   - 각 단계 1~2초 인위적 지연 (연출 목적)

**Step 3: DNA + Archetype 재생**
5. S-03.5 DNA 공개 → S-04 Archetype Reveal 순서대로 자동 재생
6. 각 단계 사이에 "Next →" 버튼 또는 자동 전환 (모드에 따라)

**Step 4: Genesis 재생**
7. 사전 생성된 이미지 로딩 (AI 호출 X)
8. 즉시 표시 (로딩 연출은 1~2초만)

**Step 5: Evolution Timeline 재생**
9. fixture에 포함된 이벤트 시퀀스를 step-by-step 재생:
   ```json
   [
     { "step": 1, "type": "profit", "description": "First win (+30%)" },
     { "step": 2, "type": "profit", "description": "Second win (+22%)" },
     { "step": 3, "type": "profit", "description": "Crown earned 👑" },
     { "step": 4, "type": "rug", "description": "Rug pull — $SCAM 💀" },
     { "step": 5, "type": "loss", "description": "Major loss (-55%)" },
     { "step": 6, "type": "profit", "description": "Recovery trade (+40%)" },
     { "step": 7, "type": "recovery", "description": "Revenge mode activated 🔥" }
   ]
   ```
10. 각 step에서:
    - 이벤트 설명 텍스트 표시
    - state machine 적용
    - trait overlay 실시간 갱신
    - diary entry 추가
11. 컨트롤:
    - [◀ Prev] [▶ Next] — 수동 이동
    - [▶ Auto-play] — 3초 간격 자동 진행
    - [↺ Reset] — 처음으로

**Step 6: Diary + Share 시연**
12. timeline 완료 후 Diary 탭으로 전환
13. 누적된 모든 mutation entry 표시
14. Share Card 생성 시연

#### Replay 전용 UI 요소
- 상단 배너: "🎬 REPLAY MODE — This is a demo with sample data"
- 하단: step indicator (●●●○○○○ — 7 steps 중 3번째)

#### 타이밍 기대 — 발표용
- 전체 시퀀스 (Step 1~6): 수동 1~2분, 자동 재생 45~60초
- "핵심 장면 3개" (왕관 / 럭풀 / 복수): 각 5~10초

#### Failure Modes
- **F-28a**: fixture JSON 로딩 실패 → 번들된 inline JSON fallback (빌드 시 포함)
- **F-28b**: 이미지 에셋 로딩 실패 → CSS gradient placeholder

---

### S-29. Auto-Replay (kiosk / 부스 모드)

**Actor:** 무인 부스 / 자동 시연
**Entry Point:** `/replay?autoplay=1`

#### Flow
1. 페이지 로딩 즉시 첫 프리셋 자동 선택
2. 모든 step 자동 진행 (3초 간격)
3. 전체 시퀀스 완료 → 3초 대기 → 다음 프리셋으로 순환
4. 모든 프리셋 완료 → 첫 프리셋으로 loop
5. 화면 터치/클릭 시 → 수동 모드 전환 + 현재 step에서 멈춤
6. 5초 무조작 → 자동 모드 복귀

#### 추가 UI
- 마우스 커서 숨김 (3초 무조작 후)
- "Touch to interact" 반투명 오버레이 (자동 모드에서)
- 사운드 없음 (부스 환경 고려)

---

### S-30. 발표 시나리오 — 추천 대본 대응

PROJECT.md §18에 정의된 추천 발표 순서와 Replay가 어떻게 맞물리는지.

| 발표 순서 | Replay step | 유저가 보는 것 |
|---|---|---|
| 1. 샘플 지갑 연결 | Step 1 (Awakening) | 프로그레스 바 + 스캔 연출 |
| 2. "당신은 Rug Necromancer" | Step 2-3 (DNA + Reveal) | DNA 바 + archetype 연출 |
| 3. Genesis 캐릭터 등장 | Step 4 (Genesis) | 캐릭터 이미지 reveal |
| 4. 수익 이벤트 → 왕관 | Timeline step 3 | 왕관 overlay + diary entry |
| 5. 럭풀 → 좀비화 | Timeline step 4 | corruption + 좀비 연출 |
| 6. 회복 → 훈장 변환 | Timeline step 7 | scar → gold + revenge 오라 |
| 7. diary 열기 | Diary 탭 | 누적 mutation 리스트 |
| 8. 공유 카드 생성 | Share 탭 | 카드 + 캡션 |

---

## 10. 네트워크/인프라 장애 시나리오

---

### S-31. 데이터 API 완전 다운

**Actor:** P1, P5
**Trigger:** Moralis/Covalent/RPC 전체 불통

#### Flow
1. S-03 Phase 1에서 모든 데이터 소스 실패
2. 3회 재시도 → 전부 실패
3. 유저에게:
   ```
   We couldn't reach the blockchain right now.
   This sometimes happens during peak times.
   
   [Retry in 30 seconds]
   [Try Replay Demo instead]
   ```
4. "Retry" → 30초 쿨다운 후 재시도
5. "Replay" → `/replay` 이동

#### P5 (심사위원) 특수 대응
- 발표 중 이 에러가 뜨면 Replay로 즉시 전환
- Replay는 외부 API 0 의존이므로 100% 안정

---

### S-32. 이미지 생성 서비스 다운

**Trigger:** Flux/DALL-E 등 이미지 API 불통

#### Flow
1. S-05에서 이미지 생성 실패
2. placeholder 이미지로 대체:
   - archetype별로 미리 만들어둔 6종 generic 이미지
   - 이미지 위에 작은 배지: "Default portrait — regenerate later"
3. 민팅은 placeholder로 진행 가능 (metadata에 placeholder URL)
4. 나중에 이미지 서비스 복구 시 → Monster Room에서 "Regenerate portrait" 버튼

---

### S-33. 블록체인 RPC 장애 / 네트워크 혼잡

**Trigger:** BNB Chain RPC 응답 느림/불통

#### 민팅 시
1. 트랜잭션 submit은 성공했지만 confirmation 느림
2. "Transaction submitted. Waiting for confirmation..."
3. 1분 후: "Network is congested. Your transaction is in the queue."
4. BscScan 링크 제공
5. Monster Room 접근은 허용 (민팅 pending 상태로)

#### 데이터 fetch 시
1. RPC fallback 목록으로 순차 시도
2. 모든 RPC 실패 → S-31과 동일

---

### S-34. CDN/에셋 로딩 실패

**Trigger:** 이미지 CDN 다운, CSS/JS 로딩 실패

#### 이미지 CDN
1. 캐릭터 이미지 `<img>` 로딩 실패
2. `onerror` → CSS gradient placeholder + archetype 텍스트
3. "Image unavailable. [Retry loading]"

#### JS 번들
1. 크리티컬 JS 로딩 실패
2. 최소 HTML: 로고 + "Service loading..." + manual reload 링크
3. React hydration 실패 → 같은 fallback

---

### S-35. API Rate Limit (429)

**Trigger:** 짧은 시간에 너무 많은 분석 요청 (P4가 연속 지갑 조회 등)

#### Flow
1. 429 응답 수신
2. exponential backoff: 2초 → 4초 → 8초 → 16초
3. 유저에게: "Still reading... your soul is complex." (자연스러운 카피)
4. 3회 연속 429 → "Too many requests. Please wait a moment."
5. 쿨다운 60초 후 자동 재시도 또는 [Retry] 버튼

---

### S-36. 컨텐츠 안전 필터 트리거

**Trigger:** AI 캡션/내러티브에 부적절 문구 포함

#### Flow
1. 캡션 생성 결과를 safety filter에 통과시킴
2. 필터 위반 시 → 자동 재생성 (다른 prompt 변형)
3. 2회 연속 실패 → 기본 캡션으로 대체:
   - "My soul was born on DegenBorn."
   - "What doesn't kill me makes me weirder."
4. **절대 raw LLM 출력이 그대로 유저에게 노출되지 않음**

#### 필터 기준
- 투자 조언 ("buy", "guaranteed returns", "financial advice")
- 과도한 폭력/혐오 표현
- 개인 식별 정보
- 타 서비스/프로젝트 비하

---

## 11. 시간축 기반 유저 여정

유저가 DegenBorn을 시간이 지남에 따라 어떻게 사용하는지.

### Day 1 — 첫 만남

| 시간 | 행동 | 시나리오 |
|---|---|---|
| 0분 | 링크 클릭, 랜딩 도착 | S-01 |
| 0.5분 | "이거 뭐지?" → Connect Wallet | S-02 |
| 1분 | Awakening 시작 | S-03 |
| 1.5분 | DNA 공개 → "오 나 Chaos 82네" | S-03.5 |
| 2분 | "Rug Necromancer?!" 리액션 | S-04 |
| 2.5분 | Genesis 캐릭터 등장 | S-05 |
| 3분 | "이거 민팅해야겠다" → Mint | S-06 |
| 4분 | Monster Room 둘러보기 | S-07 |
| 5분 | Share Card 다운, X에 올림 | S-23 |

**이 날의 핵심**: "이거 뭐야" → "나 이거다" → "공유해야겠다"
**리텐션 훅**: "내일 거래 더 하면 뭐가 바뀔까?"

### Day 3~7 — 첫 진화

| 시간 | 행동 | 시나리오 |
|---|---|---|
| 재접속 | Monster Room 진입 | S-08 |
| 즉시 | "Your soul has changed" 배너 | S-08 |
| 업데이트 | 왕관 획득! → 스크린샷 | S-09a |
| 이후 | 럭풀 → 좀비화 😱 → 스크린샷 | S-11 |
| 직후 | Diary에서 이벤트 확인 | S-14 |
| 공유 | 럭풀 모먼트 Share → X 올림 | S-24 |

**이 주의 핵심**: 거래할 때마다 캐릭터가 반응한다는 걸 체감
**리텐션 훅**: "내 corruption 지금 40인데 100 가면 어떻게 되지?"

### Day 14~30 — 성장과 서사 축적

| 시간 | 행동 | 시나리오 |
|---|---|---|
| 주 1~2회 | Monster Room 체크 | S-08 |
| 누적 | Diary에 15+ entries | S-14 |
| 이벤트 | Major Evolution 트리거! | S-13 |
| 결정 | Transform → 새 캐릭터 등장 | S-13a |
| 민팅 | Snapshot Relic 발행 | S-25 |
| 비교 | 친구 지갑과 Compare | S-27 |

**이 달의 핵심**: "내 캐릭터가 성장했다"
**리텐션 훅**: "다음 Evolution은 언제 트리거되지?"

### 이탈 후 복귀 (2개월 공백)

| 시간 | 행동 | 시나리오 |
|---|---|---|
| 재접속 | 지갑 연결 | S-02 |
| 감지 | "Your soul has changed — 43 events" | S-08 (bulk) |
| 업데이트 | 대량 mutation 일괄 적용 | S-08-bulk |
| 결과 | "Lv.1 → Lv.6, 완전 다른 캐릭터" | S-13 |
| 감정 | "와... 내가 이랬구나" → 다이어리 정독 | S-14 |

---

## 12. 유저 감정 곡선

각 단계에서 유저가 **느껴야 하는** 감정과 **절대 느끼면 안 되는** 감정.
UI/카피/타이밍을 평가할 때 이 표를 기준으로 한다.

| 단계 | 목표 감정 | 어떻게 유발 | Anti-goal | 어떻게 방지 |
|---|---|---|---|---|
| 랜딩 | 호기심 ("뭐지 이거?") | 샘플 캐릭터, 짧은 카피 | 혼란 ("이해 안 됨") | 설명 과다 금지, 시각 우선 |
| 지갑 연결 | 안심 ("서명 안 하네") | "No signing required" 명시 | 경계 ("내 돈 가져가려고?") | 트랜잭션 없음 강조 |
| Awakening | 기대 + 긴장 ("뭐 나올까") | 프로그레스 + flavor text | 지루함 ("아직도 로딩?") | 단계별 시각 피드백 |
| DNA 공개 | 자기 인식 ("오 나 이렇구나") | 바 애니메이션 + 숫자 | 무관심 ("그래서?") | 점수에 감정 라벨 부여 |
| Archetype Reveal | 임팩트 ("와!") | 암전 + 타이핑 + 배경 전환 | 납작함 ("그냥 텍스트네") | 연출을 아끼지 않음 |
| Genesis | 소유욕 ("내 캐릭터다") | 캐릭터 reveal + 캡션 | 평범함 ("별로...") | archetype별 차별화 |
| 민팅 | 의식감 ("온체인에 남는다") | "permanent" 강조 | 귀찮음 ("왜 또 서명") | 간결한 UI, 가스비 표시 |
| Monster Room 첫 진입 | 뿌듯함 ("내 방이다") | 캐릭터 + 스탯 + trait 한눈에 | 빈약함 ("별거 없네") | 빈 상태에도 카피 채움 |
| 왕관 획득 | 쾌감 ("해냈다!") | 빛줄기 + 왕관 내려오기 | 의미 없음 ("그래서?") | 과장된 연출 OK |
| 흉터 획득 | 서사적 아픔 ("아프지만 남는다") | 시적 캡션 + 어두운 톤 | 수치심 ("내가 바보였나") | 비난 톤 절대 금지 |
| 럭풀/좀비화 | 극적 충격 ("!!") + 밈 | 암전 + flicker + "RUGGED" | 우울함 | horror를 밈으로 승화 |
| 회복/복수 | 카타르시스 ("돌아왔다!") | 흉터→금빛 + 오라 | 무덤덤 | 이전 상처와의 연결 |
| Diary | 몰입 ("내 이야기다") | 시간순 서사 + 캡션 | 정보 과다 ("숫자만") | 텍스트 서사 우선, 숫자 보조 |
| Share | 자랑 ("보여줘야지") | 밈 톤 카피 + 깔끔한 카드 | 스팸 느낌 | 자동 게시 기능 없음 |
| Replay | 이해 ("아 이런 거구나") | 단계별 클릭 | 장황 ("너무 김") | 1분 안에 핵심 3개 |

---

## 13. 시나리오 × 티켓 매핑

| 시나리오 | 주요 티켓 | 비고 |
|---|---|---|
| S-01 (랜딩) | T-012 | Birth Screen 중 Landing 부분 |
| S-02 (지갑 연결) | T-011, T-012 | wagmi 연결 + UI |
| S-03 (Awakening) | T-003, T-005, T-006 | data adapter → normalizer → scoring |
| S-03.5 (DNA 공개) | T-006, T-012 | scoring 결과 + DNA panel UI |
| S-04 (Archetype Reveal) | T-007, T-008, T-012 | classifier + narrative + UI |
| S-05 (Genesis) | T-009 | 이미지 파이프라인 |
| S-06 (민팅) | T-010, T-011 | 컨트랙트 + 민팅 플로우 UI |
| S-07 (Monster Room 첫 진입) | T-012 | Monster Room UI |
| S-08 (재방문 업데이트) | T-012, T-003, T-013 | UI + data re-fetch + state machine |
| S-09~S-09a (수익/왕관) | T-013, T-014, T-015 | state machine + overlay + diary |
| S-10~S-10a (손실/흉터) | T-013, T-014, T-015 | state machine + overlay + diary |
| S-11~S-11a (럭풀/좀비) | T-013, T-014, T-015 | state machine + overlay + diary |
| S-12~S-12a (회복/복수) | T-013, T-014, T-015 | state machine + overlay + diary |
| S-13 (Major Evolution) | T-019 | P1 — 재렌더링 |
| S-14 (Diary) | T-015 | diary API + UI |
| S-14a (Diary 상세) | T-015 | diary entry 확장 |
| S-15 (콜드월렛) | T-005, T-006, T-012 | edge case 처리 |
| S-16 (극소량 거래) | T-006 | scoring edge case |
| S-17 (혼합 지갑) | T-003, T-005 | 필터링 로직 |
| S-18 (남의 지갑 read-only) | T-012, T-023 | read-only 모드 |
| S-19 (지갑 스위칭) | T-011, T-012 | wagmi account change |
| S-20 (세션 복구) | T-021 | 에러 처리/폴리싱 |
| S-21 (모바일) | T-012, T-021 | 반응형 + 터치 |
| S-22 (극단 패턴) | T-006, T-013 | scoring/state 극단값 |
| S-23 (Share Card) | T-016 | share card + 캡션 |
| S-24 (모먼트 공유) | T-015, T-016 | diary entry 공유 |
| S-25 (Relic 민팅) | T-018 | P1 — Snapshot Relic |
| S-26 (Gallery) | T-023 | P1 — gallery 뷰 |
| S-27 (Compare) | T-023 | P1 — compare 뷰 |
| S-28 (Replay) | T-017, T-004 | Replay Mode + fixture |
| S-29 (Auto-Replay) | T-017 | kiosk 모드 |
| S-30 (발표 대본) | T-017, T-022 | Replay × 제출물 |
| S-31~S-36 (장애 시나리오) | T-021 | 에러 처리/폴리싱 |

---

## 14. 비시나리오 (명시적으로 하지 않는 것)

아래 동선은 **이번 범위에서 유저에게 제공하지 않는다**. 구현 충동이 올 때 이 목록을 먼저 본다.

1. **자동매매 / 트레이딩 에이전트** — 유저가 DegenBorn 안에서 거래하는 동선 없음
2. **자동 X/Twitter 포스팅** — "Post to X" 버튼 없음. 반드시 유저가 수동 복사/다운로드 후 직접 게시
3. **raw 대화/프롬프트 로그 열람** — LLM 프롬프트는 유저에게 노출하지 않음
4. **전체 온체인 거래 내역** — 숫자로 가득한 tx 목록 화면 없음. Diary가 유일한 히스토리
5. **정밀 세무 손익 리포트** — 페르소나용 정규화 지표만 제공, 세금 계산 안 함
6. **PvP 전투 / leaderboard** — Compare는 있지만 순위 경쟁은 아님. 해커톤 이후 로드맵
7. **캐릭터 커스터마이징** — 유저가 trait를 직접 고르는 게 아니라 행동이 결정
8. **Soul Core 양도/판매** — 비양도형 고정. Snapshot Relic만 거래 가능
9. **멀티 체인 지원** — BNB Chain 전용. Ethereum/Solana 등은 이번 범위에서 제외
10. **알림/push notification** — 유저가 직접 와서 확인하는 pull 모델만
11. **아키타입 재결정** — 최초 결정된 archetype은 변경 불가 (DNA 점수만 업데이트)
12. **유저 계정/로그인** — 지갑 연결만으로 식별. 별도 계정 시스템 없음

---

## 15. 시나리오 검증 체크리스트

제출 직전 이 체크리스트를 순서대로 돌린다.

### Happy Path (P1 디젠)
- [ ] S-01 → S-07까지 한 번도 끊김 없이 흐른다
- [ ] Awakening 5~30초 이내 완료
- [ ] Archetype Reveal 연출이 "와" 소리 나올 정도
- [ ] Genesis 이미지가 archetype에 맞게 나온다
- [ ] 민팅 성공 후 Monster Room에서 Soul Core 확인
- [ ] 진화 이벤트(왕관/흉터/좀비/복수) 각 1회 이상 시연 가능

### Edge Cases
- [ ] S-15 (콜드월렛): "Unborn Soul" 화면 정상 표시
- [ ] S-16 (거래 1건): 경고 배지 + 결과 표시
- [ ] S-02 Branch-a (잘못된 네트워크): switch 프롬프트 정상
- [ ] S-06 Branch-b (민팅 취소): 앱 안 깨짐
- [ ] S-06 Branch-d (이미 민팅): "Already have Soul Core" 표시

### Replay
- [ ] S-28: 네트워크 없이도 데모 흐름 재생
- [ ] 1분 안에 핵심 장면 3개 이상 보여줌
- [ ] Reset 후 같은 시퀀스 반복 재생

### 인프라 장애
- [ ] S-31 (API 다운): Replay fallback 안내
- [ ] S-32 (이미지 서비스 다운): placeholder로 진행
- [ ] S-35 (rate limit): 자연스러운 대기 + 재시도

### 콘텐츠 안전
- [ ] 어떤 시나리오에서도 raw LLM 출력이 그대로 노출되지 않음
- [ ] 어떤 시나리오에서도 "자동 게시" 동작이 일어나지 않음
- [ ] 캡션에 투자 조언 문구가 포함되지 않음

### UX 일관성
- [ ] 모든 시나리오에서 유저가 "지금 뭘 해야 하는지" 화면에 보임
- [ ] 빈 화면이 나오는 시나리오가 0개
- [ ] 에러 메시지가 기술 용어가 아닌 자연어
