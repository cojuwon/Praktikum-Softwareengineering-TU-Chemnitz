"use client";

interface Preset {
  id: number;
  name: string;
  preset_type: "system" | "user" | "shared";
  filters: Record<string, any>;
}

interface PresetSelectorProps {
  presets: Preset[];
  onSelect: (preset: Preset) => void;
}

export default function PresetSelector({ presets, onSelect }: PresetSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetId = e.target.value;
    const preset = presets.find(p => String(p.id) === presetId);
    if (preset) {
      onSelect(preset);
    }
  };

  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2">
        Preset auswählen:
      </label>
      <select
        className="border p-2 rounded w-full max-w-md"
        onChange={handleChange}
      >
        <option value="">Bitte wählen…</option>

        <optgroup label="System-Presets">
          {presets
            .filter(p => p.preset_type === "system")
            .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </optgroup>

        <optgroup label="Eigene Presets">
          {presets
            .filter(p => p.preset_type === "user")
            .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </optgroup>

        <optgroup label="Geteilte Presets">
          {presets
            .filter(p => p.preset_type === "shared")
            .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </optgroup>

      </select> 
    </div>
  );
}
