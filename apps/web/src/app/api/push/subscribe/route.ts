import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/push/subscribe
 *
 * Saves a Web Push subscription for daily monster mood notifications.
 * Payload: { subscription: PushSubscriptionJSON, wallet?: string, archetype?: string }
 *
 * In production: persist to DB and send via web-push library.
 * For hackathon demo: accepts and acknowledges (no actual send infrastructure).
 *
 * Real implementation requires:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL env vars
 *   npm install web-push
 */

// In-memory subscription store (resets on cold start — use DB for production)
const subscriptions = new Map<string, { sub: unknown; wallet?: string; archetype?: string; ts: number }>();

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      subscription?: unknown;
      wallet?: string;
      archetype?: string;
    };

    if (!body.subscription || typeof body.subscription !== "object") {
      return NextResponse.json({ error: "subscription required" }, { status: 400 });
    }

    // Use endpoint URL as unique key
    const sub = body.subscription as { endpoint?: string };
    const key = sub.endpoint ?? `anon_${Date.now()}`;

    subscriptions.set(key, {
      sub: body.subscription,
      wallet: body.wallet,
      archetype: body.archetype,
      ts: Date.now(),
    });

    console.info(`[push] New subscription: ${key.slice(0, 40)}... wallet=${body.wallet ?? "anon"}`);

    return NextResponse.json({
      ok: true,
      message: "Subscribed to daily monster mood notifications",
      subscriber_count: subscriptions.size,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { endpoint?: string };
    if (body.endpoint) {
      subscriptions.delete(body.endpoint);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

// Export for use by /api/push/send
export function getSubscriptions() {
  return Array.from(subscriptions.values());
}
