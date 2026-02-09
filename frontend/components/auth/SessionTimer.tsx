'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { refreshToken, logout } from '@/lib/auth';
import { Clock, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useUser } from '@/lib/userContext';

export default function SessionTimer() {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const router = useRouter();
    const { user } = useUser();

    // Helper to format HH:MM:SS
    const formatTime = (ms: number) => {
        if (ms < 0) return "00:00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleRefresh = async () => {
        try {
            await refreshToken();
            // Reset timer implicitly via localStorage update in refreshToken
            updateTimer();
            setShowWarning(false);
        } catch (err) {
            console.error("Refresh failed", err);
            // Optional: Logout if refresh fails hard
            // await logout(); 
            // router.push('/login');
        }
    };

    const updateTimer = () => {
        const expiryStr = localStorage.getItem('sessionExpiry');
        if (!expiryStr) return;

        const expiry = parseInt(expiryStr, 10);
        const now = new Date().getTime();
        const diff = expiry - now;

        if (diff <= 0) {
            // Expired!
            logout().then(() => router.push('/login'));
            return;
        }

        setTimeLeft(diff);

        // Warning if < 5 minutes
        if (diff < 5 * 60 * 1000 && !showWarning) {
            setShowWarning(true);
        }
    };

    // Activity Tracking for Auto-Extension
    useEffect(() => {
        if (!user) return;

        const checkAutoExtend = async () => {
            const expiryStr = localStorage.getItem('sessionExpiry');
            if (!expiryStr) return;
            const expiry = parseInt(expiryStr, 10);
            const now = new Date().getTime();
            const diff = expiry - now;

            // "If timer less than 30 mins" -> Auto Extend
            if (diff > 0 && diff < 30 * 60 * 1000) {
                console.log("Auto-extending session due to activity...");
                await handleRefresh();
            }
        };

        // Debounce activity check (runs at most once every 30s)
        let lastCheck = 0;
        const handleActivity = () => {
            const now = Date.now();
            if (now - lastCheck > 30000) {
                lastCheck = now;
                checkAutoExtend();
            }
        };

        window.addEventListener('click', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('mousemove', handleActivity);

        return () => {
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('mousemove', handleActivity);
        };
    }, [user]); // Re-bind on user login

    // Countdown Interval
    useEffect(() => {
        if (!user) return;

        // Initial check
        updateTimer();

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [user]);

    if (!user || timeLeft === null) return null;

    return (
        <>
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Sitzung
                    </span>
                    <span className={`font-mono ${timeLeft < 5 * 60 * 1000 ? 'text-red-600 font-bold' : ''}`}>
                        {formatTime(timeLeft)}
                    </span>
                </div>

                <button
                    onClick={handleRefresh}
                    className="w-full flex items-center justify-center gap-1.5 text-xs bg-white border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 py-1.5 rounded transition-colors"
                    title="Sitzung verlängern"
                >
                    <RefreshCw className="w-3 h-3" />
                    <span className="font-medium">Verlängern</span>
                </button>
            </div>

            {/* Warning Modal */}
            {showWarning && (
                <Modal
                    isOpen={showWarning}
                    onClose={() => setShowWarning(false)}
                    title="Sitzung läuft ab"
                    footer={
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => logout().then(() => router.push('/login'))}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Abmelden
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Sitzung verlängern
                            </button>
                        </div>
                    }
                >
                    <p className="text-gray-600">
                        Ihre Sitzung läuft in weniger als 5 Minuten ab. Wollen Sie angemeldet bleiben?
                    </p>
                </Modal>
            )}
        </>
    );
}
