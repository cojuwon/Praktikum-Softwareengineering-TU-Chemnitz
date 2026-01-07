import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { X, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

const beratungsterminSchema = z.object({
    termin_beratung: z.string().min(1, 'Datum ist erforderlich'),
    beratungsstelle: z.enum(['LS', 'NS', 'LL']),
    beratungsart: z.enum(['P', 'V', 'T', 'A', 'S']),
    anzahl_beratungen: z.number().min(1),
    notizen_beratung: z.string().optional(),
});

type BeratungsterminFormData = z.infer<typeof beratungsterminSchema>;

interface BeratungsterminFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fallId?: number; // Optional: If creating for a specific case
    initialData?: any; // Optional: For editing
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
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset();
            setError(null);
            if (initialData) {
                setValue('termin_beratung', initialData.termin_beratung);
                setValue('beratungsstelle', initialData.beratungsstelle);
                setValue('beratungsart', initialData.beratungsart);
                setValue('anzahl_beratungen', initialData.anzahl_beratungen || 1);
                setValue('notizen_beratung', initialData.notizen_beratung);
            } else {
                // Set default date to today for new appointments
                setValue('termin_beratung', new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, initialData, reset, setValue]);

    const onSubmit = async (data: BeratungsterminFormData) => {
        setError(null);
        try {
            const payload = {
                ...data,
                fall: fallId, // Link to the case
            };

            if (initialData?.beratungs_id) {
                await apiClient.patch(`/beratungstermine/${initialData.beratungs_id}/`, payload);
            } else {
                await apiClient.post('/beratungstermine/', payload);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error saving appointment:', err);
            setError(err.response?.data?.detail || 'Fehler beim Speichern des Termins.');
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Termin bearbeiten' : 'Neuer Beratungstermin'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {/* Datum */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Datum *
                        </label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('termin_beratung')}
                            />
                        </div>
                        {errors.termin_beratung && (
                            <p className="text-sm text-red-500">{errors.termin_beratung.message}</p>
                        )}
                    </div>

                    {/* Anzahl (Dauer/Einheiten) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Anzahl (Einheiten)
                        </label>
                        <input
                            type="number"
                            min="1"
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                            {...register('anzahl_beratungen', { valueAsNumber: true })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Ort / Beratungsstelle */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Ort / Stelle</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                {...register('beratungsstelle')}
                            >
                                <option value="LS">Leipzig Stadt</option>
                                <option value="NS">Nordsachsen</option>
                                <option value="LL">Landkreis Leipzig</option>
                            </select>
                        </div>
                    </div>

                    {/* Art */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Durchführung</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                                {...register('beratungsart')}
                            >
                                <option value="P">Persönlich</option>
                                <option value="V">Video</option>
                                <option value="T">Telefon</option>
                                <option value="A">Aufsuchend</option>
                                <option value="S">Schriftlich</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notizen (Optional) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Notizen (Optional)</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Kurze Notiz zum Termin..."
                        {...register('notizen_beratung')}
                    />
                </div>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Speichert...' : initialData ? 'Speichern' : 'Planen'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}
