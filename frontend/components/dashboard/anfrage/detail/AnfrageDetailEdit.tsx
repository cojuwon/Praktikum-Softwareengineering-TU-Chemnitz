import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";

interface AnfrageDetailEditProps {
  definition: FieldDefinition[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AnfrageDetailEdit({
  definition,
  values,
  onChange,
  onSubmit,
  onCancel,
}: AnfrageDetailEditProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <DynamicForm
        definition={definition}
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
      />

      <button
        onClick={onCancel}
        className="w-full mt-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Abbrechen
      </button>
    </div>
  );
}
