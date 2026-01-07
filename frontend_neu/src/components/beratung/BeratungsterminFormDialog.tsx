import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { Calendar as CalendarIcon, MapPin, Clock, User, CheckCircle2 } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

const beratungsterminSchema = z.object({
    termin_datum: z.string().min(1, 'Datum ist erforderlich'),
    termin_zeit: z.string().min(1, 'Zeit ist erforderlich'),
    dauer: z.number().min(0),
    status: z.enum(['g', 's', 'a']), // g=geplant, s=stattgefunden, a=ausgefallen
    beratungsstelle: z.enum(['LS', 'NS', 'LL']),
    beratungsart: z.enum(['P', 'V', 'T', 'A', 'S']),
    anzahl_beratungen: z.number().min(1),
    dolmetscher_stunden: z.number().min(0),
    notizen_beratung: z.string().optional(),
});

type BeratungsterminFormData = z.infer<typeof beratungsterminSchema>;

interface BeratungsterminFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fallId?: number;
    initialData?: any;
}

export function BeratungsterminFormDialog({
    isOpen,
    onClose,
    onSuccess,
    fallId,
    initialData,
}: BeratungsterminFormDialogProps) {
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<BeratungsterminFormData>({
        resolver: zodResolver(beratungsterminSchema),
        defaultValues: {
            anzahl_beratungen: 1,
            beratungsstelle: 'LS',
            beratungsart: 'P',
            notizen_beratung: '',
            dauer: 60,
            status: 'g',
            termin_datum: new Date().toISOString().split('T')[0],
            termin_zeit: '10:00',
            dolmetscher_stunden: 0,
        },
    });

    useEffect(() => {
        if (isOpen) {
            setError(null);
            if (initialData) {
                // Parse DateTime string into Datum & Zeit
                const dt = new Date(initialData.termin_beratung);
                const dateStr = dt.toISOString().split('T')[0];
                const timeStr = dt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

                setValue('termin_datum', dateStr);
                setValue('termin_zeit', timeStr);
                setValue('beratungsstelle', initialData.beratungsstelle);
                setValue('beratungsart', initialData.beratungsart);
                setValue('anzahl_beratungen', initialData.anzahl_beratungen || 1);
                setValue('notizen_beratung', initialData.notizen_beratung || '');
                setValue('dauer', initialData.dauer || 60);
                setValue('status', initialData.status || 'g');
                setValue('dolmetscher_stunden', initialData.dolmetscher_stunden ? parseFloat(initialData.dolmetscher_stunden) : 0);
            } else {
                reset({
                    anzahl_beratungen: 1,
                    beratungsstelle: 'LS',
                    beratungsart: 'P',
                    notizen_beratung: '',
                    dauer: 60,
                    status: 'g',
                    termin_datum: new Date().toISOString().split('T')[0],
                    termin_zeit: '10:00',
                    dolmetscher_stunden: 0,
                });
            }
        }
    }, [isOpen, initialData, reset, setValue]);

    const onSubmit = async (data: BeratungsterminFormData) => {
        setError(null);
        try {
            // Combine Datum & Zeit
            const combinedDateTime = `${data.termin_datum}T${data.termin_zeit}:00`;

            const payload = {
                termin_beratung: combinedDateTime,
                dauer: data.dauer,
                status: data.status,
                beratungsstelle: data.beratungsstelle,
                beratungsart: data.beratungsart,
                anzahl_beratungen: data.anzahl_beratungen,
                dolmetscher_stunden: data.dolmetscher_stunden,
                notizen_beratung: data.notizen_beratung,
                fall: fallId,
            };

            if (initialData?.beratungs_id || initialData?.id) {
                const id = initialData.beratungs_id || initialData.id;
                await apiClient.patch(`/beratungstermine/${id}/`, payload);
            } else {
                await apiClient.post('/beratungstermine/', payload);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error saving appointment:', err);
            // Extract detailed validation errors from backend
            const errorData = err.response?.data;
            if (errorData && typeof errorData === 'object') {
                // Format field errors
                const errorMessages = Object.entries(errorData)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
                setError(errorMessages || 'Fehler beim Speichern des Termins.');
            } else {
                setError(err.response?.data?.detail || 'Fehler beim Speichern des Termins.');
            }
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Termin bearbeiten' : 'Neuer Beratungstermin'}
            size="2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4 px-2">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium">Datum *</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <input
                                        type="date"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        {...register('termin_datum')}
                                    />
                                </div>
                                {errors.termin_datum && <p className="text-xs text-red-500">{errors.termin_datum.message}</p>}
                            </div>
                            <div className="space-y-2 w-1/3">
                                <label className="text-sm font-medium">Zeit *</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <input
                                        type="time"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        {...register('termin_zeit')}
                                    />
                                </div>
                                {errors.termin_zeit && <p className="text-xs text-red-500">{errors.termin_zeit.message}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    {...register('status')}
                                >
                                    <option value="g">Geplant</option>
                                    <option value="s">Stattgefunden</option>
                                    <option value="a">Ausgefallen</option>
                                </select>
                            </div>
                            <div className="space-y-2 w-1/3">
                                <label className="text-sm font-medium">Dauer (Min)</label>
                                <input
                                    type="number"
                                    step="5"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    {...register('dauer', { valueAsNumber: true })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ort / Stelle</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    {...register('beratungsstelle')}
                                >
                                    <option value="LS">Leipzig Stadt</option>
                                    <option value="NS">Nordsachsen</option>
                                    <option value="LL">Landkreis Leipzig</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium">Durchführung</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    {...register('beratungsart')}
                                >
                                    <option value="P">Persönlich</option>
                                    <option value="V">Video</option>
                                    <option value="T">Telefon</option>
                                    <option value="A">Aufsuchend</option>
                                    <option value="S">Schriftlich</option>
                                </select>
                            </div>
                            <div className="space-y-2 w-1/3">
                                <label className="text-sm font-medium">Einheiten</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    {...register('anzahl_beratungen', { valueAsNumber: true })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Dolmetscher-Stunden</label>
                            <input
                                type="number"
                                step="0.25"
                                min="0"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                {...register('dolmetscher_stunden', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                </div>

                {/* Notizen (Full Width) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium block">Notizen / Dokumentation</label>
                    <Controller
                        name="notizen_beratung"
                        control={control}
                        render={({ field }) => (
                            <RichTextEditor
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Gesprächsverlauf, Ergebnisse, Vereinbarungen..."
                                className="min-h-[150px]"
                            />
                        )}
                    />
                </div>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Speichert...' : initialData ? 'Speichern' : 'Termin planen'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}
