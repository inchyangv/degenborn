"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/**
 * 3.6: PWA "Add to Home Screen" install prompt banner.
 *
 * On Android/Chrome: intercepts the beforeinstallprompt event and shows a
 * custom banner. On iOS: shows manual instructions (iOS doesn't support
 * the beforeinstallprompt API).
 *
 * Once installed or dismissed, hides for 7 days.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as { standalone?: boolean }).standalone === true;

    setIsIOS(ios);
    setIsStandalone(standalone);

    if (standalone) return; // Already installed

    // Check if dismissed recently
    const dismissed = localStorage.getItem("install_prompt_dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Show iOS instructions after a short delay
    if (ios) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }

    // Chrome/Android: listen for install prompt
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("install_prompt_dismissed", String(Date.now()));
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem("install_prompt_dismissed", String(Date.now() + 365 * 86400 * 1000));
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  if (!show || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-[var(--degen-card)] border border-[var(--neon-purple)] rounded-2xl p-4 shadow-2xl shadow-purple-900/40">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="DegenBorn" className="w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm mb-0.5">Add DegenBorn to Home Screen</div>
            {isIOS ? (
              <div className="text-[10px] text-gray-400">
                Tap <span className="text-[var(--neon-purple)]">Share ↑</span> then &ldquo;Add to Home Screen&rdquo;. Your monster icon = your identity.
              </div>
            ) : (
              <div className="text-[10px] text-gray-400">
                Your monster as your phone icon. Identity on the home screen.
              </div>
            )}
          </div>
          <button onClick={dismiss} className="text-gray-600 hover:text-gray-400 text-lg leading-none shrink-0">×</button>
        </div>
        {!isIOS && deferredPrompt && (
          <button
            onClick={install}
            className="mt-3 w-full py-2 bg-[var(--neon-purple)] text-white font-black text-xs rounded-lg hover:brightness-110 transition-all"
          >
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
