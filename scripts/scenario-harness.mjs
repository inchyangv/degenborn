const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3001";

const DEMO_WALLETS = {
  rug_necromancer: "0x1111111111111111111111111111111111111111",
  ice_whale: "0x2222222222222222222222222222222222222222",
  mad_gambler: "0x3333333333333333333333333333333333333331",
};

function log(step, detail) {
  console.log(`[scenario] ${step}${detail ? `: ${detail}` : ""}`);
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, init = {}) {
  return fetch(new URL(path, BASE_URL), init);
}

async function expectHtml(path, includes = []) {
  const res = await request(path);
  const body = await res.text();
  invariant(res.ok, `${path} returned ${res.status}`);
  for (const snippet of includes) {
    invariant(body.includes(snippet), `${path} missing HTML snippet: ${snippet}`);
  }
  invariant(!body.includes("Invalid wallet address"), `${path} rendered invalid wallet message`);
  return body;
}

async function expectJson(path, init) {
  const res = await request(path, init);
  const body = await res.json();
  invariant(res.ok, `${path} returned ${res.status}: ${JSON.stringify(body)}`);
  return body;
}

async function expectImage(path) {
  const res = await request(path);
  invariant(res.ok, `${path} returned ${res.status}`);
  const contentType = res.headers.get("content-type") ?? "";
  invariant(contentType.startsWith("image/"), `${path} returned non-image content type: ${contentType}`);
}

async function expectOk(path) {
  const res = await request(path);
  invariant(res.ok, `${path} returned ${res.status}`);
  return res;
}

function isHexWallet(wallet) {
  return /^0x[0-9a-f]{40}$/i.test(wallet);
}

async function main() {
  log("base", BASE_URL);

  log("landing", "SSR fallback");
  await expectHtml("/", ["DEGENBORN", "Connect Wallet", "Try Replay Demo"]);

  log("replay", "SSR fallback");
  await expectHtml("/replay", ["Replay Mode", "Choose a story arc"]);

  log("birth", "SSR fallback");
  await expectHtml(`/birth?wallet=${DEMO_WALLETS.rug_necromancer}`, ["The Awakening", "Scanning"]);

  log("analyze", "fixture wallet");
  const analysis = await expectJson("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet: DEMO_WALLETS.rug_necromancer }),
  });
  invariant(analysis.archetype?.archetype, "analyze response missing archetype");
  invariant(["fixture", "demo"].includes(analysis.data_source), `unexpected analyze data_source: ${analysis.data_source}`);
  invariant(analysis.derived_state?.wallet_address === DEMO_WALLETS.rug_necromancer, "derived state wallet was not canonicalized");

  log("genesis", "placeholder-or-real portrait");
  const genesis = await expectJson("/api/genesis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: DEMO_WALLETS.rug_necromancer,
      dna: analysis.dna,
      archetype: analysis.archetype.archetype,
      state: analysis.derived_state,
    }),
  });
  invariant(typeof genesis.url === "string" && genesis.url.length > 0, "genesis response missing url");

  log("mint", "demo-safe fallback");
  const mint = await expectJson("/api/mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: DEMO_WALLETS.rug_necromancer,
      dna: analysis.dna,
      archetype: analysis.archetype,
    }),
  });
  invariant(mint.token_id, "mint response missing token_id");

  log("relic", "demo-safe fallback");
  const relic = await expectJson("/api/relic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: DEMO_WALLETS.rug_necromancer,
      milestone_type: 0,
      state: analysis.derived_state,
      archetype: analysis.archetype,
    }),
  });
  invariant(relic.milestone_type === 0, "relic response milestone_type mismatch");

  log("diary", "seed and readback");
  await expectJson("/api/diary/seed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: DEMO_WALLETS.rug_necromancer,
      entries: [
        {
          id: "scenario-harness-entry",
          wallet_address: DEMO_WALLETS.rug_necromancer,
          reason: "Scenario harness seed",
          trait_delta: { added: ["crown"], removed: [] },
          state_before: analysis.derived_state,
          state_after: {
            ...analysis.derived_state,
            crown_count: (analysis.derived_state?.crown_count ?? 0) + 1,
          },
          generated_caption: "Harness entry",
          timestamp: 1712700000,
        },
      ],
    }),
  });
  const diary = await expectJson(`/api/diary?wallet=${DEMO_WALLETS.rug_necromancer}&limit=5`);
  invariant((diary.total ?? 0) >= 1, "diary did not return seeded entries");

  log("metadata", "public token payload");
  const metadata = await expectJson(`/api/metadata/${DEMO_WALLETS.rug_necromancer}`);
  invariant(metadata.image?.includes("/api/og/"), "metadata image should point to og route");

  log("widget", "JSON/embed/image");
  const widget = await expectJson(`/api/widget/${DEMO_WALLETS.rug_necromancer}`);
  invariant(widget.wallet === DEMO_WALLETS.rug_necromancer, "widget wallet mismatch");
  const embed = await expectOk(`/api/widget/${DEMO_WALLETS.rug_necromancer}/embed`);
  invariant((await embed.text()).includes("DEGENBORN"), "widget embed missing branded HTML");
  await expectImage(`/api/widget/${DEMO_WALLETS.rug_necromancer}/image`);

  log("genesis-image", "redirect");
  const genesisImage = await request(`/api/genesis-image/${DEMO_WALLETS.rug_necromancer}`, { redirect: "manual" });
  invariant(genesisImage.status === 307, `/api/genesis-image expected 307, got ${genesisImage.status}`);

  log("og", "share images");
  await expectImage(`/api/og/${DEMO_WALLETS.rug_necromancer}`);
  await expectImage(`/api/og/report/${DEMO_WALLETS.rug_necromancer}`);

  log("profiles", "fixture wallets are valid");
  const profiles = await expectJson("/api/profiles?limit=10");
  invariant(Array.isArray(profiles.profiles), "profiles response missing array");
  invariant(profiles.profiles.every((profile) => isHexWallet(profile.wallet_address)), "profiles endpoint returned non-hex wallet");

  log("pages", "dynamic scenario surfaces");
  await expectOk(`/monster?wallet=${DEMO_WALLETS.rug_necromancer}`);
  await expectOk(`/m/${DEMO_WALLETS.rug_necromancer}`);
  await expectOk(`/report/${DEMO_WALLETS.rug_necromancer}`);
  await expectOk(`/sheet/${DEMO_WALLETS.rug_necromancer}`);
  await expectOk(`/origin/${DEMO_WALLETS.rug_necromancer}`);
  await expectOk(`/challenge/${DEMO_WALLETS.rug_necromancer}`);
  await expectOk(`/compare?a=${DEMO_WALLETS.rug_necromancer}&b=${DEMO_WALLETS.ice_whale}`);
  await expectOk(`/battle?a=${DEMO_WALLETS.rug_necromancer}&b=${DEMO_WALLETS.mad_gambler}`);

  log("pass", "all scenario checks passed");
}

main().catch((error) => {
  console.error(`[scenario] FAIL: ${error.message}`);
  process.exit(1);
});
