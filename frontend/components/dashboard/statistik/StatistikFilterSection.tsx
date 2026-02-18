import Link from 'next/link';
import { DynamicFilterForm, FieldDefinition } from "@/components/dashboard/statistik/DynamicFilterForm";
import PresetSelector from "@/components/dashboard/statistik/PresetSelector";
import PresetMenu from "@/components/dashboard/statistik/PresetMenu";

interface StatistikFilterSectionProps {
  presets: any[];
  filterDefinition: FieldDefinition[] | null;
  filters: { [key: string]: any };
  visibleSections: { [key: string]: boolean };
  onSelectPreset: (presetId: string) => void;
  onFilterChange: (name: string, value: any) => void;
  onSectionChange: (section: string, isVisible: boolean) => void;
  onSubmit: () => void;
}

export default function StatistikFilterSection({
  presets,
  filterDefinition,
  filters,
  visibleSections,
  onSelectPreset,
  onFilterChange,
  onSectionChange,
  onSubmit,
}: StatistikFilterSectionProps) {

  const sections = [
    { id: "auslastung", label: "Auslastung" },
    { id: "wohnsitz", label: "Wohnsitz" },
    { id: "staatsangehoerigkeit", label: "Staatsangehörigkeit" },
    { id: "altersstruktur", label: "Altersstruktur" },
    { id: "behinderung", label: "Behinderung" },
    { id: "taeterOpferBeziehung", label: "Täter-Opfer-Beziehung" },
    { id: "gewaltart", label: "Art der Gewalt" },
    { id: "gewaltfolgen", label: "Folgen der Gewalt" },
    { id: "tatnachverfolgung", label: "Tatnachverfolgung" },
    { id: "netzwerk", label: "Netzwerk" },
    { id: "finanzierung", label: "Finanzierung" },
  ];

  return (
    <section className="bg-white px-10 pb-8 mx-5 rounded-b-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#42446F]">Daten filtern & auswählen</h2>
        <Link
          href="/dashboard/statistik/presets"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
        >
          Alle Presets verwalten
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spalte 1: Presets & Aktionen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gespeicherte Filter (Presets)</label>
          <PresetSelector
            presets={presets}
            onSelect={onSelectPreset}
          />
          <div className="mt-3">
            <PresetMenu
              onPresetsChanged={() => window.location.reload()} // Simple reload to refresh presets, better approach would be callback to parent
              currentFilters={filters}
              currentVisibleSections={visibleSections}
              presets={presets}
            />
          </div>
        </div>

        {/* Spalte 2: Filter */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3 border-b pb-1">Filterkriterien</h3>
          {!filterDefinition && <p className="text-gray-500 text-sm">Lade Filter...</p>}
          {filterDefinition && (
            <DynamicFilterForm
              definition={filterDefinition}
              values={filters}
              onChange={onFilterChange}
            />
          )}
        </div>

        {/* Spalte 3: Bereiche */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3 border-b pb-1">Anzuzeigende Bereiche</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            <div className="flex items-center">
              <input
                id="toggle-all"
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={Object.values(visibleSections).every(Boolean)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  sections.forEach(s => onSectionChange(s.id, checked));
                }}
              />
              <label htmlFor="toggle-all" className="ml-2 text-sm text-gray-900 font-semibold">
                Alle auswählen
              </label>
            </div>
            <hr className="my-2" />
            {sections.map(section => (
              <div key={section.id} className="flex items-center">
                <input
                  id={`section-${section.id}`}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={visibleSections[section.id] !== false} // Default true
                  onChange={(e) => onSectionChange(section.id, e.target.checked)}
                />
                <label htmlFor={`section-${section.id}`} className="ml-2 text-sm text-gray-700">
                  {section.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t flex justify-end">
        <button
          onClick={onSubmit}
          className="bg-[#42446F] text-white px-6 py-2.5 rounded-lg hover:bg-[#2c2e4f] transition-colors font-medium shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Auswerten aktualisieren
        </button>
      </div>
    </section>
  );
}
