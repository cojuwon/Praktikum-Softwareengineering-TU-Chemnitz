import { FieldDefinition } from "@/components/form/DynamicForm";

interface AnfrageDetailViewProps {
  data: Record<string, any>;
  definition: FieldDefinition[];
  getDisplayValue: (fieldName: string, value: any) => string;
}

export default function AnfrageDetailView({
  data,
  definition,
  getDisplayValue,
}: AnfrageDetailViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      {definition.map((field) => (
        <div key={field.name} className="flex flex-col border-b border-gray-100 pb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {field.label}
          </span>
          <span className="text-gray-900 font-medium text-lg">
            {getDisplayValue(field.name, data[field.name]) || "—"}
          </span>
        </div>
      ))}

      {/* Additional Info not in form fields but in API */}
      <div className="flex flex-col border-b border-gray-100 pb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Bearbeitet von
        </span>
        <span className="text-gray-900 font-medium text-lg">
          {data.mitarbeiterin_display || "—"}
        </span>
      </div>
    </div>
  );
}
