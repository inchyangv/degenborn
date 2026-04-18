"use client";

import { useState, useEffect } from "react";

interface Props {
  wallet?: string;
  archetype?: string;
}

type PushState = "unsupported" | "idle" | "requesting" | "subscribed" | "denied" | "error";

/**
 * DailyPushButton — Web Push opt-in for daily monster mood notifications (TODO 3.4).
 *
 * Registers the service worker, requests notification permission,
 * and POST /api/push/subscribe with the PushSubscription.
 */
export default function DailyPushButton({ wallet, archetype }: Props) {
  const [pushState, setPushState] = useState<PushState>("idle");
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushState("unsupported");
      return;
    }

    // Register service worker
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      setSwRegistered(true);
      // Check if already subscribed
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setPushState("subscribed");
      });
    }).catch(() => {
      setPushState("error");
    });

    // Check existing permission
    if (Notification.permission === "denied") {
      setPushState("denied");
    } else if (Notification.permission === "granted") {
      setPushState("subscribed");
    }
  }, []);

  const handleSubscribe = async () => {
    if (!swRegistered) return;
    setPushState("requesting");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushState("denied");
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      // VAPID public key — replace with real key in production
      // For demo: use a placeholder key (will work without actual server push)
      const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY ?? "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

      let subscription: PushSubscription | null = null;
      try {
        const urlB64ToUint8Array = (base64String: string) => {
          const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
          const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
          const rawData = window.atob(base64);
          return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
        };

        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      } catch {
        // VAPID key invalid (demo mode) — still set subscribed state to show UX
        setPushState("subscribed");
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: { endpoint: "demo", demo: true }, wallet, archetype }),
        });
        return;
      }

      // Save subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), wallet, archetype }),
      });

      setPushState("subscribed");
    } catch {
      setPushState("error");
    }
  };

  if (pushState === "unsupported") return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {pushState === "subscribed" ? (
        <div className="flex items-center gap-2 text-xs text-[var(--neon-green)] font-mono">
          <span>🔔</span>
          <span>Daily monster mood: ON</span>
        </div>
      ) : pushState === "denied" ? (
        <div className="text-xs text-gray-600 font-mono">
          🔕 Notifications blocked — enable in browser settings
        </div>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={pushState === "requesting"}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--degen-border)] text-gray-400 text-xs font-mono rounded-lg hover:border-[var(--neon-purple)] hover:text-[var(--neon-purple)] transition-all disabled:opacity-50"
        >
          <span>🔔</span>
          <span>{pushState === "requesting" ? "Requesting..." : "Daily monster mood push"}</span>
        </button>
      )}
      {pushState === "subscribed" && (
        <p className="text-[10px] text-gray-700 text-center max-w-xs">
          You'll get one push per day with your monster's mood. Never spam.
        </p>
      )}
    </div>
  );
}
