# DegenBorn Demo Script

> 데모 영상 촬영 / 라이브 시연용 스크립트.
> 총 소요 시간: ~3분 (영상), ~5분 (라이브).

---

## 사전 준비

```bash
# 로컬 서버 실행
cd apps/web && pnpm dev

# 브라우저: http://localhost:3000
# 화면: 1280x720 이상, 다크모드
# 녹화: QuickTime / OBS / ScreenStudio
```

- MetaMask 설치 + BSC Testnet 네트워크 추가 (라이브 데모용)
- 또는 Replay 모드로 MetaMask 없이 진행 가능
- 브라우저 탭 1개만 열어두기 (깔끔한 화면)

---

## 데모 플로우 개요

```
Landing -> Birth -> Monster Room -> Replay -> (보너스 페이지들)
  10s       40s      60s           60s           30s
```

| # | 화면 | 핵심 포인트 | 시간 |
|---|------|------------|------|
| 1 | Landing | 첫인상 + 컨셉 전달 | 10s |
| 2 | Birth (Scanning) | 지갑 분석 과정 | 15s |
| 3 | Birth (DNA + Archetype) | 5축 DNA + 아키타입 공개 | 15s |
| 4 | Birth (Genesis) | 캐릭터 탄생 | 10s |
| 5 | Monster Room | 전체 기능 탐색 | 60s |
| 6 | Replay Mode | 오프라인 데모 (Rug Necromancer arc) | 60s |
| 7 | 보너스 | Gallery, Graveyard, Share Card 등 | 30s |

---

## Scene 1: Landing (10s)

**화면**: `localhost:3000`

**보여줄 것**:
- DEGENBORN 타이틀 + "Your wallet has a personality" 태그라인
- 몬스터 캐러셀이 자동으로 돌아가는 모습 (5개 아키타입 순환)
- "Connect -> Analyze -> Meet Your Monster" 플로우 스텝
- 하단 "How it works" 3단계 카드

**말할 것**:
> "DegenBorn은 Four.meme 트레이딩 히스토리를 분석해서 살아있는 몬스터 캐릭터로 만들어주는 AI identity engine입니다."

**액션**: "Connect Wallet" 버튼 클릭 (또는 이미 연결된 상태에서 "AWAKEN MY MONSTER" 클릭)

---

## Scene 2: Birth - Scanning (15s)

**화면**: `/birth?wallet=0x...`

**보여줄 것**:
- 상단 Phase breadcrumb: `Scanning > DNA > Archetype > Genesis > Mint`
- 스캔 로그가 한 줄씩 타이핑되며 내려오는 애니메이션
  - "Connecting to BNB chain..."
  - "Fetching wallet history..."
  - "Found N Four.meme transactions"
  - "Computing Aggression / Conviction / Chaos / Luck / Survival..."
- 각 줄 앞에 체크마크가 하나씩 초록색으로 변하는 모습

**말할 것**:
> "지갑을 연결하면 BNB Chain에서 Four.meme 거래 내역을 읽어옵니다. LLM이 아니라 순수 수학으로 5개 축을 계산합니다."

**액션**: 자동으로 다음 Phase로 넘어감 (또는 "Continue" 클릭)

---

## Scene 3: Birth - DNA + Archetype (15s)

**화면**: 같은 `/birth` 페이지, Phase가 DNA -> Archetype으로 전환

**보여줄 것**:
- **DNA Panel**: 5개 바(Aggression, Conviction, Chaos, Luck, Survival)가 애니메이션으로 채워짐
- **Archetype Reveal**: 아키타입 이름 + 설명 + 태그라인 등장
  - 예: "Rug Necromancer" — "Your portfolio died. You didn't."

**말할 것**:
> "같은 지갑, 같은 이벤트면 항상 같은 점수가 나옵니다. Deterministic scoring — LLM hallucination 없습니다. 이 지갑은 Chaos 82, Survival 91이라 Rug Necromancer로 분류됩니다."

**액션**: 자동 전환 대기 또는 "Continue" 클릭

---

## Scene 4: Birth - Genesis (10s)

**화면**: Genesis Phase

**보여줄 것**:
- "Your soul is taking form..." 로딩 애니메이션
- AI가 생성한 캐릭터 이미지가 fade-in으로 등장
- 하단에 타이프라이터 효과로 인사: `"Hello. I am your Rug Necromancer._"`
- "Born from Four.meme trades" 메시지

**말할 것**:
> "AI가 아키타입과 DNA를 기반으로 고유 캐릭터를 생성합니다. 이 캐릭터는 거래할 때마다 진화합니다."

**액션**: "Share Your Birth" 버튼 잠깐 보여주고 -> Monster Room으로 이동

---

## Scene 5: Monster Room (60s)

**화면**: `/monster?wallet=0x...`

이 화면이 가장 기능이 많음. 탭별로 하나씩 보여줄 것.

### 5-1. Hero 영역 (10s)
- 대형 캐릭터 + 아키타입 이름 + 태그라인
- Weather Layer 배경 (mood에 따라 변함)
- Soul Core 카드: Level, Mood, Corruption, Prestige, XP bar
- Activity Breakdown: Buys / Sells / Dead tokens / Revivals
- Four.meme Loyalty Score (Bronze -> Legendary 등급)

**말할 것**:
> "Monster Room이 메인 대시보드입니다. 레벨, 무드, 부패도, 명성 — 전부 실제 거래 데이터에서 나옵니다. Loyalty Score는 Four.meme 생태계 기여도를 측정합니다."

### 5-2. DNA 탭 (5s)
- 5축 바 차트

### 5-3. Traits 탭 (10s)
- 활성화된 trait 목록: Crown, Zombie Eyes, Revenge Aura, Bandage 등
- 각 trait의 아이콘 + 설명 + 카테고리

**말할 것**:
> "연승하면 왕관, 러그당하면 좀비 눈, 컴백하면 복수 오라. 모든 trait는 실제 거래 이벤트에서 옵니다."

### 5-4. Diary 탭 (10s)
- Mutation Diary: 각 상태 변화 기록
- 컬러 보더 (노랑=승리, 빨강=러그, 보라=복구)
- 타이프라이터 효과 캡션

**말할 것**:
> "Mutation Diary는 캐릭터의 모든 변화를 기록합니다. 거래할 때마다 새 항목이 추가됩니다."

### 5-5. Share 탭 (10s)
- Share Card: 캐릭터 + DNA + 아키타입이 담긴 공유 카드
- Trading Card: 수집형 카드 스타일
- "Share My Soul" 버튼 -> 트위터 공유 화면

**말할 것**:
> "Share Card로 트위터에 바로 공유할 수 있습니다. 모든 카드에 Four.meme 브랜딩이 들어갑니다."

### 5-6. Relics 탭 (5s)
- Snapshot Relic: 마일스톤 달성 시 민팅 가능한 NFT
- First Crowned Win, Rug Survivor, Chaos Ascension 등

### 5-7. Creator 탭 (5s)
- Token Creator 패널: Four.meme에서 토큰을 만든 경우
- Kingmaker Crown / Fallen Creator Mark

### 5-8. Horoscope + Sibling/Rival (5s)
- Daily Horoscope 위젯 열어보기
- Sibling/Rival 패널: 같은 아키타입 동료 + 라이벌 매칭

---

## Scene 6: Replay Mode (60s)

**화면**: `/replay`

> Replay 모드는 오프라인으로 돌아감. API 호출 0. 심사위원이 지갑 없이도 전체 플로우를 볼 수 있음.

### 6-1. 프리셋 선택 (5s)
- 4개 프리셋: Rug Necromancer / Mad Gambler / Ice Whale / Ghost Bagholder
- "Rug Necromancer" 선택

### 6-2. 자동 재생 (50s)
- Start 버튼 클릭 -> 8단계 자동 재생
- 각 단계마다:
  - 상단 타임라인 바가 초록색으로 채워짐
  - 서브타이틀 (EN/KO 전환 가능)
  - 캐릭터 대사 (아키타입별 고유)
  - 상태 변화 뱃지 업데이트
  - Mutation 캡션 누적

**말할 것 (스텝별)**:
1. **Connect**: "지갑 연결"
2. **Awakening**: "Chaos 82, Survival 91 — DNA가 계산됩니다"
3. **Genesis**: "Rug Necromancer가 탄생합니다"
4. **Win Streak x3**: "3연승으로 왕관 획득. 캐릭터에 Crown trait 추가"
5. **Rug Exposure**: "러그풀 당함. Corruption +40, 좀비 눈 등장"
6. **Comeback**: "복귀 성공. Survival Streak x3, Revenge Aura 해금"
7. **Diary**: "3개의 변이가 기록됨"
8. **Share Card**: "공유 카드 생성 완료"

### 6-3. 마무리 (5s)
- 재생 완료 후 하단에 "What DegenBorn gives Four.meme" 패널 표시
  - Retention / Viral UGC / Loyalty Data

**말할 것**:
> "이 전체 플로우가 오프라인으로 돌아갑니다. 네트워크 의존성 제로. 심사위원분들도 지갑 없이 바로 체험 가능합니다."

---

## Scene 7: 보너스 페이지 (30s)

시간이 남으면 빠르게 훑어보기:

| 페이지 | URL | 한 줄 설명 |
|--------|-----|-----------|
| Gallery | `/gallery` | 분석된 몬스터 갤러리 |
| Graveyard | `/graveyard` | 죽은(러그된) 토큰 묘지 |
| Hall of Fame | `/fame` | 최고 명성 몬스터 |
| Hall of Shame | `/shame` | 최고 오염도 몬스터 |
| Zodiac | `/zodiac` | 아키타입별 운세 |
| Tarot | `/tarot` | 덱 타로 카드 리딩 |
| Battle | `/battle` | 몬스터 vs 몬스터 배틀 |
| Report Card | `/report/[wallet]` | 월간 성적표 |
| Eulogy | `/eulogy/[wallet]` | 죽은 포트폴리오 추도사 |
| Compare | `/compare` | 두 지갑 비교/대결 |
| Origin Story | `/origin/[wallet]` | AI 생성 3문단 기원 스토리 |
| Season | `/season` | 시즌별 테마 이벤트 |
| Meme Studio | `/studio` | 몬스터 밈 생성기 |
| Stickers | `/stickers` | 스티커 팩 |
| Public Profile | `/m/[wallet]` | 공유 가능한 퍼블릭 페이지 |

---

## 대체 경로: Replay 전용 데모

MetaMask 없이 / 서버 불안정할 때 사용하는 안전 루트.

```
Landing (10s) -> "Try Replay Demo" 클릭 -> Replay Mode (120s) -> 보너스 페이지 (30s)
```

Landing에서 "Try Replay Demo" 버튼으로 바로 진입. 전체 플로우를 Replay로 커버.

---

## 데모 영상 촬영 팁

1. **해상도**: 1280x720 이상. 4K 불필요.
2. **속도**: Replay 모드 속도 "Normal" (4초 간격). 빠르면 "Fast" (2초).
3. **자막**: EN/KO 토글 활용. 영어 자막 기본, 필요시 한국어 전환.
4. **음악**: 없어도 됨. 프로덕트 자체가 비주얼 임팩트 있음.
5. **길이**: 2~3분이 이상적. 3분 넘으면 잘라라.
6. **마지막 컷**: Share Card 또는 "What DegenBorn gives Four.meme" 패널로 마무리.
7. **워터마크**: 불필요. 프로덕트 안에 DegenBorn + Four.meme 브랜딩 이미 있음.

---

## 핵심 메시지 (반복할 것)

- **"Rules decide. AI expresses."** — 스코어링은 deterministic, AI는 표현만 담당
- **"Same wallet, same score, every time."** — LLM hallucination 없음
- **"Every trade changes who you are."** — 거래 = 캐릭터 진화
- **"The product IS the content."** — 공유 카드가 곧 마케팅 소재
- **"Four.meme is where meme tokens are born. DegenBorn is where meme traders are born."**

---

## 화면 캡처 체크리스트

데모 영상 + 트위터 콘텐츠용으로 캡처해둘 화면:

- [ ] Landing 히어로 (캐러셀 돌아가는 중)
- [ ] Birth 스캔 로그 (체크마크 애니메이션)
- [ ] DNA Panel (5축 바 차트)
- [ ] Archetype Reveal (이름 + 태그라인)
- [ ] Genesis 캐릭터 탄생 순간
- [ ] Monster Room 전체 뷰
- [ ] Traits 목록 (Crown, Zombie Eyes 등)
- [ ] Mutation Diary (컬러 보더)
- [ ] Share Card
- [ ] Trading Card
- [ ] Replay Mode 타임라인
- [ ] Replay 완료 후 Four.meme 가치 제안 패널
- [ ] Graveyard 페이지
- [ ] Loyalty Score (Diamond/Legendary 등급)
