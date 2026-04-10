# PROJECT.md — DegenBorn

## 1. 프로젝트 한 줄 정의
**DegenBorn는 Four.meme 유저의 지갑 행동을 분석해, 진화하는 온체인 괴물 페르소나로 바꾸는 AI identity engine이다.**

숫자와 차트로만 보이던 지갑 활동을, 성격·상처·트로피가 쌓이는 캐릭터로 바꾼다.

---

## 2. 왜 이 프로젝트인가
밈코인 트레이딩은 원래 감정적이고 서사적이다. 그런데 현재 온체인 데이터는 대부분 숫자와 로그로만 보인다. 이 프로젝트는 그 비어 있는 층을 채운다.

핵심 가설은 세 가지다.

1. 사람은 손익표보다 **자기 캐릭터**를 더 자주 본다.
2. 사람은 차트보다 **공유 가능한 서사**를 더 자주 퍼뜨린다.
3. Four.meme 활동이 곧 캐릭터 성장으로 연결되면, 거래 자체가 **리텐션 루프**가 된다.

---

## 3. 문제 정의

### 문제 1. 지갑은 문화적 자아를 표현하지 못한다
지갑은 Web3의 핵심 객체인데도 여전히 주소에 가깝다. 사용자의 스타일, 성향, 실패, 복귀가 남지 않는다.

### 문제 2. 온체인 데이터는 지루하다
거래 로그, 손익, 보유량만으로는 재미도 없고 공유성도 약하다.

### 문제 3. 대부분의 NFT는 정적이다
처음 민팅할 때만 재밌고 이후엔 움직이지 않는다. 유저 행동과 연동되는 캐릭터 경험이 약하다.

---

## 4. 솔루션
DegenBorn는 Four.meme 관련 지갑 활동을 수집하고, 이를 기반으로 **Persona DNA**를 계산한다. 그 결과로 지갑 귀속형 **Soul Core**가 탄생하고, 거래 행동에 따라 캐릭터가 진화한다.

이 프로젝트의 핵심은 "NFT를 하나 더 만든다"가 아니다. **지갑 행동을 살아 있는 정체성으로 바꾼다**가 핵심이다.

---

## 5. 설계 원칙

### 원칙 1. 판정은 규칙, 표현은 AI
지갑 성향은 LLM이 임의로 판정하지 않는다.

구조:

`온체인 데이터 → 정량 점수 계산 → 아키타입 결정 → AI가 서사/대사/이미지 생성`

이렇게 해야 결과가 일관되고, 기술 구현도 안정적이다.

### 원칙 2. 정체성과 거래성을 분리한다
한 NFT에 정체성과 거래성을 동시에 싣지 않는다.

- **Soul Core**: 지갑 귀속형, 비양도형, 현재 정체성
- **Snapshot Relic**: 주요 진화 순간을 기념하는 거래형 NFT

### 원칙 3. 모든 변화를 풀 리렌더링하지 않는다
매 거래마다 AI로 전체 이미지를 다시 생성하지 않는다.

- Genesis: AI가 기본 캐릭터 생성
- 일상 변화: trait overlay만 갱신
- 대형 진화: 특정 마일스톤에서만 AI 재렌더링

### 원칙 4. 자동 포스팅을 핵심 기능으로 두지 않는다
AI가 공유용 캡션과 카드를 만들어 주되, 게시 여부는 사용자가 결정한다.

### 원칙 5. 사람의 원문 대화를 저장하지 않는다
저장하는 것은 대화가 아니라 **캐릭터의 변화 기록**이다.

---

## 6. 목표와 비목표

### 목표
1. Four.meme 유저의 지갑 행동을 하나의 캐릭터로 시각화한다.
2. 실시간 또는 준실시간 진화 경험을 제공한다.
3. 해커톤 제출 시 안정적인 데모를 완성한다.
4. 커뮤니티 투표에 강한 공유 자산을 만든다.

### 비목표
1. 자동매매 에이전트 구현
2. 세무 수준의 완전한 손익 회계
3. 무제한 X 자동 포스팅
4. 모든 상태 변경을 온체인에 직접 저장
5. 사람의 raw conversation 저장

---

## 7. 타겟 사용자

### 1차 타겟
- Four.meme에서 활발히 활동하는 밈코인 트레이더
- 자기 지갑을 밈과 서사로 표현하고 싶은 유저
- 커뮤니티 투표에서 주목받고 싶은 빌더/디젠

### 2차 타겟
- 다른 사람의 지갑 페르소나를 구경하는 관전자
- 플랫폼에서 활발한 유저를 식별하고 싶은 커뮤니티 운영자

---

## 8. 코어 사용자 경험

### Step 1. Wallet Connect
사용자가 지갑을 연결한다.

### Step 2. The Awakening
최근 활동 데이터를 읽고 Persona DNA와 아키타입을 계산한다.

예시 출력:
- Aggression 82
- Conviction 34
- Chaos 76
- Luck 41
- Survival 91
- Archetype: Rug Necromancer

### Step 3. Genesis Birth
AI가 DNA를 바탕으로 기본 캐릭터를 생성한다.

### Step 4. Soul Core Mint
지갑 귀속형 Soul Core를 민팅한다.

### Step 5. Live Evolution
수익, 손실, 럭풀, 복귀 등에 따라 trait와 상태가 변한다.

### Step 6. Snapshot Relic
큰 진화가 발생하면 거래 가능한 Snapshot Relic을 발행한다.

### Step 7. Share
AI가 짧은 밈형 캡션과 공유 카드를 생성한다.

---

## 9. Persona DNA 설계

### 핵심 축 5개

#### Aggression
얼마나 자주, 얼마나 빠르게 사고파는가

입력 예시:
- 거래 빈도
- 평균 보유 시간 역수
- 단기 재진입 횟수

#### Conviction
얼마나 오래, 얼마나 집중해서 버티는가

입력 예시:
- 평균 보유 지속 시간
- 특정 토큰 집중도
- 동일 토큰 재진입 비율

#### Chaos
얼마나 난폭하고 불안정한 흐름을 보이는가

입력 예시:
- 손실 변동성
- 죽은 토큰 노출도
- 럭풀 추정 이벤트 횟수

#### Luck
얼마나 운 좋게 좋은 진입과 실현을 했는가

입력 예시:
- 이익 실현 비율
- 초기 진입 적중 비율
- 수익 구간 청산 정확도

#### Survival
망한 뒤에도 다시 살아나는가

입력 예시:
- 큰 손실 후 복귀 횟수
- 드로다운 회복 속도
- 연속 실패 후 재상승 여부

모든 점수는 0~100으로 정규화한다.

---

## 10. 아키타입 규칙
아키타입은 LLM이 아니라 **규칙 트리**로 정한다.

### Mad Gambler
- Aggression 높음
- Chaos 높음
- Luck 낮거나 중간

### Ice Whale
- Conviction 높음
- Luck 높음
- Survival 높음

### Rug Necromancer
- Chaos 높음
- Survival 높음

### Diamond Cultist
- Conviction 높음
- Luck 낮음
- Survival 높음

### Sniper Jester
- Aggression 높음
- Luck 높음
- 평균 보유 시간 짧음

### Ghost Bagholder
- Conviction 높음
- Chaos 높음
- Survival 낮음

---

## 11. 상태 머신
캐릭터는 단순 이미지가 아니라 상태를 가진다.

### 상태값
- `archetype`
- `level`
- `mood`
- `corruption`
- `prestige`
- `scarCount`
- `crownCount`
- `survivalStreak`

### 규칙 예시
- 연속 수익 3회 → `crownCount + 1`
- 큰 손실 → `scarCount + 1`, `mood=despair`
- 손실 후 수익 복귀 → `survivalStreak + 1`, `mood=revenge`
- 럭풀 추정 이벤트 → `corruption + 20`, `zombieTrait=true`
- 높은 수익률 장기 유지 → `prestige + 15`, `royalTrait=true`

---

## 12. 비주얼 진화 규칙

### Genesis
AI가 기본 캐릭터 원형을 생성한다.

출력물:
- base portrait
- seed
- reference image
- trait anchor 좌표

### 일상 변화
매 이벤트마다 overlay만 갱신한다.

예시 trait:
- 왕관
- 금팔찌
- 붕대
- 찢어진 옷
- 눈물
- 금니
- 상처
- 좀비 눈
- 복수 오라

### 대형 진화
다음 조건에서만 전체 재렌더링한다.

- 7일 순이익 급등
- 럭풀 3회 이상 생존
- 레벨 업 임계치 도달
- 장기 손실 후 극적 복귀

---

## 13. NFT 모델

### 13.1 Soul Core
지갑 귀속형 핵심 페르소나 NFT

특징:
- 지갑당 1개
- 비양도형
- 현재 상태를 대표
- 항상 최신 캐릭터 정체성을 가리킴

온체인 최소 기록:
- `dnaHash`
- `archetype`
- `level`
- `currentStage`
- `latestStateHash`

### 13.2 Snapshot Relic
중요 진화 순간을 기념하는 거래형 NFT

예시 이름:
- First Crowned Win
- Rug Survivor
- Seven-Day Resurrection
- Chaos Ascension

---

## 14. 시스템 아키텍처

```text
[Wallet / Four.meme activity]
          ↓
[Data Adapter: Moralis/Covalent/RPC]
          ↓
[Normalizer + Event Store]
          ↓
[Scoring Engine]
          ↓
[Archetype Classifier]
          ↓
 ┌───────────────────────────────┬───────────────────────────────┐
 ↓                               ↓                               ↓
[LLM: narrative/caption]   [Image Pipeline]               [State Machine]
 ↓                               ↓                               ↓
[Mutation Diary]           [Base + Overlay Assets]        [Soul Core State]
          └───────────────────────────────┬───────────────────────────────┘
                                          ↓
                              [Frontend: Birth / Monster Room / Share]
```

---

## 15. 기술 스택 결정안
해커톤 속도를 기준으로 아래를 기본으로 잡는다.

### Frontend
- Next.js
- TypeScript
- Tailwind
- wagmi / viem

### Backend / Worker
- Node.js
- Next.js API routes 또는 lightweight worker
- cron / queue 기반 이벤트 처리

### Data
- Moralis 또는 Covalent로 빠르게 시작
- 필요시 직접 RPC fallback
- Postgres 계열 DB에 정규화 저장

### AI
- LLM: 서사, 대사, 캡션 생성
- Image model adapter: Flux 우선, 다른 모델로 교체 가능
- Overlay compositor: 서버 또는 클라이언트 기반 이미지 합성

### Smart Contract
- Solidity
- Hardhat 또는 Foundry
- BNB Chain testnet 우선, 필요시 mainnet 데모 미러링

### Memory
- Unibase는 P1으로 붙인다.
- MVP에서는 mutation diary와 milestone history 저장에 한정한다.

---

## 16. 데이터 모델 초안

### `wallet_profile`
- `wallet_address`
- `aggression`
- `conviction`
- `chaos`
- `luck`
- `survival`
- `archetype`
- `seed`
- `last_scored_at`

### `activity_event`
- `id`
- `wallet_address`
- `event_type`
- `token_address`
- `value_usd`
- `pnl_delta`
- `timestamp`
- `raw_payload`

### `mutation_event`
- `id`
- `wallet_address`
- `reason`
- `trait_delta`
- `state_before`
- `state_after`
- `generated_caption`
- `asset_url`
- `timestamp`

### `generated_asset`
- `id`
- `wallet_address`
- `asset_type`
- `prompt`
- `seed`
- `url`
- `created_at`

### `soul_core`
- `token_id`
- `wallet_address`
- `dna_hash`
- `current_state_hash`
- `metadata_url`

### `snapshot_relic`
- `token_id`
- `wallet_address`
- `milestone_type`
- `asset_url`
- `metadata_url`

---

## 17. MVP 범위

### 반드시 구현
1. 지갑 연결
2. 데이터 수집 + 정규화
3. Persona DNA 계산
4. 아키타입 분류
5. Genesis 캐릭터 생성
6. Soul Core 민팅
7. 상태 머신 기반 trait 변화
8. mutation diary
9. 공유 카드 + 밈형 캡션
10. 발표용 Replay Mode

### 가능하면 추가
1. Snapshot Relic 발행
2. Major evolution 재렌더링
3. Unibase 연동

### 이번 해커톤에서 제외
1. 자동매매
2. 완전 자동 X 포스팅
3. 고정밀 세무 손익 계산
4. 모든 상태의 온체인 저장
5. raw conversation 저장

---

## 18. 데모 전략
실제 라이브 데이터만으로 발표하면 흔들릴 수 있다. 따라서 데모는 두 모드로 간다.

### Live Mode
실제 지갑을 연결해 현재 DNA와 캐릭터를 생성한다.

### Replay Mode
준비된 샘플 지갑과 이벤트 타임라인을 재생한다.

### 추천 발표 순서
1. 샘플 지갑 연결
2. "당신은 Rug Necromancer입니다" 공개
3. Genesis 캐릭터 등장
4. 수익 이벤트 재생 → 왕관 획득
5. 럭풀 이벤트 재생 → 좀비화
6. 회복 이벤트 재생 → 흉터가 훈장으로 변환
7. mutation diary 열기
8. 공유 카드 생성

---

## 19. 심사 기준 대응

### Innovation
단순 NFT가 아니라 **지갑 행동 기반 생성형 정체성**을 만든다.

### Technical Implementation
- deterministic scoring engine
- 상태 머신
- 이미지 생성 + overlay 엔진
- 스마트컨트랙트 이중 구조
- 데이터 파이프라인

### Practical Value
사용자에겐 자아 표현을, Four.meme에는 리텐션과 UGC를 준다.

### Presentation
공개 순간이 강하다. 캐릭터 reveal과 진화 시연이 직관적이다.

---

## 20. 주요 리스크와 대응

### 리스크 1. 손익 계산이 더럽다
대응: 세무 정확도가 아니라 페르소나용 정규화 지표를 목표로 한다.

### 리스크 2. 이미지 일관성이 깨질 수 있다
대응: seed, reference image, overlay 방식을 사용한다.

### 리스크 3. 라이브 데이터가 발표 중 흔들린다
대응: Replay Mode를 별도로 준비한다.

### 리스크 4. 기능 욕심으로 범위가 터진다
대응: Soul Core + DNA + Evolution + Share만 P0로 본다.

### 리스크 5. 자동 포스팅이 스팸처럼 보인다
대응: 사용자가 명시적으로 공유 버튼을 눌러야만 외부 게시가 가능하게 한다.

---

## 21. 제출물 정의
최소 제출물은 아래 네 가지다.

1. 동작하는 웹 데모
2. 공개 가능한 repo
3. 2분 내외 데모 영상
4. 프로젝트 설명 문서

---

## 22. 일정

### 4/10 ~ 4/11
- 데이터 소스 결정
- 샘플 지갑 확보
- scoring spec 고정

### 4/12 ~ 4/13
- DNA 계산기 구현
- 아키타입 분류기 구현
- Birth screen 구현

### 4/14 ~ 4/15
- Genesis 이미지 파이프라인
- Soul Core 컨트랙트
- 민팅 플로우

### 4/16 ~ 4/17
- 상태 머신
- overlay trait 엔진
- Monster Room UI

### 4/18 ~ 4/19
- mutation diary
- 공유 카드
- 캡션 생성

### 4/20 ~ 4/21
- Replay Mode
- 폴리싱
- 발표 영상
- 제출 정리

---

## 23. 고정 결정 사항
아래는 지금 시점에서 뒤집지 않는다.

1. Soul Core와 Snapshot Relic를 분리한다.
2. 판정은 deterministic scoring으로 한다.
3. 자동매매는 이번 범위에서 제외한다.
4. 자동 X 포스팅은 제외한다.
5. Replay Mode를 반드시 만든다.
6. Unibase는 P1이며, 없어도 MVP는 돌아가야 한다.

---

## 24. 최종 메시지
**DegenBorn는 또 하나의 NFT 프로젝트가 아니다. 지갑 행동을 살아 있는 정체성으로 바꾸는 프로젝트다.**
