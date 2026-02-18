import { FieldDefinition } from "@/components/form/DynamicForm";
import { AnfrageFilter } from "@/components/form/AnfrageFilter";

interface AnfrageFilterSectionProps {
  formDefinition: FieldDefinition[] | null;
  onSearch: (filters: any) => void;
}

export default function AnfrageFilterSection({ formDefinition, onSearch }: AnfrageFilterSectionProps) {
  return (
    <div className="px-10 py-5 border-b border-gray-200">
      {formDefinition ? (
        <AnfrageFilter definition={formDefinition} onSearch={onSearch} />
      ) : (
        <p className="text-sm text-gray-500">Lade Filter...</p>
      )}
    </div>
  );
}
