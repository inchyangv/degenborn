# DegenBorn

**Your wallet has a personality. You just haven't seen it yet.**

DegenBorn reads your Four.meme trading history and turns it into a living, evolving monster — your Soul Core. Not a profile picture. Not a static NFT. A soulbound identity that grows scars when you get rugged, crowns when you win streaks, and zombie eyes when you survive what should have killed your portfolio.

---

## The Problem

On-chain data is rich with story — panic sells at 3am, diamond hands through a -90% drawdown, the exact moment someone ape'd back in after getting rugged. But all of that collapses into a transaction log nobody shares and nobody remembers.

We don't need another dashboard. We need a mirror.

---

## How It Works

```
Wallet Activity → Persona DNA (5 axes, 0–100) → Archetype → Living Character
```

**1. Persona DNA** — Five deterministic scores computed from raw trading behavior:

| Axis | What It Measures |
|------|-----------------|
| Aggression | How fast and often you trade |
| Conviction | How long and focused you hold |
| Chaos | How volatile and destructive your history is |
| Luck | How well-timed your entries and exits are |
| Survival | How many times you came back from the dead |

Same wallet, same events, same scores. Always. No LLM hallucination in the scoring layer.

**2. Archetype Classification** — A rule-tree (not a prompt) maps your DNA to one of six archetypes:

> Mad Gambler · Ice Whale · Rug Necromancer · Diamond Cultist · Sniper Jester · Ghost Bagholder

**3. Genesis & Evolution** — AI generates your base character from the archetype. Then every trade mutates it: win streaks add crowns, rug pulls add zombie traits, comebacks ignite revenge aura. No full re-render per event — overlay compositing keeps it fast and consistent.

**4. Soul Core** — A soulbound (non-transferable) NFT on BNB Chain. One per wallet. Your on-chain identity, not a collectible.

---

## Why This Has Edge

**Rules decide. AI expresses.** Most AI×Web3 projects let the LLM make judgments. We don't. The scoring engine and archetype classifier are fully deterministic. AI only handles what it's good at — narrative, visuals, captions. This means the identity is reproducible, auditable, and stable.

**Trading becomes retention.** Every trade changes your character. That's not a gimmick — it's a feedback loop. Four.meme gets stickier when your portfolio has a face.

**Sharing is built-in, spam is not.** We generate meme-ready share cards and one-line captions. Users decide when to post. No auto-tweeting. No bot behavior.

---

## Architecture

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 14, TypeScript, Tailwind, wagmi v2 |
| Scoring | Deterministic engine (pure functions, 0 LLM calls) |
| Classification | Rule-tree archetype mapper |
| Narrative | GPT-4o-mini with structured output + template fallback |
| Image | DALL-E 3 genesis + Canvas overlay compositor |
| Contract | Solidity 0.8.24, Soulbound ERC-721, BNB Chain |
| Data | Moralis / Covalent adapters + offline fixture mode |
| Persistence | Postgres + Vercel Blob |

---

## What's Live

- Wallet connect → DNA analysis → archetype reveal in <30s
- AI genesis character + 12 overlay traits (crown, scar, zombie eyes, revenge aura, ...)
- State machine with 9 event types driving real-time mutation
- Mutation Diary tracking every character change
- Share cards with meme captions
- Soulbound Soul Core contract deployed on BNB Chain
- Replay Mode — full demo runs offline, no API dependency
- 30+ pages: Monster Room, Gallery, Zodiac, Report Card, Graveyard, Hall of Fame, and more

---

## Demo

**Live**: [degenborn.xyz](https://degenborn.xyz)

Connect a wallet and meet your monster. Or hit `/replay` to watch a pre-built timeline — rug events, comebacks, evolution — with zero network dependency.

---

## Team

Solo build. 12 days.

---

*Built for Four.meme AI Sprint · April 2026*
