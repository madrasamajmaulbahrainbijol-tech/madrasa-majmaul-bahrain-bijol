"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("PWA service worker registration failed:", error);
      });
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        className="fixed bottom-4 right-4 z-[70] inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300/50"
        aria-label="Install Madrasa app"
      >
        <span aria-hidden="true">↓</span>
        Install App
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="pwa-help-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-gray-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="pwa-help-title" className="text-xl font-extrabold">Install Madrasa App</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {ios
                    ? "On your iPhone or iPad, tap the Share button in Safari, then choose “Add to Home Screen”."
                    : "To install, open your browser menu (⋮) and choose “Install app” or “Add to Home screen”. If the option is not visible yet, refresh this page and try again."}
                </p>
              </div>
              <button type="button" onClick={() => setShowHelp(false)} className="rounded-full px-3 py-1 text-xl text-gray-500 hover:bg-gray-100" aria-label="Close">×</button>
            </div>
            <button type="button" onClick={() => setShowHelp(false)} className="mt-5 w-full rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white hover:bg-emerald-700">Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
