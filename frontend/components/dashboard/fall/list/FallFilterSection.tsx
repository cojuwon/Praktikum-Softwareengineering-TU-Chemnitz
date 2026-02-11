import { FieldDefinition } from "@/components/form/DynamicForm";
import { FallFilter } from "@/components/form/FallFilter";

interface FallFilterSectionProps {
  formDefinition: FieldDefinition[] | null;
  onSearch: (filters: any) => void;
}

export default function FallFilterSection({
  formDefinition,
  onSearch,
}: FallFilterSectionProps) {
  return (
    <div className="px-10 py-5 border-b border-gray-200">
      {formDefinition ? (
        <FallFilter definition={formDefinition} onSearch={onSearch} />
      ) : (
        <p className="text-sm text-gray-500">Lade Filter...</p>
      )}
    </div>
  );
}
