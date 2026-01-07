import { useState, useEffect } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-linear-to-r from-emerald-600 to-cyan-600 text-background p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start space-x-3">
          <ArrowDownTrayIcon className="w-6 h-6 shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">Install App</h4>
            <p className="text-xs opacity-90 mt-1">
              Get faster access and offline features
            </p>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleInstall}
                className="bg-linear-to-r from-emerald-600 to-cyan-600 text-background px-3 py-1 rounded text-xs font-medium hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstall(false)}
                className="text-background opacity-75 px-3 py-1 text-xs"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
