# DegenBorn — Post-Hackathon Roadmap

This document defines what comes after the MVP.
The boundary between MVP and roadmap is intentional — scope inflation kills hackathons.

---

## Current MVP Scope (shipped)

| Feature | Status |
|---------|--------|
| Wallet connect + DNA analysis | ✅ |
| Archetype classification (6 types, rule-tree) | ✅ |
| Genesis character generation | ✅ |
| Soul Core NFT (soulbound, BNB Chain) | ✅ |
| State machine (9 event types) | ✅ |
| Trait overlay engine (12 traits) | ✅ |
| Mutation Diary | ✅ |
| Share card + meme caption | ✅ |
| Replay Mode (offline) | ✅ |
| Snapshot Relic contract (6 milestone types) | ✅ |
| Major Evolution re-rendering | ✅ |
| Unibase memory integration | ✅ |
| Gallery / Compare view | ✅ |

---

## Phase 2 — Snapshot Expansion

**Goal**: Make Snapshot Relics into a meaningful collectible economy.

### What
- Auto-detect milestone events from state machine transitions
- Backend triggers Snapshot Relic mint on milestone completion
- Relic marketplace listing support (OpenSea / BNB Chain native)
- Relic burn mechanic: burn relic to boost character stat by +5

### Why
- Soul Core is identity. Snapshot Relic is history. Both should have utility.
- Burn mechanic creates demand without inflating supply.

### Boundary
- Does NOT overlap with Soul Core identity mechanics
- Relic economy runs separately from character evolution

---

## Phase 3 — PvP / Leaderboard

**Goal**: Community dynamics — who's the biggest degen this week?

### What
- Weekly leaderboard: top survival streaks, highest aggression, most rugs survived
- Archetype leaderboard: best Ice Whale, worst Mad Gambler (chaos score)
- Character duels: compare DNA side-by-side with win/lose judgment (rule-based, no betting)
- Community gallery: public-facing wall of all minted Soul Cores

### Why
- 30% of hackathon score is community vote — leaderboard feeds engagement
- Competitive identity is stickier than static NFT

### Boundary
- No real-money betting or wagering mechanics
- Win/lose is cosmetic only (no on-chain value transfer)
- Leaderboard data is public — wallet addresses are pseudonymous

---

## Phase 4 — Optional Social Posting

**Goal**: Let users broadcast their monster moment — on their terms.

### What
- X (Twitter) OAuth integration: user grants permission explicitly
- One-tap share button: posts pre-generated card + caption to X
- Share preview before posting (never surprise-posts)
- Post history: view what has been shared (deletable)

### Why
- Community vote at 30% — shareable content directly improves vote outcomes
- Auto-post is a red flag (spam). Opt-in post is a feature.

### Rules (non-negotiable)
- User initiates every post explicitly (no scheduled or auto posts)
- No posting on behalf without active session
- Rate limit: max 3 posts per wallet per day

### Boundary
- This phase is explicitly excluded from MVP
- Adding it before Phase 2–3 stabilizes would distract from core

---

## Phase 5 — Agent Workflow (Experimental)

**Goal**: Let the character "respond" to wallet events with narrative commentary.

### What
- On-chain event webhook triggers narrative generation
- Agent produces short diary entry + social copy for each mutation
- Agent can suggest but never auto-post
- Optional: agent proposes next action (e.g., "your survival streak is at 4 — one more makes skull ring")

### Why
- AI identity engine evolving in response to real behavior → genuine engagement loop
- Mutation commentary makes the diary feel alive

### Rules (non-negotiable)
- Agent output is always reviewed before any external action
- No financial advice in agent output (inherit T-008 safety rules)
- No autonomous on-chain transactions
- No raw conversation storage (agent state = character state only)

### Boundary
- This is P2 / post-hackathon only
- MVP diary is deterministic — this adds LLM flavor, not replacement

---

## What Will Not Be Built (Ever)

These are **not roadmap items** — they are explicitly excluded:

| Feature | Why excluded |
|---------|-------------|
| Automated trading / copy trading | Regulatory risk, misaligned with product |
| Fully automated X posting | Spam risk, user trust |
| Tax-precision PnL accounting | Out of scope, specialized problem |
| Storing raw conversation text | Privacy principle, architectural constraint |
| All state on-chain | Gas cost, not needed; hash is sufficient |
| Token launch (DEGEN token) | Distraction; platform value ≠ token value |

---

## Dependency Order

```
MVP (complete)
  ↓
Phase 2: Snapshot Expansion
  ↓
Phase 3: PvP / Leaderboard
  ↓
Phase 4: Optional Social Posting
  ↓
Phase 5: Agent Workflow (only after Phase 3 is stable)
```

Phase 4 and Phase 5 can run in parallel after Phase 3.

---

## Scope Discipline

The MVP ships what the hackathon needs.
The roadmap ships what the product needs.
They are different things.

Any feature not on the MVP list stays on the roadmap until explicitly promoted.
