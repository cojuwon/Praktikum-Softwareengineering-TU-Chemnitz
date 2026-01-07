'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Calendar, CheckCircle2, Clock, MapPin, Milestone, Users, FileText } from 'lucide-react';
import { BeratungsterminFormDialog } from '@/components/beratung/BeratungsterminFormDialog';
import { BegleitungFormDialog } from '@/components/begleitung/BegleitungFormDialog';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

interface FallDetail {
    fall_id: number;
    klient: number;
    klient_detail?: any;
    mitarbeiterin: number;
    status: 'O' | 'L' | 'A' | 'G';
    startdatum: string;
    notizen: string;
}

interface Beratungstermin {
    id: number;
    beratungs_id?: number; // Handle both ID fields if API varies, usually one is primary
    termin_beratung: string;
    beratungsstelle: string;
    beratungsart: string;
    anzahl_beratungen: number;
    notizen_beratung: string;
    berater: number;
}

interface Begleitung {
    begleitungs_id: number;
    datum: string;
    einrichtung: string;
    dolmetscher_stunden: string;
    notizen: string;
}

type TimelineEvent =
    | { type: 'termin'; date: Date; data: Beratungstermin }
    | { type: 'begleitung'; date: Date; data: Begleitung };

// === LABEL MAPPINGS ===
const BERATUNGSART_LABELS: Record<string, string> = {
    'P': 'Persönlich',
    'V': 'Video',
    'T': 'Telefon',
    'A': 'Aufsuchend',
    'S': 'Schriftlich',
};

const BERATUNGSSTELLE_LABELS: Record<string, string> = {
    'LS': 'Leipzig Stadt',
    'NS': 'Nordsachsen',
    'LL': 'Landkreis Leipzig',
};

const KLIENT_ROLLE_LABELS: Record<string, string> = {
    'B': 'Betroffene',
    'A': 'Angehörige',
    'F': 'Fachkraft',
    'M': 'Multiplikator:in',
};

const GESCHLECHT_LABELS: Record<string, string> = {
    'CW': 'Cis-Frau',
    'CM': 'Cis-Mann',
    'TW': 'Trans-Frau',
    'TM': 'Trans-Mann',
    'NB': 'Nicht-binär',
    'IA': 'Inter/Andere',
};

const SEXUALITAET_LABELS: Record<string, string> = {
    'H': 'Heterosexuell',
    'L': 'Lesbisch',
    'S': 'Schwul',
    'B': 'Bisexuell',
    'P': 'Pansexuell',
    'A': 'Asexuell',
    'Q': 'Queer',
    'U': 'Unbekannt/Keine Angabe',
};

const WOHNORT_LABELS: Record<string, string> = {
    'LS': 'Leipzig Stadt',
    'NS': 'Nordsachsen',
    'LL': 'Landkreis Leipzig',
};

const JA_NEIN_KA_LABELS: Record<string, string> = {
    'J': 'Ja',
    'N': 'Nein',
    'K': 'Keine Angabe',
};

export default function FallDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [fall, setFall] = useState<FallDetail | null>(null);
    const [termins, setTermins] = useState<Beratungstermin[]>([]);
    const [begleitungen, setBegleitungen] = useState<Begleitung[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    // Dialog States
    const [isTerminDialogOpen, setIsTerminDialogOpen] = useState(false);
    const [selectedTermin, setSelectedTermin] = useState<Beratungstermin | null>(null);

    const [isBegleitungDialogOpen, setIsBegleitungDialogOpen] = useState(false);
    const [selectedBegleitung, setSelectedBegleitung] = useState<Begleitung | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [fallRes, terminRes, begleitungRes] = await Promise.all([
                apiClient.get(`/faelle/${id}/`),
                apiClient.get(`/beratungstermine/?fall=${id}`),
                apiClient.get(`/begleitungen/?fall=${id}`),
            ]);
            setFall(fallRes.data);

            // Normalize Termine
            const terminData = Array.isArray(terminRes.data) ? terminRes.data : terminRes.data.results || [];
            // Ensure ID access (some APIs return 'beratungs_id', some 'id')
            const normalizedTermins = terminData.map((t: any) => ({ ...t, beratungs_id: t.beratungs_id || t.id }));
            setTermins(normalizedTermins);

            // Normalize Begleitungen
            const begleitungData = Array.isArray(begleitungRes.data) ? begleitungRes.data : begleitungRes.data.results || [];
            setBegleitungen(begleitungData);

        } catch (error) {
            console.error('Error fetching fall details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCreateTermin = () => {
        setSelectedTermin(null);
        setIsTerminDialogOpen(true);
    };

    const handleEditTermin = (termin: Beratungstermin) => {
        setSelectedTermin(termin);
        setIsTerminDialogOpen(true);
    };

    const handleCreateBegleitung = () => {
        setSelectedBegleitung(null);
        setIsBegleitungDialogOpen(true);
    };

    const handleEditBegleitung = (b: Begleitung) => {
        setSelectedBegleitung(b);
        setIsBegleitungDialogOpen(true);
    };


    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!fall) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-red-500">
                Fall nicht gefunden.
            </div>
        );
    }

    const now = new Date();

    // Separate Future vs History
    // Future: Only Termine usually (since Begleitung is "done" usually, but can be planned). 
    // Let's assume Begleitung with future date is also "Planned".

    // Create Unified Events
    const allEvents: TimelineEvent[] = [
        ...termins.map(t => ({ type: 'termin' as const, date: new Date(t.termin_beratung), data: t })),
        ...begleitungen.map(b => ({ type: 'begleitung' as const, date: new Date(b.datum), data: b }))
    ];

    const futureEvents = allEvents
        .filter(e => e.date >= now)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    const pastEvents = allEvents
        .filter(e => e.date < now)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Zurück
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Fall #{fall.fall_id}
                        </h1>
                        <Badge variant={fall.status === 'L' ? 'info' : 'secondary'}>
                            {fall.status === 'L' ? 'Laufend' : fall.status === 'O' ? 'Offen' : fall.status}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <p className="text-gray-500">Klient:in</p>
                            <p className="font-medium text-lg">
                                {fall.klient_detail ? (
                                    <>
                                        <span className="text-gray-500 text-sm">#{fall.klient}</span>{' '}
                                        {KLIENT_ROLLE_LABELS[fall.klient_detail.klient_rolle] || fall.klient_detail.klient_rolle}
                                        {fall.klient_detail.klient_geschlechtsidentitaet && (
                                            <span className="text-gray-500 text-sm ml-2">
                                                ({GESCHLECHT_LABELS[fall.klient_detail.klient_geschlechtsidentitaet] || fall.klient_detail.klient_geschlechtsidentitaet})
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>Klient:in #{fall.klient}</>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Zuständig</p>
                            <p className="font-medium">
                                {fall.mitarbeiterin ? `Mitarbeiter:in #${fall.mitarbeiterin}` : 'Nicht zugewiesen'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Startdatum</p>
                            <p className="font-medium">{new Date(fall.startdatum).toLocaleDateString('de-DE')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Client Profile & Notes */}
                <div className="space-y-6">
                    {/* CLIENT PROFILE */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-600" />
                                Klient:in Profil
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/klienten?edit=${fall.klient}`)}
                            >
                                Bearbeiten
                            </Button>
                        </div>

                        {fall.klient_detail ? (
                            <div className="space-y-3 text-sm">
                                {/* ID & Rolle */}
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">ID</span>
                                    <span className="font-medium">#{fall.klient}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Rolle</span>
                                    <span className="font-medium">{KLIENT_ROLLE_LABELS[fall.klient_detail.klient_rolle] || fall.klient_detail.klient_rolle}</span>
                                </div>

                                {/* Demographics */}
                                {fall.klient_detail.klient_alter && (
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Alter</span>
                                        <span className="font-medium">{fall.klient_detail.klient_alter} Jahre</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Geschlecht</span>
                                    <span className="font-medium">{GESCHLECHT_LABELS[fall.klient_detail.klient_geschlechtsidentitaet] || fall.klient_detail.klient_geschlechtsidentitaet}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Sexualität</span>
                                    <span className="font-medium">{SEXUALITAET_LABELS[fall.klient_detail.klient_sexualitaet] || fall.klient_detail.klient_sexualitaet}</span>
                                </div>

                                {/* Location & Work */}
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Wohnort</span>
                                    <span className="font-medium">{WOHNORT_LABELS[fall.klient_detail.klient_wohnort] || fall.klient_detail.klient_wohnort}</span>
                                </div>
                                {fall.klient_detail.klient_staatsangehoerigkeit && (
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Staatsangehörigkeit</span>
                                        <span className="font-medium">{fall.klient_detail.klient_staatsangehoerigkeit}</span>
                                    </div>
                                )}
                                {fall.klient_detail.klient_beruf && (
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Beruf</span>
                                        <span className="font-medium">{fall.klient_detail.klient_beruf}</span>
                                    </div>
                                )}

                                {/* Special needs */}
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-500">Schwerbehinderung</span>
                                    <span className="font-medium">{JA_NEIN_KA_LABELS[fall.klient_detail.klient_schwerbehinderung] || fall.klient_detail.klient_schwerbehinderung}</span>
                                </div>
                                {fall.klient_detail.klient_schwerbehinderung === 'J' && fall.klient_detail.klient_schwerbehinderung_detail && (
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Details</span>
                                        <span className="font-medium text-right max-w-[60%]">{fall.klient_detail.klient_schwerbehinderung_detail}</span>
                                    </div>
                                )}

                                {/* Languages */}
                                {fall.klient_detail.klient_dolmetschungssprachen && (
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Dolmetschungssprachen</span>
                                        <span className="font-medium">{fall.klient_detail.klient_dolmetschungssprachen}</span>
                                    </div>
                                )}

                                {/* Source */}
                                {fall.klient_detail.klient_kontaktpunkt && (
                                    <div className="flex justify-between pb-2">
                                        <span className="text-gray-500">Kontaktpunkt</span>
                                        <span className="font-medium text-right max-w-[60%]">{fall.klient_detail.klient_kontaktpunkt}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">Keine Klient:in-Details verfügbar.</p>
                        )}
                    </div>

                    {/* NOTES */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Notizen zum Fall</h2>
                        <div className="prose prose-sm max-w-none text-gray-600">
                            {fall.notizen || <span className="italic text-gray-400">Keine Notizen vorhanden.</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ACTIONS BAR */}
                    <div className="flex gap-4">
                        <Button onClick={handleCreateTermin} className="flex-1 bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> Termin planen
                        </Button>
                        <Button onClick={handleCreateBegleitung} variant="outline" className="flex-1">
                            <Plus className="w-4 h-4 mr-2" /> Begleitung erfassen
                        </Button>
                    </div>

                    {/* FUTURE */}
                    {futureEvents.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Demnächst
                            </h2>
                            <div className="space-y-3">
                                {futureEvents.map((e, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100"
                                        onClick={() => e.type === 'termin' ? handleEditTermin(e.data) : handleEditBegleitung(e.data)}
                                    >
                                        <div className="mr-4 text-center min-w-[50px]">
                                            <div className="text-xs text-blue-600 font-bold uppercase">{e.date.toLocaleDateString('de-DE', { month: 'short' })}</div>
                                            <div className="text-xl font-bold text-gray-900">{e.date.getDate()}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {e.type === 'termin' ? (
                                                    <Badge variant="default" className="bg-blue-100 text-blue-800 border-none">Termin</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-none">Begleitung</Badge>
                                                )}
                                                <span className="text-sm font-medium text-gray-900">
                                                    {e.type === 'termin'
                                                        ? BERATUNGSART_LABELS[e.data.beratungsart] || e.data.beratungsart
                                                        : e.data.einrichtung}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {e.date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                                                {e.type === 'termin' && (
                                                    <>
                                                        <span className="mx-1">•</span>
                                                        <MapPin className="w-3 h-3" /> {BERATUNGSSTELLE_LABELS[e.data.beratungsstelle] || e.data.beratungsstelle}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* HISTORY TIMELINE */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Milestone className="w-5 h-5 text-gray-500" />
                            Verlauf & Historie
                        </h2>

                        {pastEvents.length > 0 ? (
                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pl-8 pb-4">
                                {pastEvents.map((e, idx) => (
                                    <div key={idx} className="relative group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-[41px] top-1.5 h-5 w-5 rounded-full border-4 border-white shadow-sm ${e.type === 'termin' ? 'bg-blue-400' : 'bg-amber-400'}`} />

                                        <div
                                            className="cursor-pointer hover:bg-gray-50 -m-3 p-3 rounded-lg transition-colors"
                                            onClick={() => e.type === 'termin' ? handleEditTermin(e.data) : handleEditBegleitung(e.data)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {e.date.toLocaleDateString('de-DE')}
                                                    </span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                        {e.type === 'termin' ? 'Beratung' : 'Begleitung'}
                                                    </span>
                                                </div>
                                                {/* Time or duration if available */}
                                                <span className="text-xs text-gray-400">
                                                    {e.type === 'termin'
                                                        ? e.date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
                                                        : ''
                                                    }
                                                </span>
                                            </div>

                                            <div className="text-base font-medium text-gray-800 mb-2">
                                                {e.type === 'termin'
                                                    ? BERATUNGSART_LABELS[e.data.beratungsart] || e.data.beratungsart
                                                    : e.data.einrichtung}
                                            </div>

                                            {/* Content / Notes */}
                                            {(e.type === 'termin' ? e.data.notizen_beratung : e.data.notizen) && (
                                                <div
                                                    className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 border border-gray-100 prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{
                                                        __html: e.type === 'termin' ? e.data.notizen_beratung : e.data.notizen
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Keine vergangenen Ereignisse dokumentiert.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <BeratungsterminFormDialog
                isOpen={isTerminDialogOpen}
                onClose={() => setIsTerminDialogOpen(false)}
                onSuccess={fetchData}
                fallId={fall.fall_id}
                initialData={selectedTermin}
            />

            <BegleitungFormDialog
                isOpen={isBegleitungDialogOpen}
                onClose={() => setIsBegleitungDialogOpen(false)}
                onSuccess={fetchData}
                fallId={fall.fall_id}
                klientId={fall.klient}
                initialData={selectedBegleitung}
            />
        </div>
    );
}
