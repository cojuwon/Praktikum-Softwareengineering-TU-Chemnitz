'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/api-client';
import { usePermissions } from '@/hooks/usePermissions';
import { Switch } from '@/components/ui/Switch';
import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { BeratungsterminFormDialog } from '@/components/beratung/BeratungsterminFormDialog';
import { Skeleton } from '@/components/ui/Skeleton';

interface Beratungstermin {
    beratungs_id: number;
    termin_beratung: string;
    beratungsstelle: string;
    beratungsart: string;
    anzahl_beratungen: number;
    notizen_beratung: string;
    berater: number;
    fall?: number;
}

export default function TerminePage() {
    const { can, Permissions } = usePermissions();
    const [termins, setTermins] = useState<Beratungstermin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTermin, setSelectedTermin] = useState<Beratungstermin | null>(null);

    const canViewAll = can('api.view_all_beratungstermin') || can('api.can_view_all_data');

    const fetchTermins = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (canViewAll && showAll) {
                params.view = 'all';
            }
            const response = await apiClient.get('/beratungstermine/', { params });
            setTermins(Array.isArray(response.data) ? response.data : (response.data as any).results || []);
        } catch (error) {
            console.error('Fehler beim Laden der Termine:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTermins();
    }, [showAll, canViewAll]);

    const handleEditTermin = (termin: Beratungstermin) => {
        setSelectedTermin(termin);
        setIsDialogOpen(true);
    };

    const handleDialogSuccess = () => {
        fetchTermins();
    };

    // Group by date
    const sortedTermins = useMemo(() => {
        return [...termins].sort((a, b) => new Date(a.termin_beratung).getTime() - new Date(b.termin_beratung).getTime());
    }, [termins]);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Terminübersicht</h1>
                        <p className="text-gray-500 mt-1">Alle geplanten und vergangenen Termine</p>
                    </div>

                    {canViewAll && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
                            <Switch
                                id="show-all-switch"
                                checked={showAll}
                                onCheckedChange={setShowAll}
                            />
                            <label htmlFor="show-all-switch" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                Alle Termine anzeigen
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                ) : sortedTermins.length > 0 ? (
                    <div className="space-y-4">
                        {sortedTermins.map(t => {
                            const date = new Date(t.termin_beratung);
                            const isPast = date < new Date();

                            return (
                                <div key={t.beratungs_id}
                                    className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition cursor-pointer ${isPast ? 'opacity-70 bg-gray-50' : ''}`}
                                    onClick={() => handleEditTermin(t)}
                                >
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                        <div className="flex gap-4 items-center">
                                            <div className={`flex flex-col items-center p-3 rounded-lg border ${isPast ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-blue-50 border-blue-100 text-blue-700'} min-w-[70px]`}>
                                                <span className="text-xs font-bold uppercase">{date.toLocaleDateString('de-DE', { month: 'short' })}</span>
                                                <span className="text-2xl font-bold">{date.getDate()}</span>
                                                <span className="text-xs">{date.toLocaleDateString('de-DE', { weekday: 'short' })}</span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Beratung ({t.beratungsart})
                                                    </h3>
                                                    {isPast && <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Vergangen</span>}
                                                </div>

                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-4 h-4" />
                                                        {t.beratungsstelle}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 hover:text-blue-600" onClick={(e) => e.stopPropagation()}>
                                                        <User className="w-4 h-4" />
                                                        User #{t.berater}
                                                    </div>
                                                    {t.fall && (
                                                        <div className="flex items-center gap-1.5 hover:text-blue-600 z-10" onClick={(e) => e.stopPropagation()}>
                                                            <FileText className="w-4 h-4" />
                                                            <Link href={`/dashboard/fall/${t.fall}`} className="hover:underline">
                                                                Fall #{t.fall}
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {t.notizen_beratung && (
                                            <div className="max-w-md w-full md:w-auto bg-gray-50 p-3 rounded text-sm text-gray-600 line-clamp-2 italic border border-gray-100">
                                                "{t.notizen_beratung}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p>Keine Termine gefunden.</p>
                    </div>
                )}
            </div>

            <BeratungsterminFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={handleDialogSuccess}
                initialData={selectedTermin}
            />
        </div>
    );
}
