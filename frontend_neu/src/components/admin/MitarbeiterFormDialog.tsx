import React, { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import api from '@/lib/api-client';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/button';

interface MitarbeiterFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: User | null;
}

const ROLES = [
    { value: 'B', label: 'Basis' },
    { value: 'E', label: 'Erweiterung' },
    { value: 'AD', label: 'Admin' },
];

export default function MitarbeiterFormDialog({ open, onClose, onSuccess, userToEdit }: MitarbeiterFormDialogProps) {
    const [formData, setFormData] = useState({
        vorname_mb: '',
        nachname_mb: '',
        mail_mb: '',
        rolle_mb: 'B',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (userToEdit) {
                setFormData({
                    vorname_mb: userToEdit.vorname_mb || '',
                    nachname_mb: userToEdit.nachname_mb || '',
                    mail_mb: userToEdit.mail_mb || '',
                    rolle_mb: userToEdit.rolle_mb || 'B',
                    password: '',
                });
            } else {
                setFormData({
                    vorname_mb: '',
                    nachname_mb: '',
                    mail_mb: '',
                    rolle_mb: 'B',
                    password: '',
                });
            }
            setErrors({});
        }
    }, [userToEdit, open]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        setErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            if (userToEdit) {
                const { password, ...updateData } = formData;
                await api.patch(`/konten/${userToEdit.id}/`, updateData);
            } else {
                await api.post('/konten/', formData);
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving user:', error);
            if (error.response?.data) {
                setErrors(error.response.data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            isOpen={open}
            onClose={onClose}
            title={userToEdit ? 'Mitarbeiter:in bearbeiten' : 'Mitarbeiter:in hinzufügen'}
            size="md"
        >
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="vorname_mb"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Vorname *
                            </label>
                            <input
                                id="vorname_mb"
                                type="text"
                                name="vorname_mb"
                                value={formData.vorname_mb}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.vorname_mb ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.vorname_mb && (
                                <p className="text-red-500 text-sm mt-1">{errors.vorname_mb}</p>
                            )}
                        </div>
                        <div>
                            <label
                                htmlFor="nachname_mb"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Nachname *
                            </label>
                            <input
                                id="nachname_mb"
                                type="text"
                                name="nachname_mb"
                                value={formData.nachname_mb}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.nachname_mb ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.nachname_mb && (
                                <p className="text-red-500 text-sm mt-1">{errors.nachname_mb}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="mail_mb"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            E-Mail *
                        </label>
                        <input
                            id="mail_mb"
                            type="email"
                            name="mail_mb"
                            value={formData.mail_mb}
                            onChange={handleChange}
                            required
                            placeholder="beispiel@email.de"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.mail_mb ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.mail_mb && (
                            <p className="text-red-500 text-sm mt-1">{errors.mail_mb}</p>
                        )}
                    </div>

                    {!userToEdit && (
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Initial-Passwort *
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Wird für den ersten Login benötigt.
                            </p>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="rolle_mb"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Rolle *
                        </label>
                        <select
                            id="rolle_mb"
                            name="rolle_mb"
                            value={formData.rolle_mb}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {ROLES.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DialogFooter>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? 'Speichern...' : 'Speichern'}
                            </button>
                        </div>
                    </DialogFooter>
                </form>
            </div>
        </Dialog>
    );
}
