'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { changePassword } from '@/lib/auth';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Lock } from 'lucide-react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const formData = new FormData(event.currentTarget);
        const payload = {
            old_password: formData.get('old_password') as string,
            new_password1: formData.get('new_password1') as string,
            new_password2: formData.get('new_password2') as string,
        };

        if (payload.new_password1 !== payload.new_password2) {
            setErrorMessage('Die neuen Passwörter stimmen nicht überein.');
            setIsPending(false);
            return;
        }

        try {
            await changePassword(payload);
            setSuccessMessage('Ihr Passwort wurde erfolgreich geändert.');
            // Optional: Close after delay or let user close
            setTimeout(() => {
                onClose();
                setSuccessMessage(null); // Reset for next time
                (event.target as HTMLFormElement).reset();
            }, 2000);
        } catch (error: any) {
            setErrorMessage(error.message || 'Fehler beim Ändern des Passworts.');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Passwort ändern"
        >
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Visual Header within Modal Body for cleaner look */}
                <div className="flex flex-col items-center justify-center mb-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-full text-[#294D9D] mb-3">
                        <Lock size={28} />
                    </div>
                    <p className="text-sm text-gray-500">
                        Bitte geben Sie Ihr aktuelles Passwort sowie das neue Passwort ein.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aktuelles Passwort
                    </label>
                    <input
                        name="old_password"
                        type="password"
                        required
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-[#294D9D] focus:ring-[#294D9D]"
                        placeholder="••••••••"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Neues Passwort
                    </label>
                    <input
                        name="new_password1"
                        type="password"
                        required
                        minLength={8}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-[#294D9D] focus:ring-[#294D9D]"
                        placeholder="Mindestens 8 Zeichen"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Neues Passwort wiederholen
                    </label>
                    <input
                        name="new_password2"
                        type="password"
                        required
                        minLength={8}
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-[#294D9D] focus:ring-[#294D9D]"
                        placeholder="••••••••"
                    />
                </div>

                {errorMessage && (
                    <div className="flex items-center space-x-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm">
                        <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg text-sm">
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full rounded-lg bg-[#294D9D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1E40AF] focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors shadow-md disabled:opacity-70"
                    >
                        {isPending ? 'Wird gespeichert...' : 'Passwort ändern'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
