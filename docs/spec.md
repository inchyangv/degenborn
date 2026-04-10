# DegenBorn — Product Spec

> Source of truth for all scoring, archetype, state, and trait rules.
> All team members must use the terminology in this document.

---

## 1. Scoring Fields (Persona DNA)

All scores are **integers 0–100**, computed deterministically from `ActivityEvent[]`.

| Field | Description | Key Inputs |
|-------|-------------|------------|
| `aggression` | Trading frequency and speed | trades/day, hold < 1h ratio, same-token re-entry rate |
| `conviction` | Hold duration and token concentration | avg hold seconds, top-3 token concentration, repeat buys |
| `chaos` | Volatility and rug exposure | PnL std dev, rug event count, big loss count |
| `luck` | Profit-taking accuracy | profitable sell ratio, big win count, early entry rate |
| `survival` | Recovery rate after losses | recovery event count, comeback count, persistence after loss |

### Thresholds
- **high**: ≥ 65
- **mid**: 35–64
- **low**: < 35

---

## 2. Archetypes

Six archetypes, assigned by deterministic rule tree (no LLM involvement).

### Mad Gambler
**Condition:** aggression=high, chaos=high, luck≠high  
**Tone:** frenetic, impulsive, darkly funny

### Ice Whale
**Condition:** conviction=high, luck=high (or survival=high)  
**Tone:** stoic, commanding, glacial

### Rug Necromancer
**Condition:** chaos=high, survival=high  
**Tone:** undead, darkly triumphant, battle-scarred

### Diamond Cultist
**Condition:** conviction=high, luck=low, survival=high  
**Tone:** obsessive, reverent, quietly suffering

### Sniper Jester
**Condition:** aggression=high, luck=high  
**Tone:** cocky, fast-talking, irreverent

### Ghost Bagholder
**Condition:** conviction=high, chaos=high, survival=low  
**Tone:** haunted, resigned, quietly delusional

### Tie-breaker policy
When two rules score equally, priority order is:  
`rug_necromancer > mad_gambler > ice_whale > sniper_jester > diamond_cultist > ghost_bagholder`

---

## 3. Character State Schema

```ts
interface CharacterState {
  wallet_address: string;
  archetype: ArchetypeId;
  level: number;           // 1–10
  mood: Mood;              // neutral | euphoria | despair | revenge | greed | ghost
  corruption: number;      // 0–100
  prestige: number;        // 0–100
  scar_count: number;
  crown_count: number;
  survival_streak: number;
  active_traits: TraitId[];
  updated_at: number;      // unix seconds
}
```

---

## 4. State Transition Rules

| Trigger | State Change |
|---------|-------------|
| 3 consecutive profitable sells | `crown_count + 1`, `mood = euphoria` |
| Single loss > $500 | `scar_count + 1`, `mood = despair` |
| Profit after big loss (within 7 days) | `survival_streak + 1`, `mood = revenge` |
| Rug event | `corruption + 20`, `zombie_eyes trait` |
| Rug events ≥ 3 | `mood = ghost` |
| Prestige ≥ 70 | `royal_cloak trait` |
| Sustained profit (prestige ≥ 30) | `gold_tooth trait` |
| survival_streak ≥ 5 | `skull_ring trait` |
| 7-day profit surge | Level up, re-render trigger |

---

## 5. Trait List

| ID | Label | Category | Trigger |
|----|-------|----------|---------|
| `crown` | Crown | head | crown_count ≥ 1 |
| `gold_chain` | Gold Chain | accessory | crown_count ≥ 3 |
| `bandage` | Bandage | head | scar_count ≥ 1 |
| `torn_clothes` | Torn Clothes | body | scar_count ≥ 2 |
| `tears` | Tears | eyes | mood = despair |
| `gold_tooth` | Gold Tooth | accessory | prestige ≥ 30 |
| `scar` | Battle Scar | body | scar_count ≥ 3 |
| `zombie_eyes` | Zombie Eyes | eyes | corruption ≥ 50 |
| `revenge_aura` | Revenge Aura | aura | mood = revenge |
| `royal_cloak` | Royal Cloak | body | prestige ≥ 70 |
| `ghost_form` | Ghost Form | aura | mood = ghost |
| `skull_ring` | Skull Ring | accessory | survival_streak ≥ 5 |

---

## 6. Out of Scope

The following are explicitly **excluded** from this MVP:

- Automated trading / copy trading
- Fully automated X/Twitter posting (share button exists, auto-post does not)
- Tax-precision PnL accounting
- Storing raw conversation text anywhere
- All on-chain state persistence (only Soul Core NFT metadata hash is on-chain)
- Major Evolution re-render (P1, not P0)
- Snapshot Relic minting (P1, not P0)

---

## 7. Naming Conventions

- DNA fields: snake_case (`aggression`, `conviction`, `chaos`, `luck`, `survival`)
- Archetype IDs: snake_case (`mad_gambler`, `ice_whale`, …)
- Trait IDs: snake_case (`crown`, `zombie_eyes`, …)
- Event types: snake_case (`buy`, `sell`, `rug`, `recovery`, …)
- All monetary values: USD, stored as `number` (float)
- All timestamps: Unix seconds, stored as `number` (integer)
