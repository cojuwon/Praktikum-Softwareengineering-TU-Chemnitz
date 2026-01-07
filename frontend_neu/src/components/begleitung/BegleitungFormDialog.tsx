'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import {
    AlertCircle,
    Loader2,
    Calendar,
    Building2,
    Clock,
    FileText
} from 'lucide-react';
import { z } from 'zod';
import apiClient from '@/lib/api-client';

const begleitungFormSchema = z.object({
    datum: z.string().date(),
    einrichtung: z.string().min(1, 'Einrichtung ist erforderlich').max(255),
    dolmetscher_stunden: z.number().min(0).default(0),
    notizen: z.string().max(5000).optional().default(''),
});

type BegleitungFormData = z.infer<typeof begleitungFormSchema>;

interface BegleitungFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    fallId: number;
    klientId: number; // Required for creating Begleitung
    initialData?: any; // If editing
}

export function BegleitungFormDialog({
    isOpen,
    onClose,
    onSuccess,
    fallId,
    klientId,
    initialData
}: BegleitungFormDialogProps) {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<Partial<BegleitungFormData>>({
        datum: today,
        einrichtung: '',
        dolmetscher_stunden: 0,
        notizen: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    datum: initialData.datum,
                    einrichtung: initialData.einrichtung,
                    dolmetscher_stunden: parseFloat(initialData.dolmetscher_stunden) || 0,
                    notizen: initialData.notizen || ''
                });
            } else {
                setFormData({
                    datum: today,
                    einrichtung: '',
                    dolmetscher_stunden: 0,
                    notizen: '',
                });
            }
            setErrors({});
            setError(null);
        }
    }, [isOpen, initialData, today]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let val: any = value;
        if (type === 'number') {
            val = value ? parseFloat(value) : 0;
        }
        setFormData({ ...formData, [name]: val });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        setError(null);

        try {
            const validated = begleitungFormSchema.parse(formData);
            const payload = { ...validated, fall: fallId, klient: klientId };

            if (initialData?.begleitungs_id) {
                await apiClient.put(`/begleitungen/${initialData.begleitungs_id}/`, payload);
            } else {
                await apiClient.post('/begleitungen/', payload);
            }

            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach((error) => {
                    const path = error.path.join('.');
                    fieldErrors[path] = error.message;
                });
                setErrors(fieldErrors);
            } else if ((err as any)?.response?.data) {
                // Format field errors from backend
                const errorData = (err as any).response.data;
                const errorMessages = Object.entries(errorData)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join('\n');
                setError(errorMessages || 'Fehler beim Speichern.');
            } else {
                console.error(err);
                setError('Fehler beim Speichern.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Begleitung bearbeiten" : "Neue Begleitung erfassen"}
            description="Dokumentieren Sie eine Begleitung oder Verweisung."
            size="lg"
        >
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-md flex gap-2 items-center text-sm">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> Datum *
                            </label>
                            <input
                                type="date"
                                name="datum"
                                value={formData.datum}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.datum && <p className="text-red-500 text-xs mt-1">{errors.datum}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Dolmetscher-Stunden
                            </label>
                            <input
                                type="number"
                                step="0.25"
                                min="0"
                                name="dolmetscher_stunden"
                                value={formData.dolmetscher_stunden}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {errors.dolmetscher_stunden && <p className="text-red-500 text-xs mt-1">{errors.dolmetscher_stunden}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" /> Einrichtung *
                        </label>
                        <input
                            type="text"
                            name="einrichtung"
                            placeholder="z.B. Jobcenter, Gericht, Arzt"
                            value={formData.einrichtung}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.einrichtung && <p className="text-red-500 text-xs mt-1">{errors.einrichtung}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> Notizen
                        </label>
                        <textarea
                            name="notizen"
                            rows={3}
                            value={formData.notizen}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Was wurde gemacht? Ergebnisse?"
                        />
                    </div>

                    <DialogFooter>
                        <div className="flex gap-2 justify-end pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Speichern
                            </button>
                        </div>
                    </DialogFooter>
                </form>
            </div>
        </Dialog>
    );
}
