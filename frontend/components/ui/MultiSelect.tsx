import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type Option = {
    label: string;
    value: string;
};

type MultiSelectProps = {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
};

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((v) => v !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
                <span className="block truncate">
                    {selected.length === 0
                        ? label
                        : `${label} (${selected.length})`}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full min-w-[200px] bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => toggleOption(option.value)}
                        >
                            <input
                                type="checkbox"
                                checked={selected.includes(option.value)}
                                readOnly
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3 pointer-events-none"
                            />
                            <span className={`block truncate ${selected.includes(option.value) ? 'font-medium' : 'font-normal'}`}>
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
