# DegenBorn

> [!NOTE]
> **Archived (2026-09).** 이 프로젝트는 더 이상 개발되지 않습니다. 모든 배포(Vercel web, Railway worker)는 내려갔고, 리포는 읽기 전용으로 보관됩니다. 로컬 실행은 아래 *Getting Started* / Replay Mode로 여전히 가능합니다.

> **We are not making another NFT. We are turning wallet behavior into a living identity.**

DegenBorn is an AI identity engine for Four.meme traders. Connect your wallet, receive your Persona DNA, and watch your on-chain behavior evolve into a unique monster character — the Soul Core.

---

## Demo

**Live Demo**: 종료됨 (프로젝트 아카이브)  
**Replay Mode**: `/replay` — runs offline, no API keys required

### 2-minute demo flow
1. Connect wallet
2. "You are: **Rug Necromancer**" — DNA revealed
3. Genesis character appears
4. Win streak → Crown acquired
5. Rug event → Zombie eyes, corruption rises
6. Comeback → Revenge aura ignites
7. Mutation Diary opened
8. Share card generated

---

## Architecture

```
[Wallet + Four.meme activity]
         ↓
[Data Adapter: Moralis / Covalent / fixture]
         ↓
[Normalizer + Event Store]
         ↓
[Persona DNA Scoring Engine] ──────────────→ 5 scores (0–100)
         ↓
[Archetype Classifier] ────────────────────→ 1 of 6 archetypes
         ↓
[LLM Narrative Builder]   [Image Pipeline]   [State Machine]
         ↓                       ↓                  ↓
[Mutation Diary]          [Base + Overlays]   [Soul Core State]
                ↘                ↓           ↙
                  [Frontend: Birth / Monster Room / Share]
                                 ↓
                        [Soul Core NFT — BNB Chain]
```

---

## Persona DNA

| Axis | Description |
|------|-------------|
| **Aggression** | Trade frequency, short hold ratio, re-entry rate |
| **Conviction** | Avg hold duration, token concentration, repeat buys |
| **Chaos** | PnL volatility, rug events, big losses |
| **Luck** | Profitable sell ratio, early entries, big wins |
| **Survival** | Recovery count, comeback streaks, persistence |

All scores: **0–100, deterministic** (same events → same DNA always).

## Archetypes

| Archetype | Trigger Conditions |
|-----------|-------------------|
| Mad Gambler | Aggression≥65 + Chaos≥65 + Luck<65 |
| Ice Whale | Conviction≥65 + Luck≥65 |
| Rug Necromancer | Chaos≥65 + Survival≥65 |
| Diamond Cultist | Conviction≥65 + Luck<35 + Survival≥65 |
| Sniper Jester | Aggression≥65 + Luck≥65 |
| Ghost Bagholder | Conviction≥65 + Chaos≥65 + Survival<35 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Wallet | wagmi v2, viem, injected connector |
| Backend | Next.js API routes (Node.js) |
| Data | Moralis / Covalent → normalized event store |
| AI — Narrative | OpenAI GPT-4o-mini (template fallback) |
| AI — Image | DALL-E 3 (SVG placeholder fallback) |
| Smart Contract | Solidity 0.8.24 + OpenZeppelin 5, Hardhat |
| Chain | BNB Smart Chain (testnet + mainnet) |
| Memory | In-memory (Postgres upgrade path documented) |
| Monorepo | pnpm workspaces |

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 9

### Install

```bash
pnpm install
```

### Configure

```bash
cp .env.example apps/web/.env.local
# Fill in API keys (all optional — app works with fixtures)
```

### Run (development)

```bash
# Web app
pnpm --filter @degenborn/web dev
# → http://localhost:3000

# Try Replay Mode (no API keys needed)
# → http://localhost:3000/replay
```

### Test

```bash
# Scoring engine (8 tests)
pnpm --filter @degenborn/scoring test

# Archetype classifier (8 tests)
pnpm --filter @degenborn/archetype test

# State machine (11 tests)
pnpm --filter @degenborn/web test

# Soul Core contract (14 tests)
cd packages/contracts && npx hardhat test
```

### Build

```bash
pnpm build
```

### Deploy Smart Contract

```bash
cd packages/contracts
cp ../../.env.example .env
# Set PRIVATE_KEY and BSC_TESTNET_RPC
npx hardhat run scripts/deploy.ts --network bscTestnet
```

---

## Project Structure

```
degenborn/
├── apps/
│   ├── web/          # Next.js frontend + API routes
│   └── worker/       # CLI worker for wallet processing
├── packages/
│   ├── shared/       # TypeScript types + prompt templates
│   ├── scoring/      # Deterministic DNA scoring engine
│   ├── archetype/    # Archetype classifier (rule-tree)
│   ├── data-adapter/ # Moralis/Covalent/fixture adapters
│   └── contracts/    # SoulCore.sol + Hardhat
├── fixtures/
│   ├── wallets/      # Sample wallet event JSONs (3 archetypes)
│   └── replay/       # Demo preset for offline presentation
└── docs/
    └── spec.md       # Scoring, archetype, state, trait rules
```

---

## Soul Core NFT

- **Standard**: ERC-721
- **Network**: BNB Smart Chain
- **Transferable**: No (Soulbound Token pattern)
- **Per wallet**: Max 1
- **On-chain data**: `dnaHash`, `stateHash`, `archetype`, `tokenURI`
- **Off-chain data**: Full metadata, character image (IPFS / hosted)

State updates (evolution) are written on-chain by the backend admin via `updateState()`.

---

## What's In Scope (MVP)

- [x] Wallet connection
- [x] On-chain data collection (Moralis / Covalent / fixture)
- [x] Persona DNA scoring (5 axes, deterministic)
- [x] Archetype classification (6 types, rule-tree)
- [x] Genesis character generation (DALL-E 3 + SVG fallback)
- [x] Soul Core NFT contract (soulbound, BNB Chain)
- [x] Soul Core minting flow
- [x] Character state machine (9 event types)
- [x] Trait overlay engine (12 traits, Canvas compositor)
- [x] Mutation Diary
- [x] Share card + meme caption (no auto-posting)
- [x] Replay Mode (offline, fixture-based)

## What's Out of Scope

- Automated trading
- Automated X/Twitter posting
- Tax-precision PnL accounting
- All state on-chain (only hash is on-chain)
- Raw conversation storage

---

## Judges

**Innovation**: Wallet behavior → living identity. Not another static NFT.  
**Technical**: Deterministic scoring engine + rule-tree archetype + state machine + soulbound contract + image pipeline.  
**Practical Value**: Retention loop for Four.meme — trading → character growth → community sharing.  
**Presentation**: Character reveal is a moment. Evolution is visual. Diary tells the story.

---

## License

MIT

---

*Built for the Four.meme AI Sprint Hackathon · April 2026*
