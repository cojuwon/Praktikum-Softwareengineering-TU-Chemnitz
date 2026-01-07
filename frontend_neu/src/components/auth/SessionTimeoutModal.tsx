import React from 'react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';

interface SessionTimeoutModalProps {
    isOpen: boolean;
    onStayLoggedIn: () => void;
    onLogout: () => void;
    timeLeft: number; // in seconds
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
    isOpen,
    onStayLoggedIn,
    onLogout,
    timeLeft,
}) => {
    // Format seconds to mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onLogout}
            title="Sitzung läuft ab"
            size="sm"
        >
            <div className="py-4 text-slate-600">
                <p>
                    Ihre Sitzung läuft aufgrund von Inaktivität in <span className="font-semibold text-red-500">{formatTime(timeLeft)}</span> ab.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    Möchten Sie angemeldet bleiben?
                </p>
            </div>
            <DialogFooter>
                <button
                    onClick={onLogout}
                    className="px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
                >
                    Abmelden
                </button>
                <button
                    onClick={onStayLoggedIn}
                    className="px-6 py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-md"
                >
                    Angemeldet bleiben
                </button>
            </DialogFooter>
        </Dialog>
    );
};
