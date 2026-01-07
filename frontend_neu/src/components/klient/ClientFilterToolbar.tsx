'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    ListFilter,
    Settings2,
    X,
    Search
} from 'lucide-react';
import {
    KLIENT_ROLLE_CHOICES,
    KLIENT_GESCHLECHT_CHOICES,
    KLIENT_WOHNORT_CHOICES
} from '@/components/klient/KlientFormDialog';

// Reusable Filter Props
export interface ClientFilters {
    search?: string;
    klient_rolle?: string;
    klient_geschlechtsidentitaet?: string;
    klient_alter_gte?: number;
    klient_alter_lte?: number;
    klient_beruf?: string;
    klient_staatsangehoerigkeit?: string;
    klient_wohnort?: string;
}

export interface ClientColumnVisibility {
    role: boolean;
    age: boolean;
    gender: boolean;
    job: boolean;
    nationality: boolean;
    residence: boolean;
    created: boolean;
}

interface ClientFilterToolbarProps {
    onFilterChange: (filters: ClientFilters) => void;
    onVisibilityChange: (visibility: ClientColumnVisibility) => void;
    initialVisibility: ClientColumnVisibility;
}

export function ClientFilterToolbar({
    onFilterChange,
    onVisibilityChange,
    initialVisibility
}: ClientFilterToolbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<ClientFilters>({});
    const [visibility, setVisibility] = useState<ClientColumnVisibility>(initialVisibility);

    // Helper to handle filter changes
    const handleFilterChange = (key: keyof ClientFilters, value: any) => {
        const newFilters = { ...filters, [key]: value };
        // remove empty strings or undefined
        if (!value) delete newFilters[key];

        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Helper to handle visibility changes
    const handleVisibilityChange = (key: keyof ClientColumnVisibility) => {
        const newViz = { ...visibility, [key]: !visibility[key] };
        setVisibility(newViz);
        onVisibilityChange(newViz);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg mb-4 shadow-sm">
            {/* Search Bar & Toggle */}
            <div className="flex items-center gap-2 p-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Suchen (Name, ID, Code)..."
                        className="w-full pl-9 pr-4 py-2 text-sm border-none bg-gray-50 rounded-md focus:ring-2 focus:ring-blue-100 outline-none"
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-gray-600"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ListFilter className="w-4 h-4" /> Filter & Ansicht
                </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {isOpen && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                            <ListFilter className="w-4 h-4 text-blue-600" /> Filterkriterien
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Role */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Rolle</label>
                            <select
                                className="w-full text-sm p-2 border rounded-md"
                                onChange={e => handleFilterChange('klient_rolle', e.target.value)}
                                value={filters.klient_rolle || ''}
                            >
                                <option value="">Alle Rollen</option>
                                {KLIENT_ROLLE_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Geschlecht</label>
                            <select
                                className="w-full text-sm p-2 border rounded-md"
                                onChange={e => handleFilterChange('klient_geschlechtsidentitaet', e.target.value)}
                                value={filters.klient_geschlechtsidentitaet || ''}
                            >
                                <option value="">Alle</option>
                                {KLIENT_GESCHLECHT_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>

                        {/* Residence */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Wohnort</label>
                            <select
                                className="w-full text-sm p-2 border rounded-md"
                                onChange={e => handleFilterChange('klient_wohnort', e.target.value)}
                                value={filters.klient_wohnort || ''}
                            >
                                <option value="">Alle Wohnorte</option>
                                {KLIENT_WOHNORT_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>

                        {/* Age Range */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Alter (von - bis)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="min"
                                    className="w-full text-sm p-2 border rounded-md"
                                    onChange={e => handleFilterChange('klient_alter_gte', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="max"
                                    className="w-full text-sm p-2 border rounded-md"
                                    onChange={e => handleFilterChange('klient_alter_lte', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Profession */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Beruf</label>
                            <input
                                type="text"
                                placeholder="z.B. Student"
                                className="w-full text-sm p-2 border rounded-md"
                                onChange={e => handleFilterChange('klient_beruf', e.target.value)}
                            />
                        </div>

                        {/* Nationality */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Nationalität</label>
                            <input
                                type="text"
                                placeholder="z.B. Deutsch"
                                className="w-full text-sm p-2 border rounded-md"
                                onChange={e => handleFilterChange('klient_staatsangehoerigkeit', e.target.value)}
                            />
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Column Visibility */}
                    <div>
                        <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2 mb-3">
                            <Settings2 className="w-4 h-4 text-blue-600" /> Ansicht: Spalten ausblenden/anzeigen
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries({
                                role: 'Rolle',
                                age: 'Alter',
                                gender: 'Geschlecht',
                                job: 'Beruf',
                                nationality: 'Nationalität',
                                residence: 'Wohnort',
                                created: 'Erstellt am'
                            }).map(([key, label]) => (
                                <label key={key} className={`
                           px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors select-none
                           ${visibility[key as keyof ClientColumnVisibility]
                                        ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                       `}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={visibility[key as keyof ClientColumnVisibility]}
                                        onChange={() => handleVisibilityChange(key as keyof ClientColumnVisibility)}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
