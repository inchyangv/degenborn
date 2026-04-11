# DegenBorn 배포 가이드

## 1. 사전 준비

### WalletConnect Project ID
1. https://cloud.walletconnect.com 접속
2. 새 프로젝트 생성 → Project ID 복사
3. 아래 환경변수에 입력

### BSC Testnet BNB 충전
- **배포 지갑 주소: `0xaAaF2143E63A6ce99369C8889129C34c4fa018ab`**
- 퍼싯: https://testnet.bnbchain.org/faucet-smart
- 필요량: 최소 0.1 tBNB (두 컨트랙트 배포)

---

## 2. 컨트랙트 배포 (지갑 충전 후)

```bash
cd packages/contracts

# SoulCore 배포
pnpm exec hardhat run scripts/deploy.ts --network bscTestnet

# SnapshotRelic 배포
pnpm exec hardhat run scripts/deploy-relic.ts --network bscTestnet
```

배포 완료 후 `packages/contracts/deployments/bscTestnet.json`에 주소 자동 저장.

---

## 3. Vercel 배포 (Web App)

### 방법 A: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 방법 B: GitHub 연동
1. https://vercel.com/new → GitHub 레포 import
2. **Root Directory**: 비워두기 (repo root 그대로)
3. Framework: Next.js (자동 감지)
4. 아래 환경변수 입력 후 Deploy

### Vercel 환경변수 (필수)
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# WalletConnect (cloud.walletconnect.com에서 발급)
NEXT_PUBLIC_WC_PROJECT_ID=<your_walletconnect_project_id>

# BSC RPC
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_CHAIN_ID=97

# 컨트랙트 주소 (배포 후 입력)
NEXT_PUBLIC_SOUL_CORE_ADDRESS=<from deployments/bscTestnet.json>

# AI (이미지 생성, 서사 생성)
OPENAI_API_KEY=<your_openai_key>

# 데이터 소스 (둘 중 하나)
DATA_SOURCE=moralis
MORALIS_API_KEY=<your_moralis_key>
# 또는
# DATA_SOURCE=covalent
# COVALENT_API_KEY=<your_covalent_key>

# Diary 영속화 (Vercel은 서버리스라 /tmp 유실됨 — Replay Mode 사용)
# DIARY_PERSIST_PATH=/tmp/degenborn_diary.json  ← Vercel에서는 생략
```

---

## 4. Railway 배포 (Worker — 선택 사항)

Worker는 현재 별도 프로세스 없이 Next.js API routes로 처리 가능.
향후 cron job이나 이벤트 폴링이 필요해지면 Railway에 `apps/worker` 배포.

```bash
# Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up --service worker --dir apps/worker
```

---

## 5. 배포 순서 체크리스트

- [ ] BSC testnet BNB 퍼싯에서 `0xaAaF2143E63A6ce99369C8889129C34c4fa018ab` 충전
- [ ] `pnpm exec hardhat run scripts/deploy.ts --network bscTestnet` 실행
- [ ] `pnpm exec hardhat run scripts/deploy-relic.ts --network bscTestnet` 실행
- [ ] `packages/contracts/deployments/bscTestnet.json` 확인 (주소 기록됨)
- [ ] WalletConnect project ID 발급
- [ ] Vercel 환경변수 입력
- [ ] Vercel 배포 (`vercel --prod`)
- [ ] `NEXT_PUBLIC_APP_URL` 실제 URL로 업데이트
- [ ] BSCScan에서 tx hash 조회 확인
- [ ] README에 tx hash 기록

---

## 6. 배포 후 확인

```bash
# 메타데이터 엔드포인트 테스트
curl https://your-app.vercel.app/api/metadata/0xaAaF2143E63A6ce99369C8889129C34c4fa018ab

# OG 이미지 확인
open https://your-app.vercel.app/api/og/0xaAaF2143E63A6ce99369C8889129C34c4fa018ab

# Analyze 테스트
curl -X POST https://your-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"wallet":"0xaAaF2143E63A6ce99369C8889129C34c4fa018ab","useFixture":true}'
```

---

## 7. BSCScan 컨트랙트 검증 (선택)

```bash
cd packages/contracts
pnpm exec hardhat verify --network bscTestnet <SOUL_CORE_ADDRESS>
pnpm exec hardhat verify --network bscTestnet <SNAPSHOT_RELIC_ADDRESS>
```
