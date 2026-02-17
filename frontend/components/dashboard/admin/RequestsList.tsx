'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Check, X, Shield, RefreshCw } from 'lucide-react';

interface InactiveUser {
    id: number;
    vorname_mb: string;
    nachname_mb: string;
    mail_mb: string;
    date_joined?: string; // If available
}

export default function RequestsList() {
    const [requests, setRequests] = useState<InactiveUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<number | null>(null); // ID being processed

    // Approval Modal State
    const [approvingUser, setApprovingUser] = useState<InactiveUser | null>(null);
    const [selectedRole, setSelectedRole] = useState('B'); // Default Basis

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Filter for inactive users
            const res = await apiFetch('/api/konten/?is_active=false');
            if (res.ok) {
                const data = await res.json();
                // Handle pagination or list
                const list = Array.isArray(data) ? data : data.results || [];
                setRequests(list);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Möchten Sie diese Anfrage wirklich ablehnen? Der Account wird gelöscht.')) return;

        setIsProcessing(id);
        try {
            const res = await apiFetch(`/api/konten/${id}/`, { method: 'DELETE' });
            if (res.ok) {
                setRequests(prev => prev.filter(req => req.id !== id));
            } else {
                alert('Fehler beim Ablehnen.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(null);
        }
    };

    const confirmApprove = async () => {
        if (!approvingUser) return;

        setIsProcessing(approvingUser.id);

        try {
            const payload = {
                is_active: true,
                rolle_mb: selectedRole
            };

            const res = await apiFetch(`/api/konten/${approvingUser.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setRequests(prev => prev.filter(req => req.id !== approvingUser.id));
                setApprovingUser(null);
            } else {
                alert('Fehler beim Bestätigen.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Lade Anfragen...</div>;

    if (requests.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center">
                <div className="p-4 bg-white rounded-full text-green-500 mb-4 shadow-sm">
                    <Check size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Alles erledigt!</h3>
                <p className="text-gray-500 mt-1">Keine offenen Registrierungsanfragen.</p>
                <button onClick={fetchRequests} className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <RefreshCw size={14} /> Aktualisieren
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{req.vorname_mb} {req.nachname_mb}</h4>
                        <p className="text-gray-500 text-sm">{req.mail_mb}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={isProcessing === req.id}
                            onClick={() => handleReject(req.id)}
                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <X size={16} /> Ablehnen
                        </button>
                        <button
                            disabled={isProcessing === req.id}
                            onClick={() => setApprovingUser(req)}
                            className="bg-[#294D9D] text-white hover:bg-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Check size={16} /> Bestätigen
                        </button>
                    </div>
                </div>
            ))}

            {/* Approve Modal */}
            {approvingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-4 text-[#294D9D]">
                            <Shield size={24} />
                            <h3 className="text-xl font-bold">Benutzer freigeben</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Welche Rolle soll <strong>{approvingUser.vorname_mb} {approvingUser.nachname_mb}</strong> erhalten?
                        </p>

                        <div className="space-y-3 mb-8">
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                                <input
                                    type="radio"
                                    name="role"
                                    value="B"
                                    checked={selectedRole === 'B'}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="text-blue-600"
                                />
                                <div>
                                    <span className="block font-medium text-gray-900">Basis</span>
                                    <span className="block text-xs text-gray-500">Standard-Zugriff</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                                <input
                                    type="radio"
                                    name="role"
                                    value="E"
                                    checked={selectedRole === 'E'}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="text-blue-600"
                                />
                                <div>
                                    <span className="block font-medium text-gray-900">Erweiterung</span>
                                    <span className="block text-xs text-gray-500">Erweiterte Funktionen</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                                <input
                                    type="radio"
                                    name="role"
                                    value="AD"
                                    checked={selectedRole === 'AD'}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="text-purple-600"
                                />
                                <div>
                                    <span className="block font-medium text-gray-900">Admin</span>
                                    <span className="block text-xs text-gray-500">Voller Systemzugriff</span>
                                </div>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setApprovingUser(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={confirmApprove}
                                className="px-6 py-2 bg-[#294D9D] text-white hover:bg-blue-800 rounded-lg text-sm font-medium shadow-sm"
                            >
                                Freigeben
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
