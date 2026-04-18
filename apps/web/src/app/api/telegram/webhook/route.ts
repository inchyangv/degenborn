import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/runtime-env";
import { ARCHETYPE_PROFILES, ARCHETYPE_COLORS } from "@degenborn/shared";
import type { ArchetypeId } from "@degenborn/shared";

export const runtime = "nodejs";

/**
 * POST /api/telegram/webhook
 *
 * Telegram Bot webhook handler (TODO 2.9).
 * Handles:
 *   /born <wallet>  — analyze wallet, return DNA + archetype + monster URL
 *   /roast <wallet> — brutal 1-line roast
 *   /today          — today's top monster (demo)
 *   /help           — command list
 *
 * Setup:
 *   1. Create a bot with @BotFather, get TELEGRAM_BOT_TOKEN
 *   2. Set webhook: POST https://api.telegram.org/bot{TOKEN}/setWebhook
 *      { "url": "https://your-domain.com/api/telegram/webhook" }
 *   3. Set TELEGRAM_BOT_TOKEN env var
 *
 * TELEGRAM_WEBHOOK_SECRET guards against unauthorized calls.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

const EMOJI: Record<string, string> = {
  mad_gambler: "🎲", ice_whale: "🐋", rug_necromancer: "💀",
  diamond_cultist: "💎", sniper_jester: "🎯", ghost_bagholder: "👻",
};

const DNA_BAR = (score: number) => {
  const filled = Math.round(score / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled) + ` ${score}`;
};

async function sendMessage(chatId: number | string, text: string, parseMode = "Markdown") {
  if (!BOT_TOKEN) {
    console.info("[telegram] No BOT_TOKEN set — skipping send:", text.slice(0, 80));
    return;
  }
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: false,
    }),
  });
}

async function handleBorn(chatId: number | string, walletArg: string) {
  const appUrl = getAppUrl();
  const walletLower = walletArg.trim().toLowerCase();

  if (!/^0x[0-9a-f]{40}$/.test(walletLower)) {
    await sendMessage(chatId, "❌ Invalid wallet. Try `/born 0x1234...abcd`");
    return;
  }

  await sendMessage(chatId, `⚡ Analyzing \`${walletLower.slice(0, 6)}...${walletLower.slice(-4)}\`...`);

  try {
    const res = await fetch(`${appUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: walletLower, window: "30d" }),
    });
    if (!res.ok) throw new Error("Analysis failed");
    const data = await res.json() as {
      dna: { aggression: number; conviction: number; chaos: number; luck: number; survival: number };
      archetype: { archetype: ArchetypeId; profile: { name: string; tagline: string } };
      loyalty?: { grade: string; score: number };
    };

    const { dna, archetype } = data;
    const emoji = EMOJI[archetype.archetype] ?? "👾";
    const color = (ARCHETYPE_COLORS as Record<string, string>)[archetype.archetype] ?? "";
    const profile = ARCHETYPE_PROFILES[archetype.archetype];

    const msg = [
      `${emoji} *${archetype.profile.name.toUpperCase()}*`,
      `_"${profile?.tagline ?? archetype.profile.tagline}"_`,
      ``,
      `\`AGG  ${DNA_BAR(dna.aggression)}\``,
      `\`CON  ${DNA_BAR(dna.conviction)}\``,
      `\`CHA  ${DNA_BAR(dna.chaos)}\``,
      `\`LCK  ${DNA_BAR(dna.luck)}\``,
      `\`SRV  ${DNA_BAR(dna.survival)}\``,
      ``,
      `🔗 [View monster](${appUrl}/m/${walletLower})`,
      `⚡ Built on @four_meme · #DegenBorn`,
    ].join("\n");

    await sendMessage(chatId, msg);
  } catch (e) {
    await sendMessage(chatId, `⚠️ Analysis failed: ${e instanceof Error ? e.message : "Unknown error"}\nTry /born with a different wallet.`);
  }
}

async function handleRoast(chatId: number | string, walletArg: string) {
  const appUrl = getAppUrl();
  const walletLower = walletArg.trim().toLowerCase();

  if (!/^0x[0-9a-f]{40}$/.test(walletLower)) {
    await sendMessage(chatId, "❌ Invalid wallet. Try `/roast 0x1234...abcd`");
    return;
  }

  try {
    const res = await fetch(`${appUrl}/api/roast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: walletLower }),
    });
    if (!res.ok) throw new Error("Roast failed");
    const data = await res.json() as { paragraph1?: string; roast?: string };
    const roastText = data.paragraph1 ?? data.roast ?? "ngmi. that's it. that's the roast.";

    await sendMessage(chatId, `💀 *ROAST:*\n\n${roastText}\n\n_— DegenBorn × @four\\_meme_`);
  } catch {
    await sendMessage(chatId, "💀 *ROAST:* ngmi. didn't even need to check the wallet.");
  }
}

async function handleToday(chatId: number | string) {
  const appUrl = getAppUrl();
  try {
    const res = await fetch(`${appUrl}/api/profiles?limit=1`);
    const data = await res.json() as { profiles: Array<{ wallet_address: string; archetype: string }> };
    const top = data.profiles[0];
    if (top) {
      const emoji = EMOJI[top.archetype] ?? "👾";
      const profile = ARCHETYPE_PROFILES[top.archetype as ArchetypeId];
      await sendMessage(chatId, [
        `🏆 *Today's Top Monster*`,
        ``,
        `${emoji} *${profile?.name ?? top.archetype}*`,
        `\`${top.wallet_address.slice(0, 6)}...${top.wallet_address.slice(-4)}\``,
        ``,
        `🔗 [View profile](${appUrl}/m/${top.wallet_address})`,
        `⚡ DegenBorn × @four\\_meme`,
      ].join("\n"));
    } else {
      await sendMessage(chatId, "No monsters analyzed yet today. Be the first: /born <wallet>");
    }
  } catch {
    await sendMessage(chatId, "Today's top monster is hiding. Try again in a bit.");
  }
}

async function handleHelp(chatId: number | string) {
  await sendMessage(chatId, [
    "👾 *DegenBorn Bot — Commands*",
    "",
    "🔍 `/born <wallet>` — Analyze any 0x wallet",
    "💀 `/roast <wallet>` — Get brutally roasted",
    "🏆 `/today` — See today's top monster",
    "",
    "_Built on @four\\_meme · #DegenBorn_",
  ].join("\n"));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify webhook secret header
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    message?: {
      chat: { id: number };
      text?: string;
      from?: { username?: string };
    };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false });
  }

  const message = body.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = message.chat.id;
  const text = message.text.trim();
  const [command, ...args] = text.split(/\s+/);

  // Handle commands (with or without @BotUsername suffix)
  const cmd = (command ?? "").split("@")[0]?.toLowerCase();
  const arg = args.join(" ");

  switch (cmd) {
    case "/born":
      if (!arg) {
        await sendMessage(chatId, "Usage: `/born 0x...` — paste a wallet address");
      } else {
        await handleBorn(chatId, arg);
      }
      break;
    case "/roast":
      if (!arg) {
        await sendMessage(chatId, "Usage: `/roast 0x...` — paste a wallet address");
      } else {
        await handleRoast(chatId, arg);
      }
      break;
    case "/today":
      await handleToday(chatId);
      break;
    case "/start":
    case "/help":
      await handleHelp(chatId);
      break;
    default:
      // Ignore unknown messages
      break;
  }

  return NextResponse.json({ ok: true });
}

// GET endpoint for health check / webhook info
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    bot: "DegenBorn Telegram Bot",
    commands: ["/born <wallet>", "/roast <wallet>", "/today", "/help"],
    setup: "Set TELEGRAM_BOT_TOKEN and register webhook at /api/telegram/webhook",
    status: BOT_TOKEN ? "configured" : "no token (demo mode)",
  });
}
