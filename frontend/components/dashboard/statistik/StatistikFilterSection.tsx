import Link from 'next/link';
import { DynamicFilterForm, FieldDefinition } from "@/components/dashboard/statistik/DynamicFilterForm";
import PresetSelector from "@/components/dashboard/statistik/PresetSelector";

interface StatistikFilterSectionProps {
  presets: any[];
  filterDefinition: FieldDefinition[] | null;
  filters: { [key: string]: any };
  onSelectPreset: (presetId: string) => void;
  onFilterChange: (name: string, value: any) => void;
  onSubmit: () => void;
}

export default function StatistikFilterSection({
  presets,
  filterDefinition,
  filters,
  onSelectPreset,
  onFilterChange,
  onSubmit,
}: StatistikFilterSectionProps) {
  return (
    <section className="bg-white px-10 pb-8 mx-5 rounded-b-xl">
      <PresetSelector
        presets={presets}
        onSelect={onSelectPreset}
      />

      <Link
        href="/dashboard/statistik/presets"
        className="w-full max-w-sm bg-transparent text-black border-4 border-[#A0A8CD] rounded-lg px-4 py-2.5 text-base font-medium cursor-pointer text-center block mx-auto my-4 no-underline hover:bg-gray-50 transition-colors"
      >
        Presets verwalten
      </Link>

      <h2 className="text-xl font-semibold text-[#42446F] mt-8 mb-4">
        Filter setzen:
      </h2>

      {!filterDefinition && <p className="text-center">Filter werden geladen…</p>}

      {filterDefinition && (
        <DynamicFilterForm
          definition={filterDefinition}
          values={filters}
          onChange={onFilterChange}
          onSubmit={onSubmit}
        />
      )}
    </section>
  );
}