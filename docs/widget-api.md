# DegenBorn Widget API

Embed a trader's DegenBorn monster card directly on your platform.

> **Built for Four.meme integration** — these endpoints are designed so Four.meme
> can display each trader's on-chain identity on their profile page.

---

## Base URL

```
https://degenborn.xyz/api/widget/{wallet}
```

Replace `{wallet}` with any checksummed or lowercase Ethereum address (0x…).

---

## Endpoints

### 1. JSON Data — `GET /api/widget/{wallet}`

Returns the monster profile as JSON. Use this to build your own custom UI.

**Response**

```json
{
  "wallet": "0xabc...def",
  "archetype": "rug_necromancer",
  "archetype_name": "Rug Necromancer",
  "level": 1,
  "loyalty_score": 72,
  "loyalty_grade": "Gold",
  "dna": {
    "aggression": 45,
    "conviction": 30,
    "chaos": 80,
    "luck": 40,
    "survival": 91,
    "event_count": 34
  },
  "image_url": "https://degenborn.xyz/api/og/0xabc...def",
  "widget_image_url": "https://degenborn.xyz/api/widget/0xabc...def/image",
  "share_url": "https://degenborn.xyz/m/0xabc...def",
  "embed_url": "https://degenborn.xyz/api/widget/0xabc...def/embed",
  "powered_by": "DegenBorn × four.meme",
  "last_updated": 1712700000
}
```

**CORS** — open (`Access-Control-Allow-Origin: *`).

---

### 2. Mini Card Image — `GET /api/widget/{wallet}/image`

Returns a **300×400 PNG** mini monster card, suitable for `<img>` tags.
Includes archetype avatar, name, DNA bars, and "Powered by Four.meme" footer.

```html
<img
  src="https://degenborn.xyz/api/widget/0xabc...def/image"
  width="300"
  height="400"
  alt="Rug Necromancer — DegenBorn Soul Core"
/>
```

---

### 3. Embeddable Card — `GET /api/widget/{wallet}/embed`

Returns a self-contained **HTML page** (300×400) — drop it into an `<iframe>`.
No external JS dependencies. Clicking "Powered by Four.meme" opens the full monster profile.

```html
<iframe
  src="https://degenborn.xyz/api/widget/0xabc...def/embed"
  width="300"
  height="400"
  frameborder="0"
  scrolling="no"
  style="border-radius: 16px; overflow: hidden;"
></iframe>
```

---

## Four.meme Integration Example

Add this to a trader's profile page to display their DegenBorn identity:

```html
<!-- Fetch JSON and render custom UI -->
<script>
  async function loadMonster(wallet) {
    const res = await fetch(`https://degenborn.xyz/api/widget/${wallet}`);
    const data = await res.json();
    document.getElementById('monster-name').textContent = data.archetype_name;
    document.getElementById('monster-grade').textContent = `${data.loyalty_grade} Trader`;
    document.getElementById('monster-img').src = data.widget_image_url;
  }
  loadMonster('0xYourTraderWallet');
</script>

<div id="monster-widget">
  <img id="monster-img" width="300" height="400" />
  <div id="monster-name"></div>
  <div id="monster-grade"></div>
</div>
```

---

## Archetype Values

| `archetype`       | Name              | Emoji |
|-------------------|-------------------|-------|
| `mad_gambler`     | Mad Gambler       | 🎲    |
| `ice_whale`       | Ice Whale         | 🐋    |
| `rug_necromancer` | Rug Necromancer   | 💀    |
| `diamond_cultist` | Diamond Cultist   | 💎    |
| `sniper_jester`   | Sniper Jester     | 🎯    |
| `ghost_bagholder` | Ghost Bagholder   | 👻    |
| `unknown`         | Unknown Monster   | ✦     |

## Loyalty Grades

| Grade       | Score Range | Emoji |
|-------------|-------------|-------|
| `Bronze`    | 0–34        | 🥉    |
| `Silver`    | 35–54       | 🥈    |
| `Gold`      | 55–69       | 🥇    |
| `Diamond`   | 70–84       | 💎    |
| `Legendary` | 85–100      | ⭐    |

---

## Notes

- Wallet must have been analyzed (via `POST /api/analyze`) at least once for DNA data to appear.
- `loyalty_score` and `loyalty_grade` are `null` until the wallet has been analyzed.
- All endpoints are CORS-open for cross-origin use.
- Images are not cached — `Cache-Control: no-store` — to always reflect the latest state.
