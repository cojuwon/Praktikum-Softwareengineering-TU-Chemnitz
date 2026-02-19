import { DynamicFilterForm, FieldDefinition } from "@/components/dashboard/statistik/DynamicFilterForm";
import PresetManager from "@/components/dashboard/statistik/PresetManager";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/lib/userContext";
import Modal from "@/components/ui/Modal";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface StatistikFilterSectionProps {
  presets: any[];
  filterDefinition: FieldDefinition[] | null;
  filters: { [key: string]: any };
  visibleSections: { [key: string]: boolean };
  onSelectPreset: (presetId: string | number) => void;
  onFilterChange: (name: string, value: any) => void;
  onSectionChange: (section: string, isVisible: boolean) => void;
  onSubmit: () => void;
  onPresetsChanged: () => void;
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
  onPresetsChanged,
}: StatistikFilterSectionProps) {
  const { user } = useUser();
  const isAdmin = user?.permissions?.includes("can_manage_users") || user?.rolle_mb === 'AD';

  // Save Dialog State
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDesc, setPresetDesc] = useState("");
  const [isGlobal, setIsGlobal] = useState(false);

  // Feedback Modal
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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

  const handleSavePreset = async () => {
    try {
      const payload = {
        name: presetName,
        preset_beschreibung: presetDesc || presetName,
        filters: filters,
        preset_daten: { visible_sections: visibleSections },
        is_global: isGlobal
      };

      const res = await apiFetch("/api/presets/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowSaveDialog(false);
        setPresetName("");
        setPresetDesc("");
        setIsGlobal(false);
        onPresetsChanged();
        setFeedback({ type: 'success', message: "Preset erfolgreich gespeichert!" });
      } else {
        const err = await res.json();
        setFeedback({ type: 'error', message: "Fehler beim Speichern: " + (err.detail || JSON.stringify(err)) });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ type: 'error', message: "Ein unerwarteter Fehler ist aufgetreten." });
    }
  };

  return (
    <section className="bg-white px-10 pb-8 mx-5 rounded-b-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#42446F]">Daten filtern & auswählen</h2>
        <div className="flex items-center gap-4">
          <PresetManager
            presets={presets}
            onApplyPreset={onSelectPreset}
            onPresetsChanged={onPresetsChanged}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Spalte 1: Filter (Mehr Kontaktfläche) */}
        <div className="lg:col-span-9">
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

        {/* Spalte 2: Bereiche (Schmaler) */}
        <div className="lg:col-span-3">
          <h3 className="text-md font-medium text-gray-900 mb-3 border-b pb-1">Anzuzeigende Bereiche</h3>
          <div className="space-y-1.5 pr-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center pb-2 border-b border-gray-200 mb-2">
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
              <label htmlFor="toggle-all" className="ml-2 text-sm text-gray-900 font-semibold cursor-pointer select-none">
                Alle auswählen
              </label>
            </div>
            {sections.map(section => (
              <div key={section.id} className="flex items-center hover:bg-gray-200 p-1 rounded transition-colors">
                <input
                  id={`section-${section.id}`}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={visibleSections[section.id] !== false} // Default true
                  onChange={(e) => onSectionChange(section.id, e.target.checked)}
                />
                <label htmlFor={`section-${section.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer select-none flex-1">
                  {section.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex justify-end gap-3">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors border border-transparent"
        >
          Als Vorlage speichern
        </button>
        <button
          onClick={onSubmit}
          className="bg-[#42446F] text-white px-6 py-2.5 rounded-lg hover:bg-[#2c2e4f] transition-colors font-medium shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Auswerten
        </button>
      </div>

      {/* Save Modal */}
      {showSaveDialog && (
        <Modal
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          title="Vorlage speichern"
          footer={
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Abbrechen</button>
              <button onClick={handleSavePreset} disabled={!presetName} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Speichern</button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name der Vorlage</label>
              <input
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                placeholder="z.B. Jahresbericht 2024"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Beschreibung (Optional)</label>
              <textarea
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={presetDesc}
                onChange={e => setPresetDesc(e.target.value)}
                rows={3}
              />
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="globalCheck"
                  checked={isGlobal}
                  onChange={e => setIsGlobal(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="globalCheck" className="text-sm text-gray-700">Als globale Vorlage speichern (für alle sichtbar)</label>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Feedback Modal */}
      {feedback && (
        <Modal
          isOpen={!!feedback}
          onClose={() => setFeedback(null)}
          title={feedback.type === 'success' ? 'Erfolg' : 'Fehler'}
          footer={<button onClick={() => setFeedback(null)} className={`px-4 py-2 rounded text-white ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>OK</button>}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <div className="p-2 bg-green-100 text-green-600 rounded-full"><CheckIcon className="w-6 h-6" /></div>
            ) : (
              <div className="p-2 bg-red-100 text-red-600 rounded-full"><ExclamationTriangleIcon className="w-6 h-6" /></div>
            )}
            <p className="text-gray-800">{feedback.message}</p>
          </div>
        </Modal>
      )}
    </section>
  );
}
