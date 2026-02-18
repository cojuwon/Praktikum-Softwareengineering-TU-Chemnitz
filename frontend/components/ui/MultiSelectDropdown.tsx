
import React, { useState, useRef, useEffect } from "react";

type Option = {
    value: string;
    label: string;
};

type Props = {
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    label?: string;
};

export default function MultiSelectDropdown({ options, selectedValues, onChange, label }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const handleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map((o) => o.value));
        }
    };

    const selectedLabels = options
        .filter((o) => selectedValues.includes(o.value))
        .map((o) => o.label);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="border p-2 rounded w-full cursor-pointer bg-white flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate pr-2 text-sm">
                    {selectedValues.length === 0
                        ? `-- ${label || "Bitte wählen"} --`
                        : selectedLabels.join(", ")}
                </span>
                <span className="text-gray-400 text-xs">▼</span>
            </div>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                    <div
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b text-sm font-semibold text-gray-600"
                        onClick={handleSelectAll}
                    >
                        {selectedValues.length === options.length ? "Alle abwählen" : "Alle auswählen"}
                    </div>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => toggleOption(option.value)}
                        >
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option.value)}
                                readOnly
                                className="mr-2 h-4 w-4"
                            />
                            <span className="text-sm">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
