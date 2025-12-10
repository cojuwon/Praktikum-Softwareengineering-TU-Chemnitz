"use client";

import { useState } from "react";

interface PresetSelectorProps {
  presets: any[]; 
  onSelect: (value: string) => void;
}

export default function PresetSelector({ presets, onSelect }: PresetSelectorProps) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setValue(selected);
    onSelect(selected);
  };

  return (
    <select
      className="border p-2 rounded mb-4"
      value={value}
      onChange={handleChange}
    >
      <option value="">Preset auswählen…</option>

      <optgroup label="System-Presets">
        {presets.filter(p => p.preset_type === "system").map(p =>
          <option key={p.id} value={p.id}>{p.name}</option>
        )}
      </optgroup>

      <optgroup label="Eigene Presets">
        {presets.filter(p => p.preset_type === "user").map(p =>
          <option key={p.id} value={p.id}>{p.name}</option>
        )}
      </optgroup>

      <optgroup label="Geteilte Presets">
        {presets.filter(p => p.preset_type === "shared").map(p =>
          <option key={p.id} value={p.id}>{p.name}</option>
        )}
      </optgroup>
    </select>
  );
}
