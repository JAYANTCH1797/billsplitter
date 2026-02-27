import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const DISMISSED_KEY = 'splitsync-install-dismissed';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Don't show if already dismissed this session
        if (sessionStorage.getItem(DISMISSED_KEY)) return;

        // Don't show if already running as installed PWA
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        if (window.navigator.standalone === true) return; // iOS Safari

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Small delay so it doesn't pop up immediately on first load
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem(DISMISSED_KEY, '1');
    };

    if (!showPrompt) return null;

    return (
        <div
            className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px)+12px)] left-3 right-3 z-50 animate-enter"
            role="dialog"
            aria-label="Install SplitSync"
            data-testid="install-prompt"
        >
            <div className="brutal-card p-4 flex items-center gap-3">
                {/* Icon */}
                <div className="w-10 h-10 bg-foreground flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📱</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">Add to Home Screen</p>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">
                        Works offline · No app store needed
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={handleInstall}
                        className="brutal-btn py-2 px-3 text-xs flex items-center gap-1"
                        data-testid="install-prompt-install-btn"
                    >
                        <Download className="w-3 h-3" strokeWidth={2.5} />
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="w-7 h-7 border-2 border-foreground flex items-center justify-center"
                        aria-label="Dismiss install prompt"
                        data-testid="install-prompt-dismiss-btn"
                    >
                        <X className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
