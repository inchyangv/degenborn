# DegenBorn — Hackathon Pitch Deck Script

> **Format:** 12 slides, ~3 minutes total
> **Delivery:** Slides + live demo transition at slide 4
> **Tone:** Confident, degen-native, technical but accessible

---

## Slide 1 — COVER (0:00 - 0:10)

> *[Logo centered, dark background, neon green accents]*

"Every wallet on Four.meme has a story.
But right now, that story is just numbers.
This is **DegenBorn**."

*(pause — let the name land)*

---

## Slide 2 — THE PROBLEM (0:10 - 0:30)

> *[Three problem cards: identity, shareability, static NFTs]*

"Three things are broken in on-chain identity.

**One** — your wallet tells you *what happened*, not *who you are*. There's no personality, no style, no scars.

**Two** — on-chain data is boring. Nobody screenshots a block explorer. Zero shareability.

**Three** — most NFTs are minted once and forgotten. They don't grow with you. They don't change."

---

## Slide 3 — THE INSIGHT (0:30 - 0:45)

> *[Big quote: "We don't need another dashboard. We need a mirror."]*

"We don't need more charts and dashboards.

Think about it — panic sells at 3am, diamond hands through a -90% drawdown, aping back in right after getting rugged. That's not just data. That's a *personality*.

DegenBorn makes it visible."

---

## Slide 4 — HOW IT WORKS (0:45 - 1:05)

> *[5-step pipeline: Connect > Analyze > Classify > Generate > Evolve]*

"Here's the pipeline.

**Connect** a wallet. We pull Four.meme trading activity — buys, sells, holds, rugs.

**Analyze** — we compute five scores, zero to a hundred. Aggression, Conviction, Chaos, Luck, Survival.

**Classify** — a deterministic rule tree maps those scores to an archetype. Not an LLM. Not a prompt. Pure logic.

**Generate** — AI creates a genesis character from that archetype.

**Evolve** — every future trade mutates your monster. Win streaks add crowns. Rug pulls add zombie eyes. The character is alive."

---

## Slide 5 — PERSONA DNA (1:05 - 1:25)

> *[5 axes with bar charts, example: Rug Necromancer profile]*

"Let me show you a real profile.

This wallet scores Aggression 82, Chaos 76, Survival 91. It trades fast, gets wrecked often, but *always comes back*.

Each axis is computed from raw on-chain data. Same wallet, same events, same scores. Every single time. There is zero randomness in the scoring layer."

---

## Slide 6 — ARCHETYPES (1:25 - 1:45)

> *[6 archetype cards with rules and descriptions]*

"The rule tree maps DNA to one of six archetypes.

**Mad Gambler** — Aggression and Chaos both above 65. Apes first, thinks never. The casino never closes.

**Rug Necromancer** — high Chaos, high Survival. Your portfolio died. You didn't.

**Diamond Cultist** — high Conviction, low Luck, high Survival. Bought the top. Still holding. Respect.

**Sniper Jester**, **Ice Whale**, **Ghost Bagholder** — each one tells a different trading story. And these aren't labels an LLM invented. They're computed from behavior."

---

## Slide 7 — EVOLUTION (1:45 - 2:05)

> *[Event-to-mutation mapping table]*

"The character isn't static. Every trade leaves a mark.

Win streak — crown appears. Major loss — scar added, mood shifts to despair. Rug pull — corruption goes up, zombie eyes activate. Comeback after being down 90% — revenge aura ignites.

We don't re-render the full image every time. Genesis happens once. Daily changes use overlay compositing — fast and consistent. Full AI re-render only triggers at major milestones."

---

## Slide 8 — SOUL CORE (2:05 - 2:20)

> *[Two-column: Soul Core (soulbound) vs Snapshot Relic (tradeable)]*

"We split identity and collectibility into two NFTs.

**Soul Core** is soulbound — one per wallet, non-transferable. It's your living identity on BNB Chain. DNA hash, archetype, level, current state — all on-chain.

**Snapshot Relic** is the tradeable moment. 'First Crowned Win', 'Rug Survivor', 'Seven-Day Resurrection' — big evolution milestones get minted as collectibles.

Identity stays. Moments travel."

---

## Slide 9 — RULES DECIDE. AI EXPRESSES. (2:20 - 2:35)

> *[Three differentiator cards with green/cyan/gold accents]*

"This is what makes us different from every other AI-crypto project.

**Deterministic identity** — the scoring engine and archetype classifier are pure functions. AI only does what AI is good at: narrative, visuals, captions. The judgments are code.

**Trading becomes retention** — every trade changes your character. That's a feedback loop. Four.meme gets stickier when your portfolio has a face.

**Sharing without spam** — we generate meme-ready share cards. Users decide when to post. No auto-tweeting. No bot behavior."

---

## Slide 10 — ARCHITECTURE (2:35 - 2:45)

> *[Tech stack list with color-coded layers]*

"Under the hood:

Next.js and wagmi for the frontend. Deterministic scoring engine — zero LLM calls in the judgment layer. Canvas overlay compositor for real-time trait rendering. Soulbound ERC-721 on BNB Chain. Moralis for data, with a full offline fixture mode so the demo never breaks.

All in a pnpm monorepo. Shipped solo in 12 days."

---

## Slide 11 — WHAT'S LIVE (2:45 - 2:55)

> *[Feature checklist, two columns, green checkmarks]*

"This isn't a concept deck. Everything you see is deployed.

Wallet connect to DNA analysis in under 30 seconds. AI genesis characters with 12 overlay traits. A 9-event state machine driving real-time mutations. Mutation diary, share cards, soulbound minting on BNB Chain.

Plus 30 pages of content — Gallery, Zodiac readings, Report Cards, a Graveyard for dead portfolios, Hall of Fame.

And Replay Mode — the full demo runs offline with zero API dependency."

---

## Slide 12 — CLOSE (2:55 - 3:00)

> *[Logo icon, final statement, degenborn.xyz]*

"DegenBorn is not another NFT project.

It's the first time your actual wallet behavior — your panic sells, your diamond hands, your comebacks — becomes a character with scars, crowns, and a mood.

Four.meme gets retention. The user gets a self.

**DegenBorn.** Your wallet, reborn as a monster.

Try it now at degenborn.xyz."

*(hold — let it breathe)*

---

## Backup Lines (if demo is needed or fails)

- "The full demo is live at degenborn.xyz right now."
- "Replay Mode is a scripted timeline — same data, deterministic output, works offline."
- "If wallet connect doesn't cooperate, every archetype is browsable in the Gallery."

## Q&A Prep — Likely Questions

**"How is this different from existing NFT projects?"**
> Soul Core is soulbound and evolves with real wallet behavior. Most NFTs are static profile pictures. We're closer to a living identity than a collectible.

**"What if the LLM hallucinates a wrong archetype?"**
> It can't. The archetype is decided by a rule tree in code, not by an LLM. AI only generates the narrative and visuals after the classification is already locked.

**"What's the business model?"**
> Snapshot Relic mints can carry a fee. Four.meme integration drives platform retention. Long-term: premium evolution tiers, branded archetypes for partner tokens.

**"Why BNB Chain?"**
> This hackathon targets the Four.meme ecosystem on BNB Chain. The architecture is chain-agnostic — Soul Core is a standard ERC-721 that works anywhere.

**"Solo build in 12 days — is this sustainable?"**
> The architecture is modular. Scoring, classification, image pipeline, and contract are all separate packages. Adding a second developer is plug-and-play.
