import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { FieldDefinition } from "@/components/form/DynamicForm";

type FilterState = {
    search: string;
    datumVon: string;
    datumBis: string;
    art: string[];
    ort: string[];
    person: string[];
};

type Props = {
    definition: FieldDefinition[]; // To get options
    onSearch: (filters: FilterState) => void;
};

export function AnfrageFilter({ definition, onSearch }: Props) {
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        datumVon: "",
        datumBis: "",
        art: [],
        ort: [],
        person: [],
    });

    // Extract options from definition
    const artOptions = resolveOptions(definition.find((f) => f.name === "anfrage_art")?.options);
    const ortOptions = resolveOptions(definition.find((f) => f.name === "anfrage_ort")?.options);
    const personOptions = resolveOptions(definition.find((f) => f.name === "anfrage_person")?.options);

    function resolveOptions(options?: (string | { value: string; label: string })[]) {
        if (!options) return [];
        return options.map(o => typeof o === 'string' ? { label: o, value: o } : o);
    }

    const update = (key: keyof FilterState, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        onSearch(filters);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Top Row: Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Suchen nach..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filters.search}
                    onChange={(e) => update("search", e.target.value)}
                />
            </div>

            {/* Middle Row: Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MultiSelect
                    label="Anfrage Art"
                    options={artOptions}
                    selected={filters.art}
                    onChange={(val) => update("art", val)}
                />
                <MultiSelect
                    label="Anfrage Ort"
                    options={ortOptions}
                    selected={filters.ort}
                    onChange={(val) => update("ort", val)}
                />
                <MultiSelect
                    label="Person"
                    options={personOptions}
                    selected={filters.person}
                    onChange={(val) => update("person", val)}
                />
            </div>

            {/* Bottom Row: Date Range & Action */}
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex gap-2 items-center">
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Von</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={filters.datumVon}
                            onChange={(e) => update("datumVon", e.target.value)}
                        />
                    </div>
                    <span className="text-gray-400 pb-2">–</span>
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Bis</label>
                        <input
                            type="date"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={filters.datumBis}
                            onChange={(e) => update("datumBis", e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-grow"></div>

                <button
                    type="button"
                    onClick={() => setFilters({
                        search: "",
                        datumVon: "",
                        datumBis: "",
                        art: [],
                        ort: [],
                        person: [],
                    })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                    Zurücksetzen
                </button>

                <button
                    type="submit"
                    style={{ backgroundColor: "#42446F" }}
                    className="px-6 py-2 text-white rounded-md text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Filter anwenden
                </button>
            </div>
        </form>
    );
}
