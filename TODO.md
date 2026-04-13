# TODO.md — DegenBorn v2 Product Improvement Roadmap

> 2026-04-13 기준. 제출 마감 4월 22일 (D-9).
> 핵심 전략 전환: **"Four.meme 데이터를 가져다 쓰는 프로젝트"에서 → "Four.meme 생태계를 더 가치있게 만드는 프로젝트"로.**

---

## 핵심 진단

### 문제 1: Four.meme과의 관계가 일방적이다
현재 DegenBorn은 Four.meme 라우터 주소로 트랜잭션을 필터링하는 게 전부다. Four.meme 입장에서 보면 **"우리 데이터 가져다 쓰는 프로젝트"**일 뿐, **"우리한테 도움이 되는 프로젝트"**가 아니다. 해커톤 주최자가 좋아하는 프로젝트 = 그들의 플랫폼을 더 가치있게 만드는 프로젝트.

### 문제 2: 안에서만 재밌다
기술 아키텍처는 탄탄하지만 밈이 퍼지려면:
1. **즉시성** — 5초 안에 클릭하게 만드는 것
2. **자기표현** — 공유하고 싶게 만드는 것
3. **반응성** — 다른 사람이 "나도 해볼까" 하게 만드는 것

### 전략적 포지셔닝
> "Four.meme is where meme tokens are born. DegenBorn is where meme traders are born."
> "Every trade on Four.meme shapes your monster. Every monster shared brings someone new to Four.meme."

---

## TIER F: Four.meme Symbiosis (해커톤 수상의 핵심)

> 이 티어의 목표: **DegenBorn이 Four.meme 생태계의 일부로 보이게 만든다. 데이터 추출이 아니라 상호 가치 창출.**
> **이 티어가 없으면 나머지 전부 해도 "Four.meme 해커톤에서 Four.meme과 무관한 프로젝트"가 된다.**

### TF-01. [P0] "Powered by Four.meme" 브랜딩 전면 삽입
**Estimate:** 0.5d
**Depends on:** 없음 (기존 코드 수정)

#### 목표
모든 공유 표면에 Four.meme 브랜딩을 넣어서, DegenBorn이 공유될 때마다 Four.meme도 노출되게 한다.

#### 작업
- [ ] OG 이미지(`/api/og/[wallet]`)에 "Powered by Four.meme" 텍스트 또는 로고 추가
- [ ] Share Card / Trading Card 하단에 "Built on Four.meme data" 워터마크
- [ ] Birth 완료 화면에 "Your monster was born from Four.meme trades" 문구
- [ ] Monster Room 헤더에 "Four.meme Trader Identity" 서브타이틀
- [ ] Soul Core NFT metadata에 `birthplace: "four.meme"` 필드 추가
- [ ] 랜딩 페이지 히어로에 Four.meme 연결 명시

#### 왜 중요
유저가 X에 공유할 때마다 Four.meme이 무료 브랜드 노출을 얻는다. 심사위원에게 "이 프로젝트는 우리 생태계의 마케팅 채널"이라는 인상을 준다.

#### AC
- [ ] 공유 카드에 Four.meme 워터마크가 보인다
- [ ] OG 이미지에 Four.meme 텍스트가 포함된다
- [ ] NFT metadata에 birthplace 필드가 존재한다
- [ ] 랜딩/Birth/Monster Room 3개 화면 모두에 Four.meme 언급

---

### TF-02. [P0] Four.meme Loyalty Score — 생태계 기여도 시각화
**Estimate:** 1d
**Depends on:** 기존 scoring engine

#### 목표
단순 손익이 아니라 **"이 지갑이 Four.meme 생태계에 얼마나 기여하는가"**를 별도 지표로 계산하고 시각화한다.

#### 작업
- [ ] `FourMemeScore` 계산 로직 추가 (scoring engine 확장)
  - 입력: Four.meme 거래 횟수, 참여 토큰 수, Four.meme 체류 기간(첫 거래~마지막 거래), 연속 활동 일수
  - 출력: 0~100 점수 + 등급 (Bronze / Silver / Gold / Diamond / Legendary)
- [ ] DNA Panel에 "Four.meme Loyalty" 6번째 축 추가 (또는 별도 배지)
- [ ] Share Card에 Loyalty 등급 표시
- [ ] "Top Four.meme Trader" 배지 — 상위 등급에 특별 시각 표시
- [ ] Monster Room에 "Four.meme Activity" 섹션: 거래 수, 참여 토큰 수, 활동 기간

#### 왜 중요
Four.meme 입장: **충성 유저를 식별하고 보상할 수 있는 데이터 인프라**가 생긴다. "이걸 우리 플랫폼에 달면 리텐션 올라간다"라는 인사이트를 준다.

#### AC
- [ ] 샘플 지갑 3개에 대해 서로 다른 Loyalty Score가 나온다
- [ ] DNA Panel 또는 별도 UI에 점수가 표시된다
- [ ] 등급별 시각적 차이가 있다 (배지 색상, 테두리 등)

---

### TF-03. [P0] 공유 → Four.meme 리턴 루프 설계
**Estimate:** 0.5d
**Depends on:** TF-01

#### 목표
현재: 공유 → X → 끝. 변경: 공유 → X → DegenBorn → **"Trade on Four.meme to evolve"** → Four.meme. 순환 구조를 만든다.

#### 작업
- [ ] X 공유 텍스트에 "Born from @four_meme trades" 멘션 포함
- [ ] 모든 공유 CTA 텍스트를 "My Four.meme soul" / "My trading monster on Four.meme" 톤으로 통일
- [ ] Monster Room에 "Evolve Your Monster" CTA → "Trade on Four.meme to trigger new mutations" + Four.meme 링크
- [ ] Birth 완료 후 "Your monster grows with every Four.meme trade" 안내
- [ ] 랜딩 페이지 하단에 "Start trading on Four.meme → Come back to see your monster evolve" 플로우 다이어그램

#### 왜 중요
심사위원이 보고 싶은 것: **"이 프로젝트가 있으면 Four.meme DAU가 올라간다."** 공유 루프가 Four.meme 트래픽으로 돌아가는 구조를 명시적으로 보여줘야 한다.

#### AC
- [ ] X 공유 시 @four_meme 멘션 포함
- [ ] Monster Room에 Four.meme 거래 유도 CTA 존재
- [ ] 랜딩에서 Four.meme → DegenBorn → Four.meme 순환 플로우가 시각적으로 설명됨

---

### TF-04. [P0] 임베더블 Monster Widget API
**Estimate:** 0.5d
**Depends on:** 기존 /api/analyze, /api/og

#### 목표
Four.meme이 원하면 자기 플랫폼에 DegenBorn 몬스터 카드를 임베드할 수 있는 API를 제공한다. 데모에서 "이렇게 Four.meme 프로필에 붙을 수 있습니다" 한 장면을 보여주는 게 목적.

#### 작업
- [ ] `GET /api/widget/[wallet]` 엔드포인트 생성
  - 반환: JSON (archetype, level, loyalty_score, image_url, share_url)
- [ ] `GET /api/widget/[wallet]/image` — 미니 몬스터 카드 이미지 (300x400 PNG/SVG)
  - 아키타입 + 레벨 + Loyalty 배지 + 캐릭터 이미지
- [ ] `GET /api/widget/[wallet]/embed` — iframe 가능한 미니 카드 HTML
- [ ] CORS 설정: Four.meme 도메인 허용 (데모용으로 `*` 가능)
- [ ] API 문서 간단히 작성 (`docs/widget-api.md`)

#### 왜 중요
발표에서 "이 위젯을 Four.meme 프로필에 넣으면, 트레이더들이 자기 정체성을 보여줄 수 있습니다" 한 마디면 **Practical Value 점수**가 확 올라간다. 실제 통합 안 해도 API가 존재한다는 것만으로 "통합 가능성"을 입증한다.

#### AC
- [ ] `/api/widget/[wallet]` JSON 응답이 정상 반환
- [ ] `/api/widget/[wallet]/image` 이미지가 렌더링됨
- [ ] 데모에서 "Four.meme 프로필 임베드" 시나리오 보여줄 수 있음
- [ ] API 문서가 존재함

---

### TF-05. [P1] Token Launch Creator Trait — Four.meme 토큰 런칭 연동
**Estimate:** 1d
**Depends on:** data-adapter, state-machine

#### 목표
유저가 Four.meme에서 토큰을 **런칭(생성)**하면 Soul Core에 특별한 "Creator" trait가 부여된다. 거래만 추적하는 게 아니라 **토큰 생성 행위**까지 연동해서, Four.meme 핵심 기능(토큰 런칭)과 직접 연결.

#### 작업
- [ ] Four.meme Factory/Deployer 컨트랙트 주소 확인 및 상수 등록
- [ ] data-adapter에 `token_created` 이벤트 타입 추가
  - Four.meme Factory 컨트랙트의 `TokenCreated` 또는 유사 이벤트 로그 파싱
- [ ] normalizer에 `token_created` 이벤트 정규화 로직 추가
- [ ] scoring engine: 토큰 런칭 횟수를 별도 필드로 기록
- [ ] state-machine: `token_created` 이벤트 핸들러 추가
  - 첫 런칭 → `creatorBadge: true`, mood 변경
  - 런칭한 토큰이 성공(거래량 일정 이상) → "Kingmaker" 특수 trait
  - 런칭한 토큰이 실패(0으로 수렴) → "Fallen Creator" scar
- [ ] 새 trait 에셋: `creator_badge.svg`, `kingmaker_crown.svg`, `fallen_creator_mark.svg`
- [ ] Monster Room에 "Creator" 섹션: 런칭한 토큰 리스트 + 결과

#### 왜 중요
Four.meme의 핵심 기능은 **토큰 런칭**이다. 거래 추적만 하면 DEX 분석 도구와 다를 바 없다. 토큰 런칭까지 캐릭터에 반영하면 **"Four.meme만의 정체성 엔진"**이 된다. 다른 DEX에서는 재현 불가능.

#### AC
- [ ] Four.meme에서 토큰 생성한 지갑에 Creator badge가 부여됨
- [ ] Creator 이벤트가 mutation diary에 기록됨
- [ ] 토큰 런칭 성공/실패에 따른 trait 분기가 동작함

---

### TF-06. [P0] 발표 내러티브 Four.meme 중심 재구성
**Estimate:** 0.25d
**Depends on:** TF-01 ~ TF-04

#### 목표
데모 발표의 전체 스토리라인을 "지갑 분석 도구" 관점에서 **"Four.meme 리텐션 엔진"** 관점으로 재구성한다.

#### 작업
- [ ] 발표 오프닝 멘트 확정:
  > "Four.meme is where meme tokens are born. DegenBorn is where meme traders are born."
- [ ] 데모 흐름에 Four.meme 연결점 3개 이상 명시적 삽입:
  1. "이 몬스터는 Four.meme 거래 데이터로 태어났습니다"
  2. "Four.meme에서 거래할수록 몬스터가 진화합니다"
  3. "공유할 때마다 Four.meme 브랜드가 함께 노출됩니다"
- [ ] Practical Value 슬라이드/화면: "Four.meme에게 주는 가치"
  - 리텐션: 거래 = 캐릭터 성장 → 더 많이 거래
  - UGC: 몬스터 카드 공유 → Four.meme 브랜드 확산
  - 유저 프로필: Loyalty Score → 충성 유저 식별 가능
- [ ] 위젯 API 데모 장면: "이렇게 Four.meme에 임베드 가능합니다"
- [ ] Replay Mode 시나리오에 Four.meme 연결점 반영

#### AC
- [ ] 발표 2분 안에 Four.meme 언급이 3회 이상
- [ ] "Four.meme에게 주는 가치"가 1장으로 요약됨
- [ ] 데모에서 위젯 API 장면 포함

---

## TIER F 실행 우선순위

| 태스크 | 난이도 | 임팩트 | 순서 |
|--------|--------|--------|------|
| TF-01 브랜딩 | 하 | 최고 | **즉시** — 30분이면 끝나고 효과 극대 |
| TF-03 리턴 루프 | 하 | 최고 | **즉시** — CTA 텍스트 수정 수준 |
| TF-06 발표 내러티브 | 하 | 최고 | **즉시** — 문서/데모 구성 |
| TF-04 위젯 API | 중 | 높음 | **D-7 전** — 발표에서 한 장면 보여주면 강력 |
| TF-02 Loyalty Score | 중 | 높음 | **D-7 전** — 차별화 핵심 지표 |
| TF-05 Creator Trait | 중-상 | 높음 | **D-5 전** — P1이지만 있으면 킬러 |

---

## TIER 0: 밈 바이럴리티 핵심 (퍼지는 구조)

> 이 티어의 목표: **프로덕트 바깥에서 보이는 것만으로 사람이 들어오게 만든다.**

### T0-01. OG 이미지를 "밈 카드"로 재설계

- **현재:** `/api/og/[wallet]`이 존재하지만 단순 메타데이터 수준
- **문제:** X/Discord에 링크 올리면 기본 카드가 뜨는데, 이게 눈에 띄지 않으면 아무도 안 클릭한다
- **수정:**
  - OG 이미지를 **밈 형식**으로 렌더링: 캐릭터 + 아키타입 이름 + 대표 대사 1줄 + DNA 레이더 차트 미니
  - "나는 Rug Necromancer다" 같은 선언형 한 줄이 이미지 안에 있어야 한다
  - 배경색을 아키타입별로 다르게 (이미 ARCHETYPE_COLORS 있음)
  - 예시: Ice Whale 카드는 빙하 블루 배경 + "I don't trade. I wait. Then I destroy." 텍스트
- **파일:** `apps/web/src/app/api/og/[wallet]/route.tsx` — satori/vercel OG로 서버사이드 렌더
- **AC:**
  - [ ] X에 /m/{wallet} 링크 붙이면 밈 카드가 뜬다
  - [ ] 아키타입별 배경색 + 대사가 다르다
  - [ ] 캐릭터 이미지(또는 SVG placeholder)가 포함된다

### T0-02. "What Kind of Degen Are You?" 퀴즈 → 공유 최적화

- **현재:** `/quiz` 페이지 존재 (5개 질문 → 아키타입 분류)
- **문제:** 퀴즈 결과가 페이지 안에서만 보인다. 공유 가능한 카드가 없다
- **수정:**
  - 퀴즈 결과 페이지에 **즉시 공유 가능한 결과 카드** 추가
  - "I'm a Rug Necromancer. What are you?" 형태의 공유 텍스트
  - 결과 URL: `/quiz/result?type=rug_necromancer&scores=82,34,76,41,91` — OG 이미지가 결과 카드
  - 카드 하단에 "Find yours → degenborn.xyz/quiz" CTA
  - X Share Intent + 클립보드 복사
- **왜 중요:** BuzzFeed 스타일 성격 퀴즈는 밈코인 커뮤니티에서 가장 잘 퍼지는 포맷이다. 지갑 연결 없이도 진입 가능 → 퍼널 상단 확장
- **AC:**
  - [ ] 퀴즈 결과에 공유 카드 (OG image) 생성
  - [ ] X 공유 시 "I'm a [Archetype]. What degen are you?" 텍스트
  - [ ] 결과 URL이 고유하고 OG 이미지가 결과를 반영

### T0-03. 1-Click 공유 플로우: Monster Room → X 포스트

- **현재:** Share 탭에 Trading Card + Caption 있지만, 실제 공유까지의 마찰이 크다
- **문제:** 유저가 캡션 복사 → X 열기 → 붙여넣기 → 이미지 따로 다운 → 첨부 → 포스트. 이건 안 한다.
- **수정:**
  - "Share to X" 버튼 하나로:
    1. Trading Card 이미지를 자동 생성 (html2canvas 또는 서버사이드)
    2. X Web Intent에 텍스트 + URL 자동 세팅
    3. URL에 OG 이미지가 자동으로 붙으므로 이미지 첨부 불필요
  - 캡션은 아키타입별 템플릿에서 자동 생성 (이미 있음)
  - **핵심:** 버튼 하나 누르면 3초 안에 X 포스트 창이 뜬다
- **AC:**
  - [ ] "Share to X" 버튼 1개로 텍스트 + OG URL 포함 트윗 창 열림
  - [ ] 공유 URL의 OG 이미지가 Trading Card 수준의 비주얼

### T0-04. 도전장(Challenge Link) 바이럴 루프 강화

- **현재:** `/compare?a={wallet}` + SummoningBanner 존재
- **문제:** 도전 플로우가 약하다. "내가 Rug Necromancer인데, 넌 뭔데?" 느낌이 안 난다
- **수정:**
  - 도전장 URL: `/challenge/{from_wallet}` → 전용 랜딩
  - "0xrugN...0001 has challenged you. Are you brave enough?" 헤더
  - 도전자의 캐릭터 카드가 먼저 보이고, "Connect Your Wallet to Accept" CTA
  - 수락하면 → birth → 결과 비교 or battle 자동 이동
  - 도전장 OG 이미지: "⚔ A Rug Necromancer is calling you out"
- **왜 중요:** 1:1 도전은 밈코인 커뮤니티의 핵심 감정(경쟁, flex, cope)을 건드린다. 한 명이 공유하면 최소 1명이 반응하는 구조.
- **AC:**
  - [ ] /challenge/{wallet} 전용 랜딩 존재
  - [ ] OG 이미지에 도전자 캐릭터 + 도발 문구
  - [ ] CTA 클릭 → birth → battle 자동 플로우

---

## TIER 1: 밈 콘텐츠 품질 (안에서 더 재밌게)

> 이 티어의 목표: **프로덕트 안에서의 경험이 스크린샷/녹화할 만큼 재밌다.**

### T1-01. Birth Sequence를 "reveal 영상"급으로

- **현재:** Birth는 5단계(Scan → DNA → Archetype → Genesis → Mint)로 구성. Scan이 하드코딩된 문자열 애니메이션.
- **문제:** 가장 공유 가능한 순간(아키타입 공개)이 시각적으로 약하다
- **수정:**
  - Archetype Reveal에 **극적 연출 추가:**
    - 화면 전체가 아키타입 컬러로 플래시
    - 대표 대사가 타이프라이터로 나타남
    - 짧은 SFX (Web Audio oscillator → 좀 더 극적인 톤)
    - 1-2초 서스펜스 후 이름 공개
  - "Record This Moment" 힌트 표시 → 유저가 화면 녹화하도록 유도
  - Birth 완료 후 자동으로 share intent 준비
- **AC:**
  - [ ] Archetype reveal에 풀스크린 플래시 + 서스펜스 딜레이
  - [ ] 대표 대사 타이프라이터 연출
  - [ ] Birth 완료 후 "Share Your Birth" CTA

### T1-02. 로스트(Roast) 카드를 공유 가능한 포맷으로

- **현재:** `/api/roast`가 LLM으로 3문단 로스트 생성, BrutalRoastCard 컴포넌트 존재
- **문제:** 로스트가 텍스트로만 존재. 밈으로 퍼지려면 **이미지 포맷**이어야 한다
- **수정:**
  - 로스트 결과를 "Roast Certificate" 이미지로 렌더링
  - 디자인: 검은 배경 + 빨간 텍스트 + 캐릭터 + "BRUTALLY ROASTED" 스탬프
  - 하단에 DNA 요약 + "This degen was roasted by DegenBorn"
  - 1-click X 공유: "I just got roasted by my own wallet data 💀"
- **왜 중요:** 로스트는 밈코인 커뮤니티에서 가장 인기 있는 콘텐츠 유형 중 하나. 자기비하 + 유머 = 최고의 공유성.
- **AC:**
  - [ ] 로스트 결과를 이미지 카드로 렌더링
  - [ ] X 공유 1-click
  - [ ] "Get Roasted" CTA가 랜딩에서 접근 가능

### T1-03. "Daily Horoscope" 알림 + 공유 루프

- **현재:** `/horoscope/[wallet]` 존재. 매일 다른 결과 (deterministic).
- **문제:** 유저가 매일 들어올 이유가 없다. 호로스코프는 **습관형 콘텐츠**인데 리마인더가 없다
- **수정:**
  - 호로스코프 카드를 이미지로 렌더링 (OG 이미지로)
  - 매일 다른 URL → 매일 다른 OG 이미지
  - Monster Room에 "Today's Horoscope" 위젯 (접혀 있다가 클릭하면 펼침)
  - "Lucky Trait: 🔥 revenge aura" 같은 게 Monster Room 상단에 항상 보임
  - 공유 텍스트: "Today's degen horoscope: [fortune]. Lucky trait: [trait]"
- **AC:**
  - [ ] Monster Room에 일일 호로스코프 위젯
  - [ ] 호로스코프 카드 이미지 렌더링
  - [ ] 공유 시 일자별 고유 OG 이미지

### T1-04. Meme Studio 템플릿 UX 개선

- **현재:** 10개 SVG 템플릿. 캐릭터 오버레이 + 텍스트 슬롯. 다운로드 가능.
- **문제:**
  1. 템플릿 미리보기가 작아서 뭐가 뭔지 모름
  2. 텍스트 입력이 기계적 (label: "Top text", "Bottom text")
  3. 완성된 밈을 바로 공유할 수 없음
- **수정:**
  - 템플릿 선택 시 대형 프리뷰 (아키타입 기반 추천 순서는 이미 있음)
  - 텍스트 슬롯에 **구체적인 예시** 기본 세팅 (dialogue bank에서 가져오는 건 있는데, 더 밈적인 예시 필요)
  - "Randomize Text" 버튼 — 누를 때마다 dialogue bank에서 랜덤 조합
  - 완성 후 "Post to X" 1-click
  - **신규 템플릿 3-5개 추가** (아래 T1-05)
- **AC:**
  - [ ] 템플릿 대형 프리뷰
  - [ ] "Randomize" 버튼
  - [ ] 완성 → X 공유 1-click

### T1-05. 밈 템플릿 추가 — 크립토 네이티브

현재 10개 템플릿은 범용 밈(This is Fine, Stonks, Galaxy Brain 등). 크립토/밈코인 특화 템플릿이 필요하다:

1. **"Bought the Dip / It Dipped More"** — 2-panel, 위는 hopium, 아래는 절망
2. **"Nobody: / My Portfolio:"** — Nobody 밈 포맷, 포트폴리오 그래프 하락
3. **"I'm in this photo and I don't like it"** — 캐릭터가 차트 앞에 서 있음
4. **"Same Energy"** — 캐릭터 vs 유명 밈 대비 (빈 슬롯)
5. **"Rug Pull Stages of Grief"** — 5단계 감정 (denial → anger → bargaining → depression → acceptance). 각 단계에 캐릭터 표정 변화

- **AC:**
  - [ ] 최소 3개 신규 밈 템플릿 추가
  - [ ] 각 템플릿에 적합한 아키타입 매핑

### T1-06. 타로 카드 비주얼 + 공유

- **현재:** 22장 Major Arcana 존재. 텍스트 기반.
- **문제:** 타로가 공유 가능하려면 **카드 비주얼**이 있어야 한다
- **수정:**
  - 각 카드에 SVG 기반 비주얼 (심볼 + 배경색 + 카드 프레임)
  - "This week's card: The Devil's Rug 😈" OG 이미지
  - 뒤집힌 카드 드라마틱 애니메이션 (카드 뒤집기 모션)
  - X 공유: "My weekly tarot: [카드 이름]. [meaning]"
- **AC:**
  - [ ] 타로 카드 SVG 비주얼 (최소 5장)
  - [ ] 카드 뒤집기 애니메이션
  - [ ] 공유 가능한 OG 이미지

---

## TIER 2: 리텐션 + 커뮤니티 (돌아올 이유)

> 이 티어의 목표: **한 번 온 유저가 계속 돌아오고, 다른 사람과 상호작용한다.**

### T2-01. Monster Room 상태 영속화

- **현재:** Monster Room이 매번 Level 1에서 시작. 이전 진화 미반영.
- **영향:** 유저가 "내 캐릭터가 성장한다"를 느끼지 못함
- **수정:**
  - 최소: diary entries를 replay하여 state 재구성
  - 권장: Vercel KV / Upstash Redis로 CharacterState 영속
  - profile-store에 state 포함하여 저장
- **AC:**
  - [ ] 같은 지갑으로 재방문 시 이전 레벨/무드/트레이트 유지
  - [ ] Mutation diary가 누적됨

### T2-02. "Weekly Flex" — 주간 자동 리캡 카드

- **현재:** WeeklyRecapModal 존재하지만 단순 텍스트
- **수정:**
  - 주간 리캡을 **공유 가능한 카드**로 만들기
  - "This week: +2 crowns, 1 rug survived, level 3→5"
  - 카드 디자인: 주간 변화 시각화 (before/after)
  - 매주 월요일 접속 시 자동 팝업 + "Share Your Week" CTA
- **왜 중요:** 습관형 콘텐츠. 매주 새로운 공유 가능한 콘텐츠가 자동 생성된다.
- **AC:**
  - [ ] 주간 리캡 카드 이미지 생성
  - [ ] 월요일 자동 팝업
  - [ ] X 공유 1-click

### T2-03. Gallery를 "Leaderboard"로 업그레이드

- **현재:** Gallery는 분석된 몬스터 목록. 필터/정렬 있음.
- **문제:** 구경만 할 수 있고 상호작용이 없다
- **수정:**
  - **랭킹 시스템:** Level, Prestige, Survival Streak, Crown Count별 리더보드
  - **"Most Rugged" 보드:** Corruption + Scar 기반 (역설적 자랑)
  - 각 몬스터에 "Challenge" 버튼 → 바로 battle 진입
  - "Vote for Scariest" 같은 커뮤니티 투표 (인메모리 카운터라도)
- **AC:**
  - [ ] 최소 3가지 기준 리더보드
  - [ ] 각 몬스터에 Challenge 버튼
  - [ ] "Most Rugged" 역설적 리더보드

### T2-04. Confession Booth(고해성사) 캐릭터 개성 강화

- **현재:** `/confession/[wallet]` — LLM 기반 대화, 아키타입별 응답
- **문제:** 대화가 일반적. 캐릭터 개성이 약하다.
- **수정:**
  - LLM 프롬프트에 아키타입별 **구체적 말투 규칙** 추가
    - Mad Gambler: 짧은 문장, 느낌표 많이, 자기 얘기로 돌림
    - Ice Whale: 마침표. 짧게. 감정 없이. 결론만.
    - Rug Necromancer: 은유 많이, "죽음"/"부활" 비유
    - Ghost Bagholder: 말끝 흐리기... 오래 걸리는 대답... 무기력
  - **대화 기록을 공유 가능하게** — 인상적인 응답을 카드로 만들어 공유
  - "My soul said:" + 한 줄 → X 공유
- **AC:**
  - [ ] 아키타입별 말투 규칙 프롬프트 강화
  - [ ] 개별 응답을 이미지 카드로 만들기
  - [ ] "Share This Line" 버튼

### T2-05. Sticker Pack 내보내기 최적화

- **현재:** 36개 스티커 (6 아키타입 × 6 표정). SVG 기반.
- **문제:** 스티커가 앱 안에만 있다. 텔레그램/디스코드에서 쓸 수 없다
- **수정:**
  - PNG 다운로드 + "Copy to Clipboard" 버튼 (이미 있는지 확인 필요)
  - **텔레그램 스티커팩 내보내기** 포맷 (WebP, 512x512)
  - 디스코드 이모지 크기 (128x128 PNG)
  - 각 스티커에 아키타입별 대사 텍스트 오버레이
- **AC:**
  - [ ] WebP 512x512 다운로드 (텔레그램용)
  - [ ] PNG 128x128 다운로드 (디스코드용)
  - [ ] 대사 텍스트 포함 버전

---

## TIER 3: 프로덕트 완성도 (해커톤 → 실제 제품)

> 이 티어의 목표: **"데모"에서 "쓸 수 있는 제품"으로.**

### T3-01. 데이터 소스 투명성 UI

- **현재:** API가 data_source 반환하지만 UI에서 충분히 표시 안 됨
- **수정:**
  - Monster Room 상단에 데이터 배지: 🟢 Live / 🟡 Fixture / 🔴 Demo
  - Demo 모드일 때: "This is demo data. Connect a real wallet for your true DNA."
  - Fixture 모드일 때: "Sample wallet — not real on-chain data."
- **AC:**
  - [ ] 데이터 소스 배지가 항상 보인다
  - [ ] Demo/Fixture일 때 명확한 안내 문구

### T3-02. Genesis 이미지 Birth에서 호출

- **현재:** Birth 페이지가 `/api/genesis-image`를 호출하지 않음. 항상 placeholder SVG.
- **수정:**
  - Birth Genesis 단계에서 이미지 생성 API 호출
  - DALL-E key 없으면 placeholder, 있으면 실제 이미지
  - 생성 중 로딩 애니메이션 ("Your soul is taking form...")
- **AC:**
  - [ ] OPENAI_API_KEY 있으면 실제 이미지 생성
  - [ ] 생성 중 로딩 상태 표시
  - [ ] 생성된 이미지가 Monster Room에서도 사용됨

### T3-03. Share Card가 실제 이미지 사용

- **현재:** `/api/share`가 항상 placeholder SVG. 생성된 이미지 무시.
- **수정:**
  - profile store에서 image_url 확인
  - DALL-E 이미지가 있으면 그것 사용
  - 없으면 아키타입 placeholder (현재 동작)
- **AC:**
  - [ ] 생성된 이미지가 share card에 반영
  - [ ] OG 이미지에도 실제 캐릭터 이미지 사용

### T3-04. 상태 머신에 실제 이벤트 데이터 반영

- **현재:** state-machine의 big_loss 캡션이 "Down ? USD", long_hold가 "? days held"
- **이미 수정됨:** event.payload에서 amount/duration 읽도록 변경
- **추가 필요:**
  - Mutation processor가 실제 amount/duration을 payload에 넣어야 함
  - analyze → state machine flow에서 실제 PnL 데이터가 payload로 전달
- **AC:**
  - [ ] big_loss 시 실제 USD 손실액 표시
  - [ ] long_hold 시 실제 보유 일수 표시

### T3-05. Overlay Renderer가 실제 합성 결과 반환

- **현재:** `getPreviewUrl`이 항상 base image만 반환
- **수정:**
  - Canvas 기반 trait overlay 합성
  - 합성 결과를 data URL로 캐시
  - Monster Room, Share Card, OG Image 모두에서 합성된 캐릭터 사용
- **AC:**
  - [ ] trait overlay가 시각적으로 반영됨
  - [ ] crown, zombie_eyes, bandage 등이 실제로 보임

---

## TIER 4: 밈 문화 심화 (커뮤니티 정체성)

> 이 티어의 목표: **DegenBorn 자체가 밈이 된다.**

### T4-01. "Degen Report Card" — 종합 성적표 카드

- **현재:** `/sheet/[wallet]`과 `/certificate/[wallet]` 존재하지만 활용 약함
- **수정:**
  - 학교 성적표/통지표 형식의 종합 카드
  - 과목: Aggression (F~S), Conviction (F~S), Chaos, Luck, Survival
  - 담임 코멘트: 아키타입별 한 줄 (예: "이 학생은 수업 시간에 차트만 봅니다")
  - "Parents' Signature: ___" (빈 칸) — 밈적 요소
  - 직인: "DegenBorn Academy — Est. 2024"
  - **이걸 공유하면 자연스럽게 밈이 된다**
- **AC:**
  - [ ] 성적표 이미지 카드 생성
  - [ ] 과목별 등급 (DNA → 등급 변환)
  - [ ] 담임 코멘트 아키타입별 차별화
  - [ ] X 공유 1-click

### T4-02. "Degen Zodiac" — 12궁도 × 6아키타입 매트릭스

- **현재:** Horoscope + Tarot 존재하지만 독자적 세계관이 약함
- **수정:**
  - 6 아키타입을 "Degen Zodiac Signs"으로 포지셔닝
  - 궁합표: "Mad Gambler × Ice Whale = 💀 Toxic Combo"
  - "Ask your friends: What's your degen sign?"
  - 각 조합에 한 줄 설명 (6×6 = 36 조합)
  - 궁합 결과를 공유 가능한 카드로
- **왜 중요:** "별자리 궁합"은 인류 역사상 가장 성공한 바이럴 포맷 중 하나다. 이걸 크립토 컨텍스트로 가져온다.
- **AC:**
  - [ ] 6×6 궁합표 데이터
  - [ ] /zodiac 페이지 — 두 아키타입 선택 → 궁합 결과
  - [ ] 궁합 카드 이미지 + X 공유

### T4-03. "Graveyard"를 진짜 문화 콘텐츠로

- **현재:** `/graveyard` — 하드코딩된 flatlined souls 리스트
- **문제:** Graveyard가 문화적 의미를 갖지 못하고 있다
- **수정:**
  - 실제 Ghost 상태(corruption 80+) 몬스터가 자동 등재
  - 각 묘비에 "Last Words" (마지막 dialogue)
  - "R.I.P. — This degen held $RUGTOKEN for 47 days"
  - 방문자가 "F" 누르면 카운터 증가 (인메모리)
  - "Pour One Out" 공유 버튼
  - 가끔 부활하는 영혼 (survival_streak > 0이면 묘비에 금 테두리)
- **AC:**
  - [ ] Ghost 상태 몬스터 자동 등재
  - [ ] "F to Pay Respects" 버튼
  - [ ] "Last Words" 표시
  - [ ] 부활한 영혼 골드 표시

### T4-04. "Wall of Shame" / "Hall of Fame" 듀얼 보드

- **새로운 콘텐츠:**
  - **Hall of Fame:** Level 7+, Prestige 70+, 3-Crown+ → 금색 카드
  - **Wall of Shame:** Corruption 80+, 5+ Scars, Ghost mood → 빨간 카드
  - 핵심 인사이트: 밈코인 커뮤니티에서 **"rekt된 것도 자랑**"이다
  - Wall of Shame에 올라가는 것도 일종의 성취 → 역설적 리텐션
  - 각 카드에 "이 디젠은 [stat] 때문에 여기에 있다" 한 줄
- **AC:**
  - [ ] /fame + /shame 또는 gallery 내 탭으로 구현
  - [ ] 자동 분류 기준 명확

### T4-05. Seasonal "Degen Season" 이벤트 프레임워크

- **새로운 콘텐츠:**
  - 매 시즌(월간 또는 격주) 테마 이벤트
  - 예시: "Rug Season" — 이 기간 동안 rug event에서 살아남으면 특별 badge
  - "Bull Run" — win streak 보너스 포인트
  - "Ghost Month" — 가장 오래 ghost 상태 유지한 지갑에게 명예
  - 시즌 종료 시 "Season Report" 카드 자동 생성
- **왜 중요:** 한정 시간 이벤트는 FOMO를 만들고, FOMO는 공유를 만든다.
- **AC:**
  - [ ] Season 데이터 구조 (시작/종료 시간, 테마, 보너스 조건)
  - [ ] 시즌 badge 시스템
  - [ ] 시즌 리포트 카드

---

## TIER 5: 기술 부채 해소 (견고한 기반)

> TIER 0-4를 안정적으로 지탱하기 위한 기술 기반.

### T5-01. DB 도입 (인메모리 → Postgres)

- 모든 인메모리 store를 Supabase/Neon Postgres로 이전
- wallet_profile, activity_event, mutation_event, generated_asset 테이블
- Vercel 서버리스 환경에서 상태 공유 가능

### T5-02. 이미지 영구 저장소

- DALL-E 이미지 → Vercel Blob / Cloudflare R2
- tokenURI에서 안정적 URL 제공
- OG 이미지 캐시

### T5-03. RPC Four.meme 플래그 수정

- normalizer.ts에서 `log.address` → `transaction.to` 비교로 변경
- Four.meme 라우터 주소와 올바르게 매칭

### T5-04. SoulCore approve/setApprovalForAll 차단

- Soulbound 토큰인데 approve가 작동하는 문제
- override하여 revert 처리

### T5-05. 테스트 커버리지 확대

- @degenborn/shared 단위 테스트 (badges, tier, lexicon, dialogue)
- Archetype classifier fallback 테스트
- Scoring engine pnl_delta=0 시나리오 테스트
- SoulCore burn 경로 테스트

---

## 우선순위 매트릭스

| 티어 | 임팩트 | 난이도 | 추천 순서 |
|------|--------|--------|-----------|
| **TF (Four.meme Symbiosis)** | **결정적** | **하-중** | **0순위** — 이게 없으면 수상 불가 |
| T0 (바이럴리티) | 최고 | 중 | 1순위 — 해커톤 심사에 직접 영향 |
| T1 (콘텐츠 품질) | 높음 | 중-하 | 2순위 — 데모 시연 품질 |
| T2 (리텐션) | 높음 | 중 | 3순위 — 제출 후 유저 유지 |
| T3 (완성도) | 중 | 하-중 | 4순위 — 기존 버그/가짜 데이터 수정 |
| T4 (문화 심화) | 중-높 | 중 | 5순위 — post-hackathon 차별화 |
| T5 (기술 부채) | 기반 | 중-높 | 병행 — 다른 티어 진행하면서 점진적 |

---

## 한 줄 요약

> **DegenBorn은 "Four.meme 데이터를 쓰는 프로젝트"가 아니라 "Four.meme을 더 재밌게 만드는 프로젝트"다.**
> **모든 공유에 Four.meme이 보이고, 모든 거래가 캐릭터를 바꾸고, 모든 바이럴이 Four.meme으로 돌아간다.**
> **We don't just use Four.meme data. We make Four.meme more fun to use.**
