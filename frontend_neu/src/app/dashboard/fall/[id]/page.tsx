'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { BeratungsterminFormDialog } from '@/components/beratung/BeratungsterminFormDialog';
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
    beratungs_id: number;
    termin_beratung: string;
    beratungsstelle: string;
    beratungsart: string;
    anzahl_beratungen: number;
    notizen_beratung: string;
    berater: number;
}

export default function FallDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [fall, setFall] = useState<FallDetail | null>(null);
    const [termins, setTermins] = useState<Beratungstermin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false); // Placeholder for creating notes
    const [isTerminDialogOpen, setIsTerminDialogOpen] = useState(false);
    const [selectedTermin, setSelectedTermin] = useState<Beratungstermin | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [fallRes, terminRes] = await Promise.all([
                apiClient.get(`/faelle/${id}/`),
                apiClient.get(`/beratungstermine/?fall=${id}`),
            ]);
            setFall(fallRes.data);
            // Ensure termins is an array
            const terminData = Array.isArray(terminRes.data) ? terminRes.data : terminRes.data.results || [];
            setTermins(terminData);
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
    const plannedTermins = termins
        .filter(t => new Date(t.termin_beratung) >= now)
        .sort((a, b) => new Date(a.termin_beratung).getTime() - new Date(b.termin_beratung).getTime());

    const pastTermins = termins
        .filter(t => new Date(t.termin_beratung) < now)
        .sort((a, b) => new Date(b.termin_beratung).getTime() - new Date(a.termin_beratung).getTime()); // Descending

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
                                    <>#{fall.klient} {fall.klient_detail.klient_rolle}</>
                                ) : (
                                    <>#{fall.klient}</>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Zuständig</p>
                            <p className="font-medium">
                                {fall.mitarbeiterin ? `User #${fall.mitarbeiterin}` : 'Nicht zugewiesen'}
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

                {/* Left Column: Overview & Notes which could go here later */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4">Notizen zum Fall</h2>
                        <div className="prose prose-sm max-w-none text-gray-600">
                            {fall.notizen || <span className="italic text-gray-400">Keine Notizen vorhanden.</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Appointments */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Planned Appointments */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Geplante Termine
                            </h2>
                            <Button size="sm" onClick={handleCreateTermin}>
                                <Plus className="w-4 h-4 mr-1" />
                                Planen
                            </Button>
                        </div>

                        {plannedTermins.length > 0 ? (
                            <div className="space-y-4">
                                {plannedTermins.map(t => (
                                    <div key={t.beratungs_id}
                                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer"
                                        onClick={() => handleEditTermin(t)}
                                    >
                                        <div className="flex flex-col items-center bg-white p-2 rounded border border-gray-200 min-w-[60px]">
                                            <span className="text-xs text-gray-500 font-medium uppercase">
                                                {new Date(t.termin_beratung).toLocaleDateString('de-DE', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-bold text-gray-900">
                                                {new Date(t.termin_beratung).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex gap-2 items-center text-sm text-gray-500 mb-1">
                                                <Clock className="w-3 h-3" />
                                                <span>
                                                    {new Date(t.termin_beratung).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                                                </span>
                                                <span className="mx-1">•</span>
                                                <MapPin className="w-3 h-3" />
                                                <span>{t.beratungsstelle}</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900">Beratungstermin ({t.beratungsart})</h3>
                                            {t.notizen_beratung && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{t.notizen_beratung}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-gray-500">Keine geplanten Termine.</p>
                        )}
                    </div>

                    {/* Past Appointments (History) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 opacity-90">
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-gray-400" />
                            Vergangene Termine / Dokumentation
                        </h2>

                        {pastTermins.length > 0 ? (
                            <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pl-6 pb-2">
                                {pastTermins.map(t => (
                                    <div key={t.beratungs_id} className="relative">
                                        {/* Dot on timeline */}
                                        <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-gray-300" />

                                        <div className="flex justify-between items-start mb-1 cursor-pointer hover:underline" onClick={() => handleEditTermin(t)}>
                                            <span className="font-medium text-gray-900">
                                                {new Date(t.termin_beratung).toLocaleDateString('de-DE')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            {new Date(t.termin_beratung).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr • {t.beratungsart}
                                        </p>
                                        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                                            {t.notizen_beratung ? (
                                                <p className="whitespace-pre-wrap">{t.notizen_beratung}</p>
                                            ) : (
                                                <p className="italic text-gray-400">Keine Dokumentation.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-4 text-gray-500">Keine vergangenen Termine.</p>
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
        </div>
    );
}
