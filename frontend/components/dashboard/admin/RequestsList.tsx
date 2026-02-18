'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiFetch } from '@/lib/api';
import { Check, X, Shield, RefreshCw, AlertTriangle } from 'lucide-react';

interface InactiveUser {
    id: number;
    vorname_mb: string;
    nachname_mb: string;
    mail_mb: string;
    date_joined?: string;
}

interface RoleOption {
    value: string;
    label: string;
}

export default function RequestsList() {
    const [requests, setRequests] = useState<InactiveUser[]>([]);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    // Modal States
    const [approvingUser, setApprovingUser] = useState<InactiveUser | null>(null);
    const [rejectingUser, setRejectingUser] = useState<InactiveUser | null>(null);
    const [selectedRole, setSelectedRole] = useState('B'); // Default Basis

    useEffect(() => {
        fetchRequests();
        fetchRoles();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/api/konten/?status_mb=P');
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.results || [];
                setRequests(list);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await apiFetch('/api/konten/roles/');
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            } else {
                // Fallback if endpoint request fails
                setRoles([
                    { value: 'B', label: 'Basis' },
                    { value: 'E', label: 'Erweiterung' },
                    { value: 'AD', label: 'Admin' }
                ]);
            }
        } catch (e) {
            console.error('Failed to fetch roles:', e);
        }
    };

    const confirmReject = async () => {
        if (!rejectingUser) return;

        setIsProcessing(rejectingUser.id);
        try {
            const res = await apiFetch(`/api/konten/${rejectingUser.id}/`, { method: 'DELETE' });
            if (res.ok) {
                setRequests(prev => prev.filter(req => req.id !== rejectingUser.id));
                setRejectingUser(null);
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
                status_mb: 'A',
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
                            onClick={() => setRejectingUser(req)}
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

            {/* Modals using Portal to fix z-index/backdrop issues */}
            {typeof document !== 'undefined' && createPortal(
                <>
                    {/* Approve Modal */}
                    {approvingUser && (
                        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center gap-3 mb-4 text-[#294D9D]">
                                    <Shield size={24} />
                                    <h3 className="text-xl font-bold">Benutzer freigeben</h3>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    Welche Rolle soll <strong>{approvingUser.vorname_mb} {approvingUser.nachname_mb}</strong> erhalten?
                                </p>

                                <div className="space-y-3 mb-8">
                                    {roles.map((role) => (
                                        <label key={role.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                                            <input
                                                type="radio"
                                                name="role"
                                                value={role.value}
                                                checked={selectedRole === role.value}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className="text-blue-600"
                                            />
                                            <div>
                                                <span className="block font-medium text-gray-900">{role.label}</span>
                                            </div>
                                        </label>
                                    ))}
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

                    {/* Reject Modal */}
                    {rejectingUser && (
                        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center gap-3 mb-4 text-red-600">
                                    <AlertTriangle size={24} />
                                    <h3 className="text-xl font-bold">Anfrage ablehnen</h3>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    Möchten Sie die Anfrage von <strong>{rejectingUser.vorname_mb} {rejectingUser.nachname_mb}</strong> wirklich ablehnen?
                                    <br />
                                    <span className="text-red-600 text-sm mt-2 block">Dieser Vorgang kann nicht rückgängig gemacht werden.</span>
                                </p>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setRejectingUser(null)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        onClick={confirmReject}
                                        className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium shadow-sm"
                                    >
                                        Ablehnen
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}
        </div>
    );
}
