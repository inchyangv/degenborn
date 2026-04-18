# DegenBorn — TODO (Meme & Product Improvement Backlog)

> 이 문서는 PROJECT.md / docs/roadmap.md를 보완한다.
> "지금 MVP는 됐다. 그럼 진짜 밈처럼 퍼지고, Four.meme의 중력장에 더 깊이 박히려면 무엇이 필요한가"를 정리한다.
>
> 분류
> - **MEME**: 자산 자체의 밈성/공유성/재미 강화
> - **F4M**: Four.meme 생태계 연동 심화 (이게 곧 차별화)
> - **PROD**: 온보딩, 리텐션, 디스트리뷰션 같은 프로덕트 본체
> - **ECON**: Soul Core / Relic / 토큰성 결정
> - **OPS**: 측정/실험/리스크 관리
>
> 우선순위
> - **P0** = 해커톤 마감 전(2026-04-26) 또는 투표기간(~05-02) 내에 viral 효과를 만드는 것
> - **P1** = 해커톤 후 첫 30일 내 (Phase 2 윈도우)
> - **P2** = 그 이후, 가설 검증되면 한다

---

## 0. 현 상태 진단 (왜 이 TODO가 필요한가)

**잘 된 것**
- 캐릭터, DNA, 아키타입, 진화, 일기까지 "정체성 엔진"의 본체는 완성.
- 페이지 30+개, replay 모드까지 갖춘 데모는 해커톤 평가용으로 완비.
- "Rules decide. AI expresses." 라는 디자인 원칙이 일관됨.

**약한 것 — 솔직하게**
1. **밈성이 캐릭터 일러에 갇혀 있다.** Monster는 정적 이미지. 진짜 밈은 *복제 가능한 포맷*에서 나온다 ("내 X가 Y 됨" 류).
2. **Four.meme과의 연결이 "필터링" 수준이다.** 라우터/팩토리 주소 인식은 했지만, 캐릭터의 *살*이 Four.meme 토큰 자체를 입고 있지 않다. 어떤 토큰이든 똑같이 추상화된다.
3. **공유 자산이 한 번 보고 끝.** Share card 1장, 캡션 1줄. 사람들이 *연속해서* 만들고 싶을 동인이 없다.
4. **리텐션 루프가 깨져 있다.** monster를 만든 뒤 다시 올 이유가 약하다. 거래는 외부에서 일어나는데 알림이 없다.
5. **디젠 문화의 톤이 너무 점잖다.** 디젠은 self-deprecating + savage가 기본인데, 우리 카피는 "evolving identity" 같은 SaaS 말투에 가까운 구간이 있다.
6. **모바일/텔레그램이 없다.** 1차 타겟인 Four.meme 디젠은 모바일 + TG 거주민이다. 웹사이트만으로는 도달이 막힌다.

이 6가지가 아래 TODO의 뿌리다.

---

## 1. MEME — 자산 자체를 더 밈답게 만든다

### 1.1 [P0] 복제 가능한 밈 포맷 제작 (Format Memes)
**문제**: 현재 share card는 "내 monster 봐" 1패턴이다. 진짜 viral한 건 *템플릿* 이다.
**할 것**:
- "POV: you opened your DegenBorn" 4컷 만화 자동 생성기
- "tag yourself" 그리드 (6 archetypes를 3x2로 박은 뒤 본인 archetype에 화살표)
- "X said: '_______'. Their monster:" 인용형 카드
- "before / after rugpull" 좌우 대비 카드 (현재 Replay 데이터로 충분히 만들 수 있음)
- 최소 4개 템플릿을 `/studio`에 추가하고 1탭 공유로 묶기.

### 1.2 [P0] 카피 톤 한 단계 더 savage로
**문제**: "Your wallet has a personality"는 좋지만 후속 문장이 점잖다.
**할 것**:
- 모든 archetype tagline 한 번 더 갈기. 예: "Rug Necromancer — Your portfolio died. You didn't" → "still here. somehow."
- AI 생성 일기/캡션 프롬프트에 "use degen vernacular: ngmi, jeet, exit liq, ape, fumble the bag" 강제 어휘 5~10개 주입.
- 점잖은 카피와 savage 카피를 페이지별로 매칭: 랜딩=점잖음(처음 본 사람용), 일기/공유카드=savage.

### 1.3 [P0] Animated 자산 (정적 → 움직이는 것)
**문제**: 트위터 알고리즘은 GIF/비디오를 정적 이미지보다 띄운다.
**할 것**:
- Genesis 등장 5초 GIF 자동 생성 (현재 birth 화면 캡처 → server-side ffmpeg)
- "trait gain" 5초 GIF (왕관 떨어지는 / 좀비화 / 부활)
- Lottie 또는 단순 CSS keyframe 기반 sticker 6개 (`/stickers` 강화) — 이게 텔레그램 sticker pack으로 바로 발전한다.

### 1.4 [P1] 시그니처 사운드 / 짧은 보이스
**문제**: 디젠 트위터는 음성 콘텐츠 거의 없음. 작은 디퍼런시에이터.
**할 것**: archetype별 12초 voice line 6개 (eleven labs). monster room에서 누르면 재생. 공유 비디오에 자동 삽입.

### 1.5 [P1] "Wanted Poster" / "Obituary" 자동 생성
- 큰 손실 발생 시: 자동 WANTED 포스터 (액수, 토큰명, monster 얼굴)
- 토큰 사망 시: 1줄 추도사 + monster가 우는 컷
- 둘 다 즉시 공유 가능한 1080x1080.

### 1.6 [P1] Cursed Mode — Roast Battle
- 두 지갑 입력 → AI가 둘 다 가차없이 깐 뒤 승자 선언
- "둘 다 졌다" 결과도 가능하게 (디젠 유머)
- 매일 1쌍을 자동 큐레이션해서 트위터 봇으로 게시

### 1.7 [P2] Yearbook / Class Photo
- 시즌 끝나면 모든 monster를 한 그리드에 박은 "졸업앨범"
- 각자 1줄 sound bite ("most likely to get rugged twice in one day")

---

## 2. F4M — Four.meme 연동을 "필터"에서 "DNA의 살" 수준으로

이게 다른 어떤 AI×Web3 프로젝트도 못 하는 진짜 moat이다.
현재는 *Four.meme 거래만 카운트*하는 수준. 아래는 캐릭터의 *모양과 색* 이 Four.meme 토큰 자체에 묶이게 만드는 것.

### 2.1 [P0] Token-to-Trait 매핑 (보유 토큰이 곧 외형)
**문제**: 지금은 어떤 밈코인을 들고 있든 trait는 동일하다.
**할 것**:
- 보유 중인 Four.meme 토큰 top 3의 *심볼/색상/이모지*를 monster의 옷·악세사리·배경에 즉시 반영.
- "$PEPE 보유 → 개구리색 후드", "$BONK 보유 → 강아지 귀". 이는 AI 재렌더가 아닌 overlay로 해결 가능.
- 토큰별 metadata는 Four.meme API 또는 BSC로 1회 fetch + 캐시.
- *결과*: monster가 곧 "내가 어떤 밈을 입고 있는지" 보여주는 광고판이 됨. 토큰 커뮤니티가 알아서 공유한다.

### 2.2 [P0] Bonding Curve Stage Trait
- Four.meme 토큰은 bonding curve 단계가 핵심. (early → 50% → graduated to PancakeSwap)
- 보유 토큰의 curve 진행률에 따라 monster에 "early believer halo" / "graduate medal" trait 부여.
- 이게 *Four.meme 고유* 메커니즘과 캐릭터를 묶는 첫 번째 진짜 다리.

### 2.3 [P0] Creator-Monster 가계도 (Family Tree)
**문제**: 현재 creator trait가 있긴 한데 시각화가 약함.
**할 것**:
- "내가 launch한 토큰 → 그 토큰을 산 trader들 = 내 자식 monsters"
- monster room에 "Children: 412 monsters spawned from your tokens" 카운터
- 부모-자식 monster들 사이에 시각적 가계도 페이지 (`/family/[wallet]`)
- *결과*: token creator는 자기 가계도를 자랑한다. 자기 토큰 마케팅을 우리가 공짜로 받는다.

### 2.4 [P0] Four.meme 토큰 페이지용 Embed Widget
**문제**: 우리 사이트로 끌어와야만 monster가 보인다. 거꾸로 가야 한다.
**할 것**:
- 임의 Four.meme 토큰 컨트랙트 주소 → 그 토큰의 top 10 holder monsters를 보여주는 임베드 위젯 (`/api/widget/token/[address]`)
- iframe 1줄 + open graph image. 토큰 디스커션이 일어나는 곳(텔레그램, 트위터)에 그대로 뿌려짐.
- 이미 wallet widget은 있음 (`/api/widget/[wallet]`) — 토큰 버전을 추가하면 됨.

### 2.5 [P1] "Patron Saint" / "Top Holder Monster"
- 각 Four.meme 토큰의 최대 holder monster를 그 토큰의 *수호성인*으로 자동 지정.
- 토큰 페이지에 "Patron Saint: [monster]" 표시.
- holder가 바뀌면 정통성 이동 (드라마 발생).

### 2.6 [P1] Pack / Cult Formation
- 같은 토큰을 보유한 monster들 자동 그룹핑 → "Pack of $XYZ"
- pack 페이지: monster 목록 + 평균 DNA + 평균 hold time + pack mood
- 같은 pack monster끼리만 가능한 trait gift 등 가벼운 social.

### 2.7 [P1] Loyalty Score 강화 (이미 부분 구현됨)
- 단순 "Bronze/Diamond" 등급에서 → Four.meme 거래 / 비-Four.meme BSC 거래 비율로 *순도(Purity)* 표기.
- "99.4% Four.meme native" 같은 자랑 가능한 숫자.

### 2.8 [P1] Real-time Trade Webhook → Monster Mutation
- 현재는 사용자가 페이지 열어야 점수 갱신.
- Four.meme 거래 발생 → 1분 내 monster 상태 갱신 + push.
- BNB 노드 webhook 또는 Moralis stream을 mutation processor에 연결.

### 2.9 [P1] Telegram Bot — `@DegenBornBot`
- `/born <wallet>` → DNA + archetype + monster 1장
- `/today` → 오늘의 top monster
- `/roast <wallet>` → savage 1줄
- TG가 Four.meme 디젠의 거주지인데 우리 도달이 0이다. 이거 하나만으로 도달 5~10배.

### 2.10 [P2] Four.meme 공식 통합 제안 패키지
- 위 widget + bot + 분석 엔드포인트를 묶어서 Four.meme 팀에 통합 제안.
- 우리 가치제안: "유저 한 명이 토큰 사면 monster가 변한다 → 다시 거래하러 옴 → Four.meme 거래량 ↑". 이걸 숫자로 보여줄 수 있는 데모 대시보드 1장 만들 것.

---

## 3. PROD — 프로덕트 본체 (온보딩 / 리텐션 / 도달)

### 3.1 [P0] No-wallet 진입로 강화
**문제**: 디젠이 우리 사이트 처음 봤을 때 지갑 connect는 cognitive cost가 크다.
**할 것**:
- 랜딩 첫 화면에 "wallet 주소만 붙여넣어도 봐줌" 입력칸 (read-only mode).
- "지갑 없음? 1분 퀴즈로 archetype 받기" CTA (퀴즈 페이지 이미 존재 — 랜딩에서 더 크게 노출).
- 데모 wallet 4종을 "예시로 보기" 버튼으로 1탭 노출.

### 3.2 [P0] 첫 5초 임팩트
- 현재 birth는 30초. 좋지만 첫 5초 안에 *결과 이미지의 일부*가 살짝 보여야 한다.
- 스캔 중에 silhouette만 어둡게 노출 → DNA 결정 시 색이 들어옴. (사용자 이탈률 ↓)

### 3.3 [P0] One-tap Share — 공유 마찰 제거
- 현재 share card 만들고 직접 트위터로 가야 함.
- "Share to X" 버튼 → 카드 + 캡션 + 해시태그 + Four.meme 멘션 자동 prefill (intent URL).
- 카드 다운로드와 동시에 클립보드에 캡션 자동 복사.

### 3.4 [P0] Daily Hook — 다시 올 이유
- "Daily Horoscope" 페이지가 이미 있음 — 이걸 *이메일/푸시*로 보낼 수 있어야 동력이 됨.
- 일단 PWA installable + Web Push 구현. 매일 1회 "오늘 너의 monster mood" 푸시.
- 필요시 monster room 진입 시점에 "어제 대비 변화" 1줄 banner.

### 3.5 [P1] Mobile 최적화 패스
- 현재 페이지들 모바일에서 일부 깨질 가능성 → 30+개 페이지 빠른 audit.
- monster room을 모바일 vertical 스토리 포맷으로도 볼 수 있게 (스와이프 카드).

### 3.6 [P1] PWA + Add to Home Screen 유도
- monster를 폰 홈에 두면 정체성 표현이 *완성*된다.
- monster 이미지 = PWA 아이콘 (사용자 monster를 본인 폰 아이콘으로).

### 3.7 [P1] Friend Graph
- "내 친구 monster들" — 지갑 1개 입력하면 그 지갑이 자주 거래한 카운터파티의 monster들을 보여줌.
- 이게 viral coefficient를 올리는 가장 강력한 mechanic.

### 3.8 [P2] Localization
- 한국어 / 중국어 (Four.meme의 1차 시장) 카피 패스. 점잖은 번역이 아니라 *각 시장의 디젠 슬랭*으로.

---

## 4. ECON — Soul Core / Relic / 토큰성

### 4.1 [P0] Snapshot Relic은 transferable로 가야 한다 (확인)
- 현재도 그렇게 설계되어 있음 — 컨트랙트 실제 거래성 검증 필요.
- 마일스톤 자동 트리거 (state-machine에서 임계점 도달 시 자동 mint 제안).

### 4.2 [P1] Burn-to-Boost
- Relic을 burn → Soul Core stat +5 (영구).
- 공급 자연 감소 + 진성 보유자 보상.

### 4.3 [P1] Adoption / Pairing (다음 세대 monster)
- 두 Soul Core 지갑이 상호 동의하면 "child Soul Core" 발행 (DNA 합성 규칙은 deterministic).
- soulbound 두 부모 + transferable 1자식 → 새로운 economy 단위.
- 이건 너무 빨리 풀면 ECON이 망가지므로 P1 신중하게.

### 4.4 [P2] DEGEN 토큰은 의도적으로 만들지 않는다 (재확인)
- roadmap.md의 "ever excluded"와 일관 유지.
- 단, *외부 토큰 가격 신호*를 캐릭터에 결합하는 건 토큰 발행이 아님 — OK.

---

## 5. OPS — 측정과 실험

### 5.1 [P0] Funnel 분석
- 현재 analytics.ts 있음 — 다음 5개 conversion만 정확히 잡으면 됨:
  1. Landing 도착
  2. wallet 입력 / connect
  3. archetype 공개 도달
  4. share card 본 것
  5. 실제 share 클릭
- 매일 그래프 1장 (Slack/Discord/이메일 — 어떤 거든) 받으면 의사결정이 빨라짐.

### 5.2 [P0] A/B 한 번 — 카피 톤
- Landing tagline 2버전 (점잖음 vs savage) → connect 전환율로 단순 비교.
- 1주일이면 결론 남.

### 5.3 [P1] 자동 큐레이션 봇
- 매일 흥미로운 monster 1개 자동 선정 (가장 큰 mutation, 가장 극적인 회복) → 자동 트윗 초안 생성 → *사람이 1탭 승인*.
- 자동 포스팅은 원칙상 금지지만 "1탭 승인"은 사람 결정에 부합.

### 5.4 [P1] 부정행위 / 어뷰징 가드
- archetype/loyalty 점수 컨테스트화되면 wash trade로 점수 부풀리기 시도 발생.
- 의심 시그니처 (단일 카운터파티 반복, 즉시 같은 토큰 환매) 감지 → "Suspicious Trader" 음성 trait 또는 점수 디스카운트.

### 5.5 [P2] Cost monitoring
- DALL-E genesis + GPT 캡션의 1유저당 비용 측정.
- 무료 사용자 → 캡션 fallback (template), genesis는 AI. 합리적 caps.

---

## 6. 해커톤 마감(2026-04-26) 전 P0 권장 실행 순서

> 우리에게 남은 시간은 **8일**. 새로운 건 작게, 기존 자산 증폭에 집중.

| Day | 작업 | 카테고리 |
|-----|------|----------|
| D1 (4/19) | 1.2 카피 savage 패스 + 1.3 GIF 생성 파이프라인 1개 (Genesis 등장) | MEME |
| D2 (4/20) | 2.1 Token-to-Trait overlay (top 1 토큰만이라도) | F4M |
| D3 (4/21) | 1.1 Format meme 템플릿 4개 → /studio | MEME |
| D4 (4/22) | 2.4 Token widget endpoint + OG image | F4M |
| D5 (4/23) | 3.3 One-tap share + 3.1 no-wallet 입력칸 | PROD |
| D6 (4/24) | 2.9 Telegram bot MVP (`/born <wallet>`만) | F4M |
| D7 (4/25) | 5.1 funnel + 1.7 Wanted/Obituary 자동 생성 | OPS+MEME |
| D8 (4/26) | 제출 + 3.4 daily push 텍스트 1탭 발송 | PROD |

이 8개만 하면:
- F4M moat가 시연 가능한 수준이 된다 (token widget + token-to-trait).
- 밈 viral 표면이 6배 늘어난다 (1개 카드 → format meme 4종 + GIF + 봇).
- 도달 채널이 웹 1개 → 웹 + TG로 늘어난다.

---

## 7. "절대 안 한다" — 재확인 (scope creep 방지)

roadmap.md에 이미 있지만 한 번 더 못 박는다:

- 자동매매 / 카피트레이딩
- 자동 X 포스팅 (1탭 승인은 OK, *사람 없는* 포스팅 금지)
- DEGEN 토큰 발행
- 세무 정확도 PnL
- raw 대화 저장
- 모든 상태 온체인 저장

이 6개 중 어떤 것에라도 손이 가려면 먼저 PROJECT.md 23절 "고정 결정사항"을 수정해야 한다.

---

## 8. 한 줄 요약

> **현재의 DegenBorn은 좋은 캐릭터 엔진이다. 다음 단계는 "Four.meme 토큰 그 자체가 monster의 살이 되는 것" 과 "monster가 복제 가능한 밈 포맷으로 퍼지는 것" 이다.**

이 두 축에 P0 노력을 모은다. 나머지는 가설이 검증된 뒤에 한다.
