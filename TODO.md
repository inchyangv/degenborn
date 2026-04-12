# TODO.md — DegenBorn 밈/프로덕트 개선안 v2

> 기준일: **2026-04-13** / 제출 마감: **2026-04-22 (D-9)**
> Role: Meme Expert + Product Planner
>
> v1 (2026-04-12)에서 Identity/Voice/Lexicon 레이어 뼈대가 완성됐다. 이제는 "잘 만든 페르소나 뷰어"가 아니라 **"밈이 되어 퍼지는 장난감"**으로 가야 한다.
> 신규 하드 시스템은 넣지 않는다. 기존 DNA/state/dialogue 위에 **공유 가치를 터뜨리는 얇은 레이어**만 쌓는다.

---

## 0. 현황 체크

### 0.1 v1 완료 (5 commits, 2026-04-12)

| ID | 제목 | 커밋 |
|---|---|---|
| T-BR-01 | Degen Lexicon — 브랜드 보이스/안전 필터 | `0b896e0` |
| T-ID-01 | 캐릭터 고유 이름 생성기 (6 × 50 pool) | `e7003e0` |
| T-ID-02 | 뱃지 시스템 (15 badges, state-derived) | `da8fc49` |
| T-VC-01 | 상태 변화 대사 (6 × 6 × EN/KO, 144 lines) | `075f20d` |
| T-SH-01 | Flex/Roast 듀얼 카드 | `e9bd710` |

### 0.2 v1에서 남은 것 (v2로 이월)

- [ ] **T-TB-01** Soul Sibling/Rival — v2 Invitation Layer로 재배치
- [ ] **T-TB-02** Wall of Souls — v2 Ritual Layer 부분 통합
- [ ] **T-ID-03** 희귀도/티어 — v2 Collectible Layer로 재배치
- [ ] **T-VC-02** 스티커 팩 — v2 후속 로드맵으로 강등
- [ ] **T-SH-02** Trading Card 포맷 — v2 T-COL-01으로 승격
- [ ] **T-SH-03** GIF 내보내기 — v2 후속 로드맵
- [ ] **T-RT-01** Graveyard — v2 T-EULO-01과 통합
- [ ] **T-PR-01** Replay 자막 — v2 그대로 유지
- [ ] **T-PR-02** Opening Shot — v2 그대로 유지
- [ ] **T-PR-03** Pitch Script — v2 그대로 유지 (D-2 필수)

---

## 1. 한 문장 진단 v2

**"뼈대는 탄탄하고 얼굴과 입이 생겼다. 이제 어깨 위에서 벌어지는 이야기가 필요하다."**

v1 기준으로 여전히 약한 5가지:

1. **소울은 생겼는데 매일 뭘 하는지가 없다.** 공유 모멘트가 민팅 1회에 몰려 있다. 평상시 공유 훅이 없다.
2. **개별 소울은 있지만 소울들 사이의 상호작용이 없다.** 상대가 있어야 소셜이 된다. 지금은 혼자 놀이.
3. **캐릭터는 대사는 하는데 스토리는 없다.** 출생 순간·죽음·복귀 같은 서사의 마디가 없다.
4. **"한 장의 카드"가 너무 한 종류다.** 디젠 문화는 trading card, certificate, eulogy, tarot, meme template 등 **여러 포맷을 동시에** 만들어낸다. 우리는 share card + flex/roast 두 장이다.
5. **첫 10초에 "당신도 해볼래?"라는 질문이 없다.** 관전자 동선은 있는데, **초대받는 느낌**이 없다.

이 5개를 각각 레이어로 묶어 v2 티켓으로 쪼갠다.

---

## 2. Top 5 빅 스윙 (10일 안에 2~3개만 해도 제출물이 한 단계 올라간다)

### 2.1 [P0] T-ROAST-01. Brutal LLM Roast Mode ⭐⭐⭐⭐⭐

**Why:** 디젠 문화에서 가장 공유되는 콘텐츠는 "가혹한 팩폭"이다. v1 Flex/Roast 카드는 "살짝 자학적"까지다. 진짜 로스트는 **더 잔인해야** 공유된다. AI가 데이터로 사람을 웃기게 까면, 그게 가장 순수한 디젠 바이럴이다.

**How:**
- 기존 Roast 카드에 "Go Brutal 🔥" 버튼 추가
- LLM에게 `archetype + DNA + state + 최악의 이벤트 3개`를 던지고 3문단 로스트를 요청
- 시스템 프롬프트:
  > "You are a brutally honest but funny roast comedian. Roast this wallet in 3 short paragraphs. Use degen slang: rekt, ngmi, cope, seethe, based. Be specific — reference their actual numbers. Make it sting but stay funny. No financial advice. No slurs."
- 단락 1: 데이터 기반 팩폭 (scar_count/corruption/luck 숫자 직접 언급)
- 단락 2: 비교/비하 ("평균 wallet보다 [metric]에서 뒤처짐" — 샘플 코퍼스 평균 기준)
- 단락 3: 탈출구 없는 마무리 ("cope해도 숫자는 안 바뀐다")
- 출력 후 `sanitizeLexicon()` 통과 강제 (이미 v1에 구현됨)
- 전용 공유 카드: 검은 배경, 빨간 타이포, 왼쪽에 캐릭터 sad face

**AC:**
- [ ] Roast 모드에서 "Go Brutal" 버튼 노출
- [ ] LLM 출력이 3단락으로 안정적으로 파싱됨
- [ ] 로스트 카드가 별도 PNG로 다운로드 가능 (`degenborn_<wallet>_brutal.png`)
- [ ] lexicon 금칙어 필터 통과 (자동 sanitize)
- [ ] 같은 wallet은 같은 날은 같은 로스트 (일일 seed)

**파일:**
- `apps/web/src/app/api/roast/route.ts` (신규)
- `apps/web/src/components/BrutalRoastCard.tsx` (신규)
- `packages/shared/src/prompts/roast.ts` (신규 — 프롬프트 템플릿)

---

### 2.2 [P0] T-CERT-01. Soul Birth Certificate ⭐⭐⭐⭐⭐

**Why:** "출생증명서" 포맷은 범용 밈 포맷이다. 결혼증명서, 졸업장, 입학증명서 — 공식 문서 포맷은 트위터에서 reliably 바이럴이 된다. 우리 데이터는 이걸 가장 재미있게 만들 수 있다. 한 장짜리 자기 완결 공유 자산.

**How:**
- `/certificate/[wallet]` 신규 페이지
- 빈티지 종이 텍스처 + 캘리그래피 폰트 (Google Fonts의 `Cinzel` 또는 `Cormorant`)
- 구조:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       CERTIFICATE OF SOUL BIRTH
     — DegenBorn × Four.meme —

     This document hereby certifies that

              {고유 이름}
             the {칭호}

     was awakened from wallet
     0xabc...def
     on the {N}th day of {month}, {year}

     under the archetype of
          {Archetype Profile Name}

     BLESSED WITH:
      ★ {badge 1}
      ★ {badge 2}
      ★ {badge 3}

     CURSED WITH:
      ☠ Low {weakest DNA axis}
      ☠ High {highest chaos/corruption}

     Witnessed by the DegenBorn Council
     Under the sigil of Four.meme

     [Archetype-colored wax seal SVG]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- 배경 색: wallet seed 기반 deterministic (gold / crimson / obsidian / moss / bone 5종)
- 서명 부분에 AI-generated ink blot + DegenBorn sigil
- 다운로드 PNG (html2canvas) + OG metadata 이미지
- `/m/[wallet]`에서 "View Certificate" 버튼

**AC:**
- [ ] 지갑당 고유한 certificate (이름·칭호·뱃지·색상 deterministic)
- [ ] 같은 지갑 재방문 시 동일 certificate
- [ ] PNG 다운로드 작동
- [ ] OG 이미지로도 쓸 수 있음 (2048x2048 이상)

**파일:**
- `apps/web/src/app/certificate/[wallet]/page.tsx`
- `apps/web/src/components/BirthCertificate.tsx`
- `apps/web/public/textures/parchment-*.png` (3장)

---

### 2.3 [P0] T-HORO-01. Daily Soul Horoscope ⭐⭐⭐⭐⭐

**Why:** 매일 돌아올 이유가 필요하다. "오늘의 운세"는 한국/중국권에서 검증된 포맷이고 트위터에서도 자주 돈다. 날짜 기반 deterministic이면 조작 불가능하고, 매일 새로운 콘텐츠가 자동으로 나온다. 제로 AI 비용으로 retention loop 완성.

**How:**
- Seed = `djb2(wallet + YYYY-MM-DD)` — 하루 단위로 시드 바뀜
- 구성요소 (template bank에서 seed로 pick):
  1. **Today's Mood** (6 moods rotate)
  2. **Lucky Trait** (5 traits)
  3. **Avoid** (archetype-specific 경고 한 줄)
  4. **Embrace** (archetype-specific 격려 한 줄)
  5. **Fortune Line** (템플릿에서 picked 한 줄)
- 표시 위치:
  - Monster Room 상단에 접을 수 있는 "Today's Reading" 배너
  - 독립 `/horoscope?wallet=0x...` 페이지 (공유용)
- 6 archetype × 5 필드 × 최소 10 템플릿 = 300라인 (LLM 아님, 정적 bank)
- 포맷 예시:
```
━━━━━━━━━━━━━━━━━━━━━━━━━
  Today for Rug Necromancers
  2026-04-13

  MOOD     · REVENGE
  LUCKY    · 🔥 revenge aura
  AVOID    · Averaging down on the 4th rug
  EMBRACE  · The scar is the receipt
  FORTUNE  · "Your chaos is finally your edge today"
━━━━━━━━━━━━━━━━━━━━━━━━━
```
- 공유 이미지: 세로 4:5, 검은 배경, archetype 색 글리프

**AC:**
- [ ] 같은 날짜는 같은 운세, 다음날은 다른 운세
- [ ] 6 archetype 모두 필드당 최소 10개 템플릿
- [ ] 공유 PNG 생성 가능
- [ ] Monster Room에 자동 삽입
- [ ] 단위 테스트: 5일 × 3 wallet = 15 케이스, 모두 고유

**파일:**
- `packages/shared/src/narrative/horoscope.ts` (신규 — 템플릿 bank)
- `apps/web/src/app/horoscope/page.tsx`
- `apps/web/src/components/DailyHoroscope.tsx`
- `apps/web/src/__tests__/horoscope.test.ts`

---

### 2.4 [P0] T-MEME-01. Meme Template Studio ⭐⭐⭐⭐

**Why:** Doge, Pepe, Chad — 이들이 퍼진 이유는 **같은 캐릭터가 수십 개 밈 템플릿에 등장했기 때문**이다. 우리도 한 캐릭터를 만들어놓고 10개 템플릿에 재활용하면 공유 자산이 10배가 된다. 밈 경제의 기본 원리.

**How:**
- `/studio?wallet=0x...` 신규 페이지
- 10개 고정 템플릿 (SVG 기반, 캐릭터만 overlay):

| # | 템플릿 | archetype 매핑 | 텍스트 소스 |
|---|---|---|---|
| 1 | This is fine (burning room) | 모든 archetype, 특히 despair | dialogue bank big_loss |
| 2 | Stonks / Not Stonks | euphoria / despair | dialogue first_win / big_loss |
| 3 | Galaxy Brain (4단) | 모든 archetype | dialogue 4개 pick |
| 4 | Gigachad (포인팅) | mad_gambler / sniper_jester | dialogue first_win |
| 5 | Wojak Crying | ghost_bagholder / diamond_cultist | dialogue big_loss |
| 6 | Distracted Boyfriend | sniper_jester | archetype 비교 유머 |
| 7 | "They don't know..." | ice_whale / rug_necromancer | dialogue idle |
| 8 | Expanding Brain | 모든 archetype | level_up dialogue |
| 9 | Spiderman Pointing | rival pair | Sibling/Rival 통합 |
| 10 | Is this a pigeon? | sniper_jester / ghost_bagholder | confusion line |

- 캐릭터 overlay: 기존 `CharacterDisplay.tsx`를 150x150 PNG로 렌더 → SVG foreignObject로 합성
- 1-click "Copy to clipboard" + "Download PNG"
- 텍스트 자동 선택 (dialogue bank) + 수동 override 입력창

**AC:**
- [ ] 10개 이상 템플릿 작동
- [ ] 캐릭터가 모든 템플릿에 자연스럽게 합성
- [ ] 텍스트 자동 선택 + 수동 편집 가능
- [ ] PNG 다운로드 + 클립보드 복사

**파일:**
- `apps/web/src/app/studio/page.tsx`
- `apps/web/src/components/MemeTemplateStudio.tsx`
- `apps/web/src/lib/meme-templates.ts`
- `apps/web/public/memes/*.svg` (10개 SVG)

---

### 2.5 [P0] T-EULO-01. Flatline Eulogy / Autopsy Report ⭐⭐⭐⭐

**Why:** "죽음"은 디젠 유머의 정수다. 수많은 wallet이 flatline 상태고, 이들을 **기념하는 형식**을 만들면 두 가지가 동시에 열린다: (1) 자기 소울이 "아직 살아있는지" 확인하러 오는 재방문 훅, (2) 타인의 eulogy를 구경하는 관전 훅. 어두운 유머가 순수 공유를 만든다.

**How:**
- Flatline 판정: `last_active_at` 기준 30일 이상 무활동
- 데이터: `packages/data-adapter`가 이미 `event.timestamp`를 수집 → 마지막 이벤트 기준
- `/eulogy/[wallet]` 신규 페이지
- 구조:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         IN MEMORIAM

         {고유 이름}
         the {칭호}

         born {birth_date}
         flatlined {last_active_date}
         {days_alive}일을 살았다.

         FINAL DNA
         AGG __  CON __  CHA __  LCK __  SRV __

         FINAL STATE
         Level {lv} · {mood} · {archetype}

         CAUSE OF FLATLINE
         {LLM-generated, 1 sentence:
          "pulled too many rugs",
          "conviction finally broke",
          "chaos exceeded survival"}

         LAST WORDS
         "{dialogue from last active state}"

         Rest in chaos.
         — The DegenBorn Council
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
- 자동으로 `/graveyard` 페이지에도 리스팅 (v1 T-RT-01 통합)
- 부활 감지 시 페이지에 "RESURRECTED" stamp overlay
- eulogy도 공유 이미지로

**AC:**
- [ ] 30일 inactive 판정 로직 (`deriveFlatlineStatus(events): boolean`)
- [ ] eulogy 페이지 렌더
- [ ] `/graveyard` 페이지에 flatline wallet 그리드
- [ ] 재활성 감지 시 resurrection stamp
- [ ] fixture 1개는 flatline 상태로 준비 (데모용)

**파일:**
- `apps/web/src/app/eulogy/[wallet]/page.tsx`
- `apps/web/src/app/graveyard/page.tsx`
- `apps/web/src/components/EulogyCard.tsx`
- `apps/web/src/lib/flatline.ts`

---

## 3. Drama Layer — 소울에게 이야기 주기

### 3.1 [P1] T-DRMA-01. Soul Battle (1v1 Deterministic PvP)

**Why:** 포켓몬식 타입 상성 매칭은 언제나 통한다. 두 소울이 싸우는 포맷은 (1) 싸움 자체의 드라마, (2) 결과 공유 가능성, (3) 다른 wallet을 찾아야 하는 **검색 행위**를 만든다.

**How:**
- 입력: 2개 wallet address
- 매치업 규칙 (deterministic):
  - `aggression > conviction` → 공격 우위
  - `survival > chaos` → 방어 우위
  - archetype 상성 테이블 (rock-paper-scissors 6-way):
    - mad_gambler → counters → diamond_cultist
    - ice_whale → counters → mad_gambler
    - rug_necromancer → counters → ice_whale
    - sniper_jester → counters → rug_necromancer
    - ghost_bagholder → counters → sniper_jester
    - diamond_cultist → counters → ghost_bagholder
- 전투 로그: 3-round, 각 라운드마다 dialogue bank에서 대사 pick
- 결과 화면: VS 포맷, 승자에 crown overlay, 패자에 scar overlay
- 공유 카드: 가로 16:9, 두 캐릭터 마주보기

**AC:**
- [ ] `/battle?a=0x...&b=0x...` 페이지
- [ ] 결과는 deterministic (같은 pair는 항상 같은 결과)
- [ ] 3-round 전투 로그 생성
- [ ] PNG 공유 카드

**파일:**
- `apps/web/src/app/battle/page.tsx`
- `apps/web/src/lib/battle-engine.ts`

---

### 3.2 [P1] T-DRMA-02. Origin Story Generator (LLM longform)

**Why:** 이름 + 칭호 + 뱃지는 있는데, 이들이 어떻게 해서 생겼는지 이야기가 없다. 짧은 "나는 이렇게 태어났다" 1페이지 스토리가 있으면, 카드와 별도로 또 하나의 공유 자산이 된다.

**How:**
- LLM에 `(archetype, DNA, scar_count, crown_count, corruption, prestige)` 전달
- 3문단 원고, 각 100단어 이하, 1인칭 past tense
- 구조:
  1. 어디서 왔는가 (wallet origin)
  2. 어떻게 렉트 당했는가 (scar events 기반)
  3. 어떻게 지금이 됐는가 (current state)
- 아카이브 형식: 오래된 책 한 페이지 느낌 (serif 폰트, cream 배경)

**AC:**
- [ ] `/origin/[wallet]` 페이지
- [ ] 같은 wallet은 같은 story (cache)
- [ ] Lexicon 필터 통과

---

### 3.3 [P2] T-DRMA-03. Confession Booth (AI dialogue)

**Why:** 유저가 직접 자기 소울과 **대화**할 수 있으면, 상호작용이 깊어진다. Character.ai류 retention을 살짝 빌려온다.

**How:**
- `/confession?wallet=0x...` 신규 페이지
- 유저가 한 줄 텍스트 입력 → LLM이 wallet의 archetype 톤으로 1-3줄 응답
- archetype tone seed + dialogue bank few-shot
- 대화 로그는 저장하지 않음 (PROJECT §5 원칙 5)
- 특정 응답은 공유 카드로 떨굴 수 있음

**AC:**
- [ ] 텍스트 입출력
- [ ] Archetype 톤 유지
- [ ] 공유 가능 (단일 응답 기준)

---

### 3.4 [P2] T-DRMA-04. Soul RPG Character Sheet

**Why:** D&D 캐릭터 시트 포맷은 게이머/디젠 교집합에서 귀여움 + 소유감을 만든다. 기존 DNA를 STR/DEX/CON/INT/WIS/CHA에 매핑.

**How:**
- `/sheet/[wallet]` 페이지
- DNA axis → D&D stats 매핑:
  - Aggression → STR
  - Luck → DEX
  - Survival → CON
  - (archetype-based) → INT/WIS/CHA
- 장비 슬롯: badges 이름을 "장비"로 변환
- Alignment: archetype 기반 ("Chaotic Broke", "Lawful Bagheld", "Neutral Rekt")
- 인쇄 친화 흑백 버전 + 컬러 버전

**AC:**
- [ ] `/sheet/[wallet]` 렌더
- [ ] 6 stats 다 매핑
- [ ] 인쇄 CSS `@media print` 지원

---

## 4. Retention Layer — 매일 돌아오게 만들기

### 4.1 [P0] T-RET-01. Daily Delta Banner ("Your soul changed")

**Why:** 방문 자체에 의미가 없으면 안 돌아온다. "지난 방문 이후 바뀐 것"이 있으면 사람은 궁금해서 돌아온다. v1 SCENARIO S-08에 있으나 구현되지 않음.

**How:**
- `profile-store.ts`에 `last_viewed_at` + `last_snapshot_hash` 저장
- 방문 시 현재 state와 비교
- 변화 감지 시 상단에 얇은 배너:
  - "Your soul has changed since you last visited."
  - "3 new mutations · 1 new badge · Level 2 → 3"
  - CTA: "See what happened" → diary 열림
- 변화 없으면 배너 숨김

**AC:**
- [ ] 변화 있을 때 배너 노출
- [ ] 클릭 시 diary 해당 섹션으로 scroll

---

### 4.2 [P1] T-RET-02. Tarot Draw (weekly)

**Why:** 일일 horoscope과 별개로, 주 1회 더 "무게 있는" 반복 hook. 타로 카드는 비주얼 강점이 크고 공유성이 높다.

**How:**
- 주 1회 (매주 월요일) 카드 1장 draw
- Seed = `djb2(wallet + YYYY-WW)` (ISO week)
- 22개 Major Arcana 재해석: "The Rugged One", "The Diamond Fool", "Wheel of Cope"
- 각 카드에 upright/reversed 의미
- 풀-페이지 세로 카드 포맷 (9:16, 공유 친화)

**AC:**
- [ ] 22개 카드 defined
- [ ] 주 단위 결정성
- [ ] 9:16 PNG 생성

---

### 4.3 [P2] T-RET-03. Weekly Recap Digest (in-app)

**Why:** 주간 단위 "지난 주 당신의 소울" 요약. 뉴스레터는 만들지 않는다 (자동 포스팅 금지 원칙). 앱 내에서만.

**How:**
- 매주 월요일 방문 시 "지난 주의 당신" 모달
- 변화량: scars +2, crowns +1, level 3→4
- 1문단 LLM 요약
- 공유 카드 생성 가능

---

## 5. Collectible Layer — 수집 문화 극대화

### 5.1 [P0] T-COL-01. Trading Card Pokemon Format (v1 T-SH-02 승격)

**Why:** v1에서 미구현. 포켓몬/유희왕 카드 포맷은 자기 완결적이라 저장·공유·수집이 자연스럽게 일어난다. **카드 한 장이 프로덕트를 설명**해야 한다.

**How:** (v1 TODO T-SH-02 스펙 그대로)
- 1:1 정사각 + 9:16 세로형
- 레이아웃: 이름/칭호 → 티어 → 일러스트 → 스탯바 → 대사 → 뱃지 → 해시태그
- 배경이 archetype 색조로 변함
- 우하단 QR코드 (`/m/[wallet]` 딥링크)

**AC:**
- [ ] 1:1, 9:16 둘 다
- [ ] QR 코드 작동
- [ ] 카드 한 장이 자기 완결적

---

### 5.2 [P1] T-COL-02. 희귀도/티어 (v1 T-ID-03 승격)

**Why:** v1에서 미구현. Common / Uncommon / Rare / Epic / Mythic. 밈은 희귀도에 반응한다. Trading card에 티어가 박히면 "내 카드 mythic임" 류 자랑이 가능해진다.

**How:**
- DNA 표준편차 + 극단값 수 기반 deterministic 티어 계산
- 티어 계산식:
  - `extremeCount = count(axis ≥ 80 || axis ≤ 20)`
  - `stdDev = std([a,c,ch,l,s])`
  - mythic: extremeCount ≥ 4 && stdDev ≥ 30
  - epic: extremeCount ≥ 3
  - rare: extremeCount ≥ 2 || stdDev ≥ 25
  - uncommon: extremeCount ≥ 1
  - common: default
- 카드 좌상단 보석 아이콘 + 티어 텍스트
- Gallery에서 티어 필터

**AC:**
- [ ] `computeTier(dna): BadgeRarity` 순수 함수
- [ ] Trading card에 티어 표기
- [ ] 단위 테스트 5+ (각 티어 경계)

---

### 5.3 [P2] T-COL-03. Sticker Pack (v1 T-VC-02)

P2로 강등. 시간 남으면. archetype당 6장.

---

## 6. Invitation Layer — 소울이 소울을 부르게

### 6.1 [P0] T-INV-01. Challenge Link ("{Name} challenges you")

**Why:** 지금 랜딩은 "Connect Wallet" + "Try Replay"만 있다. **다른 유저의 소울이 나를 초대하는 형태**가 없다. 친구가 공유한 링크로 들어가면 "Zagrok the Twice-Rugged has challenged you to reveal your soul"가 떠야 한다.

**How:**
- `/m/[wallet]` 공유 링크에 `?from=[wallet]` 쿼리 파라미터 추가
- 공유 시 자동으로 `?from=self` 부착
- 방문자가 from 파라미터를 가지고 들어오면:
  - 랜딩 상단에 "{fromName} the {fromTitle} has summoned you"
  - 해당 소울의 미니 카드 표시
  - Connect 버튼 강조: "Reveal your soul →"
- CTA 문구 A/B 준비: (1) summoning, (2) challenging, (3) inviting

**AC:**
- [ ] `?from=0x...` 파라미터 파싱
- [ ] 랜딩 상단 summoning 배너
- [ ] Share 카드에 자동 `?from=self` 부착
- [ ] 초대받은 페이지에 Replay 버튼이 초대자 기준으로 바뀜

---

### 6.2 [P1] T-INV-02. Sibling / Rival Discovery (v1 T-TB-01 재활성)

**Why:** v1에서 미구현. Compare 뷰는 있지만 자동 매칭이 없다. 이게 없으면 "누구랑 비교해?"라는 벽이 생긴다.

**How:** (v1 스펙 그대로)
- 샘플 코퍼스 내 코사인 유사도로 Sibling/Rival 자동 계산
- Monster Room 우측 "Your Kin" 패널
- 클릭 → Compare 뷰
- VS 포맷 공유 카드 지원

---

### 6.3 [P2] T-INV-03. Pre-reveal Quiz ("Which archetype are you?")

**Why:** 지갑 없는 구경꾼도 들어왔다가 "이거 나도 궁금한데"가 되어야 한다. Buzzfeed식 5문항 퀴즈 → 어느 archetype인지 대략 보여줌 → "지갑 연결하면 진짜 나를 볼 수 있다"로 유도.

**How:**
- 5문항 MCQ
- 각 답이 DNA axis에 +/- 가중치
- 결과는 approximate archetype + "connect wallet to see your real soul"
- 결과 자체도 공유 가능 (quiz result 카드)

---

## 7. Atmosphere / Micro UX

### 7.1 [P1] T-ATM-01. Monster Room Weather (mood-driven)

**Why:** v1에서 "만들고 싶었지만 안 한" 것. state.mood에 따라 배경이 바뀌면 Monster Room에 머무는 시간이 늘어난다.

**How:**
- 6 mood × CSS/SVG 배경:
  - neutral: 잔잔한 dot grid
  - euphoria: 황금 입자 상승 애니메이션
  - despair: 파란 회색 rain lines
  - revenge: 붉은 flicker + slow pulse
  - greed: 금색 scan lines
  - ghost: 짙은 안개 + 흐릿한 glow
- 모두 CSS animation으로 (무거운 라이브러리 금지)

**AC:**
- [ ] 6 mood 각각 다른 배경
- [ ] Monster Room에서 mood 변경 시 트랜지션 (500ms)

---

### 7.2 [P1] T-ATM-02. Awakening Ritual (mint theatrics)

**Why:** 민팅 순간이 너무 플랫하다. 발표의 하이라이트 중 하나인데 "버튼 눌렀더니 축하 팝업"이 전부면 드라마가 약하다.

**How:**
- Mint 버튼 → 전체 화면 dim
- 3초 동안 archetype reveal sequence:
  - 1s: 지갑 주소가 글리프로 깨지면서 사라짐
  - 1s: 캐릭터 실루엣이 dust에서 조립됨
  - 1s: 이름 + 칭호가 타이핑 효과로 등장
- 완료 후 confetti 대신 **차가운 silence + trait glow**
- 배경음 선택적 (v1 T-BR-02 SFX와 연동)

**AC:**
- [ ] 전체 화면 드라마 시퀀스 3초
- [ ] 완료 후 Monster Room으로 페이드
- [ ] Skip 버튼 (재방문자용)

---

### 7.3 [P2] T-ATM-03. Typing Effect on Dialogue

캐릭터 말풍선에 타이핑 애니메이션 (50ms/char). 작지만 체감이 크다.

---

## 8. Presentation Layer — 심사 대응 (v1에서 이월)

### 8.1 [P0] T-PR-01. Replay 자막 + 대사 (v1)

**Why:** 발표자가 말 안 해도 관객이 따라와야 한다. 2분 데모 영상에도 필요.

**How:**
- Replay 각 step에 2줄 자막: (상단) 무슨 일 / (하단) 캐릭터 대사
- v1 T-VC-01 dialogue bank 활용
- EN/KO 토글
- `?autoplay=1` 모드에서 dwell time 조절

---

### 8.2 [P0] T-PR-02. Opening Shot / Landing 히어로 (v1)

**Why:** 심사위원 첫 10초 집중 시간.

**How:**
- Landing 히어로 재디자인
- 첫 10초:
  1. 괴물 3-5개 순환 (gallery 썸네일)
  2. "Wallet → Persona DNA → Soul Core" 한 문장
  3. "Try Replay" 대형 CTA

---

### 8.3 [P0] T-PR-03. 2분 Pitch Script `docs/pitch.md` (v1)

**Why:** 스크립트 있으면 촬영 1시간. 없으면 하루.

**How:** 0:00-0:10 hook → 0:10-0:40 problem → 0:40-1:20 demo → 1:20-1:50 tech → 1:50-2:00 close. Replay step 번호와 1:1 매칭.

---

## 9. 안티패턴 — 절대 하지 말 것 (v1에서 유지 + 추가)

1. **자동 포스팅** — 유저가 직접 게시한다. 초대 링크도 유저가 직접 붙여넣는다.
2. **raw LLM 출력 노출** — 반드시 lexicon 필터 통과.
3. **하드 게이미피케이션** — XP바 인플레이션, 레벨링 광풍 금지. 상태값이 아니라 **서사**가 성장한다.
4. **거래 추천 / 투자 조언 톤** — 금지. Lexicon에 박혀 있음.
5. **실제 프로젝트/지갑 조롱** — 샘플에 실존 이름 금지.
6. **중앙화 랭킹 보드** — "누가 1등" 금지. Sibling/Rival까지만.
7. **풀 리렌더링 남발** — 대형 진화만 전체 재렌더.
8. **코퍼리트 톤** — "Enhance your Web3 experience" 류 금지.
9. **매일 푸시 알림** — 앱 내 배너까지만. 외부 푸시 NO.
10. **로스트 = 실제 공격** — Brutal Roast는 **데이터 기반 자학**이지, 유저 공격이 아니다. 슬러/인종/성별 조롱 절대 금지.
11. **"당신의 소울은 100x"** — 수익률 hype 금지.
12. **Certificate/Eulogy에 실명 · 실제 거래액 USD** — 추상화된 단위만.

---

## 10. 우선순위 — D-9 → D-0 역산

### D-9 ~ D-8 (4/13 ~ 4/14) — Top 5 빅 스윙 중 **2개** 완성
- [ ] T-HORO-01 Daily Horoscope (가장 빠름, 템플릿 bank + 페이지)
- [ ] T-CERT-01 Birth Certificate (비주얼 + html2canvas)

### D-7 ~ D-5 (4/15 ~ 4/17) — 나머지 빅 스윙 + Retention
- [ ] T-ROAST-01 Brutal Roast
- [ ] T-MEME-01 Meme Template Studio (4-5개 템플릿부터)
- [ ] T-RET-01 Daily Delta Banner
- [ ] T-INV-01 Challenge Link

### D-4 ~ D-3 (4/18 ~ 4/19) — Collectible + Drama
- [ ] T-COL-01 Trading Card
- [ ] T-COL-02 티어 시스템
- [ ] T-EULO-01 Flatline Eulogy (시간 되면)

### D-2 ~ D-1 (4/20 ~ 4/21) — 심사 대응 폴리싱
- [ ] T-PR-01 Replay 자막
- [ ] T-PR-02 Opening Shot
- [ ] T-PR-03 Pitch Script
- [ ] 데모 영상 촬영
- [ ] 제출 점검

### D-0 (4/22) — 제출
- 아침: 최종 빌드 + 배포 체크
- 오후: 제출

### 시간 남으면
- T-ATM-01 Weather, T-ATM-02 Awakening Ritual
- T-DRMA-01 Battle, T-DRMA-02 Origin Story
- T-INV-02 Sibling/Rival

### 후속 로드맵 (해커톤 이후)
- T-DRMA-03 Confession, T-DRMA-04 RPG Sheet
- T-RET-02 Tarot, T-RET-03 Weekly Recap
- T-COL-03 Sticker Pack
- T-INV-03 Pre-reveal Quiz
- T-ATM-03 Typing effect

---

## 11. 시간이 정말 없으면 — Top 3

이것 셋만 한다. 밈성을 가장 크게 올린다.

1. **T-HORO-01 Daily Horoscope** — 매일 돌아올 이유. 제로 AI 비용. 4시간.
2. **T-CERT-01 Birth Certificate** — 한 번 본 사람은 기억한다. 고유 공유 자산. 6시간.
3. **T-ROAST-01 Brutal Roast** — 디젠 문화 핵심. 가장 강력한 공유 트리거. 4시간.

이 셋은 합쳐서 하루 작업. 셋 다 배포 후 소셜 반응 측정.

---

## 12. 왜 이 셋이 결정적인가 (한 단락 요약)

DegenBorn은 지금 "잘 만든 페르소나 엔진"이다. 부족한 건 "매일 소울이 당신에게 말을 거는 감각"이다. **Horoscope**은 매일 다른 말을 걸고, **Certificate**은 한 번 발급되면 프로필 사진으로 박힌다, **Brutal Roast**는 친구에게 "내 걸 봐봐"라고 보낼 이유를 만든다. 이 셋이 붙으면, 하루에 세 번 DegenBorn을 떠올릴 이유가 생긴다. 그때부터 바이럴이 시작된다.

---

## 13. 기존 문서와의 관계

- **PROJECT.md**: 원칙 불변. Soul Core/Relic 분리, deterministic scoring, 자동 포스팅 금지, overlay 우선, raw conversation 저장 금지.
- **TICKET.md**: v1 티켓은 완료. v2 P0는 신규 티켓으로 승격.
- **SCENARIO.md**: S-08 (재방문) 구현 필요 — T-RET-01 Daily Delta Banner가 대응.
- **HACKATHON.md**: 첫 10초, 커뮤니티 투표 30%, 2분 영상 — T-PR-01~03이 대응.

---

*마지막 업데이트: 2026-04-13 (v2)*
*v1은 4/12에 5 tickets 완료. v2는 제출 D-9 기준 전략 재정비.*
