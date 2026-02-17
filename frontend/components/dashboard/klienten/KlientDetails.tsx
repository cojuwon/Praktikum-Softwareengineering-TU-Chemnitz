'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { User, Briefcase, MapPin, Calendar, Activity, Info, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Fall {
    fall_id: number;
    status: string;
    startdatum: string;
    notizen: string;
}

interface KlientDetailsProps {
    id: string;
}

export default function KlientDetails({ id }: KlientDetailsProps) {
    const [klient, setKlient] = useState<any>(null);
    const [faelle, setFaelle] = useState<Fall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch Client
                const resKlient = await apiFetch(`/api/klienten/${id}/`);
                if (!resKlient.ok) throw new Error('Klient nicht gefunden');
                const klientData = await resKlient.json();
                setKlient(klientData);

                // Fetch Cases for this Client
                // Assuming cases can be filtered by klient_id or retrieved via a nested endpoint
                const resFaelle = await apiFetch(`/api/faelle/?klient=${id}`);
                if (resFaelle.ok) {
                    const faelleData = await resFaelle.json();
                    setFaelle(Array.isArray(faelleData) ? faelleData : faelleData.results || []);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Fehler beim Laden');
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Laden...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!klient) return <div className="p-8 text-center text-slate-500">Keine Daten gefunden.</div>;

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'B': return 'Betroffene:r';
            case 'A': return 'Angehörige:r';
            case 'F': return 'Fachkraft';
            default: return role;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                            <User size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {klient.klient_pseudonym || `Klient:in ${klient.klient_id}`}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                    ${klient.klient_rolle === 'B' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                        klient.klient_rolle === 'A' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                    {getRoleLabel(klient.klient_rolle)}
                                </span>
                                <span className="text-xs text-slate-400">ID: {klient.klient_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Info size={18} className="text-blue-500" /> Persönliche Informationen
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Alter</span>
                                <span className="text-slate-700">{klient.klient_alter ? `${klient.klient_alter} Jahre` : 'Keine Angabe'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Geschlechtsidentität</span>
                                <span className="text-slate-700">{klient.klient_geschlechtsidentitaet || 'Keine Angabe'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Wohnort</span>
                                <span className="text-slate-700 flex items-center gap-1">
                                    <MapPin size={14} className="text-slate-400" /> {klient.klient_wohnort}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sexualität</span>
                                <span className="text-slate-700">{klient.klient_sexualitaet}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Beruf</span>
                                <span className="text-slate-700">{klient.klient_beruf || '-'}</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Staatsangehörigkeit</span>
                                <span className="text-slate-700">{klient.klient_staatsangehoerigkeit || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-rose-500" /> Besonderheiten
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Schwerbehinderung</span>
                                <span className="text-slate-700">{klient.klient_schwerbehinderung === 'J' ? 'Ja' : 'Nein'}</span>
                                {klient.klient_schwerbehinderung_detail && (
                                    <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded-md">{klient.klient_schwerbehinderung_detail}</p>
                                )}
                            </div>
                            <div>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Migrationshintergrund</span>
                                <span className="text-slate-700">{klient.klient_migrationshintergrund === 'J' ? 'Ja' : 'Nein'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Cases & System Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Briefcase size={18} className="text-emerald-500" /> Zugeordnete Fälle
                            </h3>
                            <Link href="/dashboard/fall/neu">
                                <span className="text-xs bg-emerald-50 text-emerald-700 py-1 px-2 rounded-md hover:bg-emerald-100 cursor-pointer transition-colors">+ Neu</span>
                            </Link>
                        </div>

                        {faelle.length > 0 ? (
                            <div className="space-y-3">
                                {faelle.map(fall => (
                                    <Link key={fall.fall_id} href={`/dashboard/fall/${fall.fall_id}`}>
                                        <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100 cursor-pointer group">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium text-slate-700 group-hover:text-blue-600">Fall {fall.fall_id}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${fall.status === 'O' ? 'bg-blue-100 text-blue-700' :
                                                    fall.status === 'L' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {fall.status === 'O' ? 'Offen' : fall.status === 'L' ? 'Laufend' : 'Abgeschlossen'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                <Calendar size={12} /> {new Date(fall.startdatum).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                Keine Fälle zugeordnet
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-100 p-6">
                        <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                            <AlertTriangle size={16} /> Datenschutz-Hinweis
                        </h3>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Achten Sie bei der Bearbeitung darauf, dass keine Rückschlüsse auf die reale Identität der Person möglich sind.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
