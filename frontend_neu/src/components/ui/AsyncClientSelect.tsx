'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, Search, User } from 'lucide-react';
import { Command } from 'cmdk';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';

interface Client {
    klient_id: number;
    klient_rolle: string;
    klient_alter?: number;
}

interface AsyncClientSelectProps {
    value?: number;
    onChange: (value: number | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function AsyncClientSelect({
    value,
    onChange,
    placeholder = "Klient auswählen...",
    className,
}: AsyncClientSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [options, setOptions] = React.useState<Client[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedLabel, setSelectedLabel] = React.useState<string>('');

    // Initial load or load selected client label
    React.useEffect(() => {
        if (value) {
            // Fetch specific client to show label if not in options
            apiClient.get(`/klientinnen/${value}/`).then((res) => {
                // Adjust based on your API response structure
                const data = res.data;
                setSelectedLabel(`Klient #${data.klient_id} (${data.klient_rolle})`);
            }).catch(console.error);
        } else {
            setSelectedLabel('');
        }
    }, [value]);

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                loadOptions(query);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query, open]);

    const loadOptions = async (search: string) => {
        setLoading(true);
        try {
            const params = { search: search };
            const res = await apiClient.get('/klientinnen/', { params });
            // Support pagination result or direct array
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setOptions(data);
        } catch (err) {
            console.error(err);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className={cn("truncate", !value && "text-gray-500")}>
                    {value ? selectedLabel || `Klient #${value}` : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg py-1">
                    {/* Simple input instead of Command.Input to avoid excessive styling issues with raw cmdk */}
                    <div className="flex items-center px-3 pb-2 pt-1 border-b border-gray-100">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-gray-500"
                            placeholder="Suche..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {loading && (
                            <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Laden...
                            </div>
                        )}

                        {!loading && options.length === 0 && (
                            <div className="py-6 text-center text-sm text-gray-500">Keine Klienten gefunden.</div>
                        )}

                        {!loading && options.map((client) => (
                            <div
                                key={client.klient_id}
                                onClick={() => {
                                    onChange(client.klient_id);
                                    setOpen(false);
                                    setSelectedLabel(`Klient #${client.klient_id} (${client.klient_rolle})`);
                                }}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-blue-50 hover:text-blue-900 transition-colors",
                                    value === client.klient_id && "bg-blue-100 text-blue-900"
                                )}
                            >
                                <User className="mr-2 h-4 w-4 opacity-50" />
                                <span>Klient #{client.klient_id}</span>
                                <span className="ml-auto text-xs text-gray-400">
                                    {client.klient_rolle}
                                </span>
                                {value === client.klient_id && (
                                    <Check className="ml-auto h-4 w-4" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                // Use Overlay to close? For now simple click outside is not implemented, assume user clicks button again or selects. 
                // A backdrop or click-outside hook is definitely needed for production quality.
            )}
            {open && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)} />
            )}
        </div>
    );
}
