# TICKET.md — DegenBorn Sprint Board

## 0. 운영 원칙
이 문서는 바로 구현 가능한 작업 단위로 쪼갠 실행 보드다.

### 우선순위 규칙
- **P0**: 제출물 완성에 필수. 반드시 끝낸다.
- **P1**: 시간 남으면 넣는다. 있으면 강해진다.
- **P2**: 해커톤 이후 로드맵.

### 완료 기준
각 티켓은 아래를 만족해야 닫는다.
1. 코드 또는 산출물이 repo에 존재한다.
2. 로컬/배포 환경에서 재현 가능하다.
3. 실패 케이스가 최소 1개 이상 고려되어 있다.
4. 데모 흐름에 들어갈 수 있다.

### 권장 역할 분배
- **FE**: 프론트엔드/UI
- **BE**: 데이터/백엔드
- **AI**: 프롬프트/이미지/캡션
- **SC**: 스마트컨트랙트
- **PM**: 통합/데모/제출

솔로 개발이면 이 순서대로 처리한다:
**BE → AI → SC → FE → PM**

---

## 1. 마일스톤

### M0. Foundation
개발 바닥 깔기

### M1. Birth
지갑 분석 → DNA → 아키타입 → Genesis

### M2. Identity
Soul Core 민팅 + Monster Room

### M3. Evolution
상태 변화 + overlay + diary

### M4. Demo
Replay Mode + share + 제출물

---

## 2. 크리티컬 패스
아래 순서가 핵심이다.

1. T-001 환경 세팅
2. T-003 데이터 어댑터
3. T-005 정규화 이벤트 저장
4. T-006 DNA 스코어링
5. T-007 아키타입 분류기
6. T-009 Genesis 프롬프트/에셋 파이프라인
7. T-010 Soul Core 컨트랙트
8. T-011 민팅 플로우
9. T-012 Monster Room
10. T-013 상태 머신
11. T-014 trait overlay 엔진
12. T-015 mutation diary
13. T-017 Replay Mode
14. T-016 share card
15. T-022 제출 패키지

---

## 3. 티켓 목록

---

### T-001 [P0][FOUNDATION] 모노레포/환경 세팅
**Owner:** FE/BE  
**Estimate:** 0.5d  
**Depends on:** 없음

#### 목표
프론트, API, 컨트랙트, 워커를 한 repo에서 돌릴 수 있게 기본 구조를 만든다.

#### 작업
- [ ] monorepo 구조 생성 (`apps/web`, `apps/worker`, `packages/contracts`, `packages/shared`)
- [ ] TypeScript 공통 설정
- [ ] env 파일 템플릿 생성
- [ ] lint / format / build 스크립트 추가
- [ ] 배포 대상 선택 및 기본 배포 파이프라인 문서화

#### 산출물
- repo 초기 구조
- `.env.example`
- 실행 방법 문서

#### Acceptance Criteria
- [ ] `pnpm install && pnpm build`가 통과한다.
- [ ] 웹앱과 워커가 각각 독립적으로 실행된다.
- [ ] 공통 타입 패키지를 양쪽에서 import할 수 있다.

---

### T-002 [P0][PM] 제품 규격 고정 문서 작성
**Owner:** PM  
**Estimate:** 0.25d  
**Depends on:** 없음

#### 목표
중간에 방향이 흔들리지 않게 scoring, archetype, state, trait 규칙을 짧은 spec으로 고정한다.

#### 작업
- [ ] scoring 필드 이름 확정
- [ ] archetype 6종 정의
- [ ] 상태값 스키마 확정
- [ ] trait 이름 목록 확정
- [ ] 제외 범위 명시

#### 산출물
- `docs/spec.md`

#### Acceptance Criteria
- [ ] 모든 팀원이 같은 용어를 쓴다.
- [ ] 이후 티켓에서 spec을 참조할 수 있다.
- [ ] "자동매매 제외" 등 비목표가 명시되어 있다.

---

### T-003 [P0][BE] Four.meme 데이터 어댑터 구현
**Owner:** BE  
**Estimate:** 1d  
**Depends on:** T-001

#### 목표
지갑 주소를 입력하면 Four.meme 관련 활동 데이터를 가져오는 어댑터를 만든다.

#### 작업
- [ ] 데이터 소스 1차 선택(Moralis/Covalent/RPC)
- [ ] wallet activity fetch 함수 작성
- [ ] 최근 7일/30일/180일 윈도우 조회 지원
- [ ] rate limit / timeout 처리
- [ ] 샘플 응답 저장

#### 산출물
- `packages/data-adapter`
- 샘플 JSON 3개 이상

#### Acceptance Criteria
- [ ] 임의의 샘플 지갑 3개에 대해 데이터가 반환된다.
- [ ] 실패 시 명확한 에러 메시지가 나온다.
- [ ] 응답이 정규화 전 단계의 raw payload로 보존된다.

---

### T-004 [P0][BE] 샘플 지갑 코퍼스 + Replay 데이터셋 구축
**Owner:** BE/PM  
**Estimate:** 0.5d  
**Depends on:** T-003

#### 목표
발표에서 안정적으로 쓸 샘플 지갑과 이벤트 타임라인을 확보한다.

#### 작업
- [ ] 성격이 다른 샘플 지갑 3~5개 선정
- [ ] 각 지갑에 archetype 후보 라벨 수동 부여
- [ ] 발표용 이벤트 타임라인 JSON 제작
- [ ] Replay 전용 fixture 분리

#### 산출물
- `fixtures/wallets/*.json`
- `fixtures/replay/*.json`

#### Acceptance Criteria
- [ ] 최소 3개 archetype이 시연 가능하다.
- [ ] 인터넷 상태가 불안정해도 Replay가 가능하다.
- [ ] 발표 흐름 1개가 fixture만으로 재생된다.

---

### T-005 [P0][BE] 정규화 이벤트 스키마 + 저장소 구현
**Owner:** BE  
**Estimate:** 0.75d  
**Depends on:** T-003

#### 목표
데이터 소스별 차이를 숨기고, scoring에 바로 쓸 수 있는 normalized event store를 만든다.

#### 작업
- [ ] `activity_event` 타입 정의
- [ ] buy/sell/hold/rug/recovery 추정 이벤트 규칙 정의
- [ ] raw → normalized mapper 작성
- [ ] DB 테이블 또는 로컬 저장소 구성
- [ ] idempotent upsert 처리

#### 산출물
- normalized schema
- ingest 스크립트

#### Acceptance Criteria
- [ ] 동일 지갑 재수집 시 중복 저장되지 않는다.
- [ ] scoring에 필요한 최소 필드가 모두 채워진다.
- [ ] raw payload와 normalized event가 연결된다.

---

### T-006 [P0][BE] Persona DNA scoring engine 구현
**Owner:** BE  
**Estimate:** 1d  
**Depends on:** T-005, T-002

#### 목표
정규화 이벤트를 받아 5개 DNA 점수를 계산하는 deterministic 엔진을 만든다.

#### 작업
- [ ] Aggression 계산식 구현
- [ ] Conviction 계산식 구현
- [ ] Chaos 계산식 구현
- [ ] Luck 계산식 구현
- [ ] Survival 계산식 구현
- [ ] 0~100 정규화
- [ ] 테스트 케이스 작성

#### 산출물
- `packages/scoring`
- 샘플 결과 JSON

#### Acceptance Criteria
- [ ] 같은 입력에 항상 같은 점수가 나온다.
- [ ] 샘플 지갑 3개가 서로 다른 프로필을 가진다.
- [ ] 극단값에 대한 처리(0, 결측, 과도한 거래량)가 포함된다.

---

### T-007 [P0][BE] 아키타입 분류기 + 설명 문자열 구현
**Owner:** BE  
**Estimate:** 0.5d  
**Depends on:** T-006, T-002

#### 목표
DNA 점수 조합으로 archetype을 결정하고, 간단한 해설을 함께 반환한다.

#### 작업
- [ ] ruleset 구현
- [ ] tie-breaker 정의
- [ ] archetype별 한 줄 설명 작성
- [ ] archetype별 tone seed 작성

#### 산출물
- `packages/archetype`

#### Acceptance Criteria
- [ ] 모든 scoring 결과는 정확히 하나의 archetype으로 귀결된다.
- [ ] tie-breaker가 문서화되어 있다.
- [ ] archetype별 설명이 UI에 바로 표시 가능하다.

---

### T-008 [P0][AI] Narrative/Prompt 빌더 구현
**Owner:** AI  
**Estimate:** 0.5d  
**Depends on:** T-007

#### 목표
DNA와 archetype을 기반으로 캐릭터 설명, 한 줄 소개, 캡션 프롬프트를 만드는 빌더를 만든다.

#### 작업
- [ ] system prompt 작성
- [ ] 입력 스키마 정의
- [ ] 출력 포맷 JSON 고정
- [ ] 금지 규칙 정의(투자 조언 금지, 과한 텍스트 금지)
- [ ] 한국어/영어 짧은 카피 템플릿 작성

#### 산출물
- prompt templates
- narrative JSON schema

#### Acceptance Criteria
- [ ] 출력이 항상 같은 필드 구조를 가진다.
- [ ] 120자 이내 짧은 요약이 생성된다.
- [ ] 과장된 투자 조언 문구가 포함되지 않는다.

---

### T-009 [P0][AI] Genesis 이미지 파이프라인 구축
**Owner:** AI  
**Estimate:** 1d  
**Depends on:** T-008

#### 목표
기본 캐릭터 원형을 안정적으로 생성하는 이미지 파이프라인을 만든다.

#### 작업
- [ ] 이미지 모델 어댑터 구현
- [ ] seed 고정 로직 추가
- [ ] archetype별 스타일 가이드 작성
- [ ] 실패 시 fallback placeholder 추가
- [ ] asset 저장 경로 정의

#### 산출물
- genesis generation endpoint
- base asset 6종 이상 샘플

#### Acceptance Criteria
- [ ] 같은 seed에서 유사한 결과 일관성이 유지된다.
- [ ] archetype별 비주얼 차이가 명확하다.
- [ ] 이미지 생성 실패 시 placeholder로 흐름이 끊기지 않는다.

---

### T-010 [P0][SC] Soul Core 컨트랙트 구현
**Owner:** SC  
**Estimate:** 0.75d  
**Depends on:** T-001, T-002

#### 목표
지갑 귀속형 Soul Core NFT 컨트랙트를 구현한다.

#### 작업
- [ ] 비양도형 또는 transfer 제한 로직 구현
- [ ] wallet당 1개 제한
- [ ] tokenURI 업데이트 구조 정의
- [ ] owner-only/admin update 함수 구현
- [ ] 테스트 작성

#### 산출물
- Soul Core contract
- unit tests

#### Acceptance Criteria
- [ ] 동일 지갑으로 2개 이상 민팅할 수 없다.
- [ ] 일반 transfer가 막힌다.
- [ ] metadata 갱신 경로가 문서화된다.

---

### T-011 [P0][SC/FE] Soul Core 민팅 플로우 연결
**Owner:** SC/FE  
**Estimate:** 0.75d  
**Depends on:** T-010, T-009, T-007

#### 목표
분석 결과와 Genesis 에셋을 바탕으로 실제 Soul Core 민팅까지 연결한다.

#### 작업
- [ ] 지갑 연결 UI 구현
- [ ] 분석 완료 후 mint CTA 노출
- [ ] metadata 생성 API 작성
- [ ] 민팅 트랜잭션 후 결과 화면 연결
- [ ] 실패/취소 처리

#### 산출물
- wallet connect + mint UI
- metadata endpoint

#### Acceptance Criteria
- [ ] 사용자가 분석 후 민팅을 수행할 수 있다.
- [ ] 민팅 완료 후 token id와 캐릭터가 화면에 반영된다.
- [ ] 유저가 트랜잭션을 취소해도 앱이 깨지지 않는다.

---

### T-012 [P0][FE] Birth Screen + Monster Room UI 구현
**Owner:** FE  
**Estimate:** 1d  
**Depends on:** T-011, T-006, T-007

#### 목표
사용자가 DNA, archetype, 현재 상태를 한 화면에서 이해할 수 있게 핵심 UI를 만든다.

#### 작업
- [ ] Landing 구현
- [ ] Birth Chamber 구현
- [ ] DNA score panel 구현
- [ ] Monster Room 구현
- [ ] 상태 배지/trait 패널 구현

#### 산출물
- 핵심 3개 화면

#### Acceptance Criteria
- [ ] DNA 점수와 archetype이 즉시 이해된다.
- [ ] 현재 장착 trait가 리스트로 보인다.
- [ ] 모바일/데스크톱 둘 다 최소 사용 가능하다.

---

### T-013 [P0][BE] 상태 머신 구현
**Owner:** BE  
**Estimate:** 0.75d  
**Depends on:** T-006, T-007

#### 목표
거래 이벤트에 따라 캐릭터 상태가 바뀌는 규칙 엔진을 만든다.

#### 작업
- [ ] 상태 스키마 정의
- [ ] mutation rule 작성
- [ ] crown/scar/corruption/prestige 변화 구현
- [ ] event → state transition 함수 작성
- [ ] 테스트 케이스 작성

#### 산출물
- state machine module

#### Acceptance Criteria
- [ ] 입력 이벤트 시퀀스가 동일하면 상태 변화도 동일하다.
- [ ] 최소 5종 이벤트가 상태를 바꾼다.
- [ ] 잘못된 이벤트 입력에도 예외 처리된다.

---

### T-014 [P0][AI/FE] Trait overlay 엔진 구현
**Owner:** AI/FE  
**Estimate:** 0.75d  
**Depends on:** T-009, T-013

#### 목표
전체 이미지를 다시 생성하지 않고 trait를 조합해 진화된 모습을 보여준다.

#### 작업
- [ ] trait 에셋 제작 또는 placeholder 준비
- [ ] overlay 좌표 체계 정의
- [ ] 상태값 → trait mapping 구현
- [ ] 합성 결과 미리보기 구현
- [ ] PNG export 지원

#### 산출물
- overlay renderer
- trait asset pack

#### Acceptance Criteria
- [ ] 왕관/상처/좀비화 등 최소 6개 trait가 반영된다.
- [ ] base image 일관성이 유지된다.
- [ ] UI에서 현재 합성 결과를 즉시 볼 수 있다.

---

### T-015 [P0][BE/AI] Mutation Diary 저장 및 생성
**Owner:** BE/AI  
**Estimate:** 0.75d  
**Depends on:** T-013, T-014, T-008

#### 목표
변화 이력을 텍스트와 상태 diff로 남기는 diary를 만든다.

#### 작업
- [ ] mutation event 저장 구조 구현
- [ ] before/after state diff 기록
- [ ] 이벤트별 짧은 diary line 생성
- [ ] time-ordered list API 작성
- [ ] UI 렌더 구조 정의

#### 산출물
- diary API
- diary list UI data structure

#### Acceptance Criteria
- [ ] 최소 최근 10개 mutation이 조회된다.
- [ ] 각 diary entry에 reason, state change, caption이 들어간다.
- [ ] raw conversation은 어디에도 저장되지 않는다.

---

### T-016 [P0][AI/FE] Share Card + 밈형 캡션 생성
**Owner:** AI/FE  
**Estimate:** 0.75d  
**Depends on:** T-014, T-015

#### 목표
커뮤니티 투표용으로 바로 공유 가능한 카드와 짧은 카피를 생성한다.

#### 작업
- [ ] 카드 레이아웃 설계
- [ ] 현재 캐릭터 + archetype + 대표 점수 반영
- [ ] 1줄 캡션 생성
- [ ] 이미지 다운로드/저장 지원
- [ ] 민감 문구 필터링

#### 산출물
- share card view
- card export function

#### Acceptance Criteria
- [ ] 카드 한 장만 봐도 캐릭터 성격이 이해된다.
- [ ] 캡션이 1~2줄로 짧고 밈 톤을 유지한다.
- [ ] 과도한 스팸 톤이나 자동 게시 기능은 없다.

---

### T-017 [P0][BE/FE/PM] Replay Mode 구현
**Owner:** BE/FE/PM  
**Estimate:** 0.75d  
**Depends on:** T-004, T-013, T-014, T-015

#### 목표
인터넷이나 외부 API 상태와 무관하게 발표를 안정적으로 재생할 수 있는 모드를 만든다.

#### 작업
- [ ] fixture 로딩 모드 추가
- [ ] step-by-step 이벤트 재생 UI 구현
- [ ] 발표용 preset 1개 이상 구성
- [ ] Reset 기능 추가
- [ ] 발표 스크립트와 맞춘 시퀀스 고정

#### 산출물
- replay page
- 발표 preset JSON

#### Acceptance Criteria
- [ ] 네트워크 없이도 데모 흐름이 재생된다.
- [ ] 1분 이내에 핵심 장면 3개 이상 보여줄 수 있다.
- [ ] reset 후 같은 시퀀스가 반복 재생된다.

---

### T-018 [P1][SC] Snapshot Relic 컨트랙트 구현
**Owner:** SC  
**Estimate:** 0.75d  
**Depends on:** T-010, T-013

#### 목표
중요한 진화 순간을 거래 가능한 별도 NFT로 남기는 컨트랙트를 만든다.

#### 작업
- [ ] ERC-721 컨트랙트 구현
- [ ] milestone type enum 정의
- [ ] mint auth 정책 정리
- [ ] tokenURI 고정 메타데이터 구성
- [ ] 테스트 작성

#### 산출물
- Snapshot Relic contract

#### Acceptance Criteria
- [ ] milestone별로 별도 민팅이 가능하다.
- [ ] Soul Core와 역할이 혼동되지 않는다.
- [ ] 메타데이터가 안정적으로 조회된다.

---

### T-019 [P1][AI] Major Evolution 재렌더링
**Owner:** AI  
**Estimate:** 0.75d  
**Depends on:** T-009, T-013

#### 목표
특정 마일스톤에서만 전체 이미지를 한 단계 더 진화된 형태로 재생성한다.

#### 작업
- [ ] major milestone 조건 정의
- [ ] reference image 기반 재렌더 프롬프트 작성
- [ ] before/after 비교 화면 구성
- [ ] 실패 시 overlay만 유지하는 fallback 처리

#### 산출물
- rerender endpoint
- before/after asset examples

#### Acceptance Criteria
- [ ] 동일 캐릭터라는 연속성이 유지된다.
- [ ] 최소 2개 milestone에 대해 재렌더 샘플이 나온다.
- [ ] 실패해도 기존 캐릭터가 사라지지 않는다.

---

### T-020 [P1][BE] Unibase memory integration
**Owner:** BE  
**Estimate:** 0.75d  
**Depends on:** T-015

#### 목표
mutation diary와 milestone history를 외부 memory layer에 저장하는 연동을 붙인다.

#### 작업
- [ ] integration adapter 작성
- [ ] 저장 대상 필드 최소화
- [ ] retry/timeout 처리
- [ ] off switch 추가

#### 산출물
- memory adapter

#### Acceptance Criteria
- [ ] mutation summary를 외부 memory에 쓸 수 있다.
- [ ] raw conversation 저장 경로가 없다.
- [ ] 연동 실패 시 서비스 핵심 흐름은 유지된다.

---

### T-021 [P0][FE/BE] 오류 처리/로딩/폴리싱
**Owner:** FE/BE  
**Estimate:** 0.5d  
**Depends on:** T-011 ~ T-017

#### 목표
데모 중 무너지는 지점을 줄인다.

#### 작업
- [ ] 로딩 스켈레톤 추가
- [ ] API 실패 메시지 정리
- [ ] 지갑 미연결/잘못된 네트워크 처리
- [ ] 빈 데이터 상태 처리
- [ ] 화면 문구 정리

#### 산출물
- polished UX states

#### Acceptance Criteria
- [ ] 대표 에러 케이스 5종이 무너지지 않는다.
- [ ] 사용자가 지금 무엇을 해야 하는지 항상 보인다.
- [ ] 데모 도중 빈 화면이 나오지 않는다.

---

### T-022 [P0][PM] 제출 패키지 제작
**Owner:** PM  
**Estimate:** 0.75d  
**Depends on:** T-017, T-021

#### 목표
해커톤 제출에 필요한 설명, 데모 영상, README를 완성한다.

#### 작업
- [ ] README 작성
- [ ] 2분 발표 스크립트 작성
- [ ] 데모 영상 촬영
- [ ] 심사 기준 대응 문구 정리
- [ ] repo 공개 상태 점검

#### 산출물
- README
- pitch script
- demo video
- submission text

#### Acceptance Criteria
- [ ] 2분 안에 핵심 메시지가 전달된다.
- [ ] 영상만 봐도 제품 구조가 이해된다.
- [ ] repo 첫 화면에서 설치/실행이 가능하다.

---

### T-023 [P1][FE] Wallet Compare / Gallery 뷰
**Owner:** FE  
**Estimate:** 0.5d  
**Depends on:** T-012, T-016

#### 목표
서로 다른 archetype을 나란히 보여줘 구경하는 재미를 만든다.

#### 작업
- [ ] 샘플 지갑 비교 카드 구현
- [ ] archetype 필터 추가
- [ ] 대표 캐릭터 썸네일 갤러리 구성

#### Acceptance Criteria
- [ ] 최소 3개 archetype이 한 화면에 비교된다.
- [ ] 커뮤니티 투표용 이미지로 활용 가능하다.

---

### T-024 [P2][BE/AI] 후속 로드맵 문서화
**Owner:** PM/BE/AI  
**Estimate:** 0.25d  
**Depends on:** T-022

#### 목표
해커톤 이후 방향을 짧고 명확하게 정리한다.

#### 작업
- [ ] Snapshot 확장
- [ ] PvP/leaderboard 아이디어
- [ ] optional social posting
- [ ] optional agent workflow

#### Acceptance Criteria
- [ ] 현재 MVP와 미래 기능의 경계가 명확하다.
- [ ] 이번 제출물의 범위를 침범하지 않는다.

---

## 4. 추천 실행 순서

### Day 1
- T-001
- T-002
- T-003 시작

### Day 2
- T-003 마감
- T-004
- T-005

### Day 3
- T-006
- T-007
- T-008

### Day 4
- T-009
- T-010

### Day 5
- T-011
- T-012

### Day 6
- T-013
- T-014

### Day 7
- T-015
- T-016

### Day 8
- T-017
- T-021

### Day 9
- T-022
- T-018 또는 T-020 중 하나 선택

---

## 5. 솔로 개발 기준 절대선
시간이 부족하면 아래만 끝내고 제출한다.

### 반드시 살릴 것
- T-003
- T-005
- T-006
- T-007
- T-009
- T-010
- T-011
- T-012
- T-013
- T-014
- T-015
- T-016
- T-017
- T-022

### 버려도 되는 것
- T-018
- T-019
- T-020
- T-023
- T-024

---

## 6. 최종 기준
제출 직전 아래 질문에 모두 "예"여야 한다.

1. 지갑 연결 후 archetype이 30초 안에 나온다.
2. 캐릭터가 실제로 생성되거나 최소 placeholder로라도 나타난다.
3. 민팅 흐름이 한 번은 성공한다.
4. 거래 이벤트 재생 시 trait가 바뀐다.
5. mutation diary가 보인다.
6. 공유 카드가 생성된다.
7. 외부 API가 죽어도 Replay Mode는 돈다.

이 7개가 되면 제출 가능 상태다.
