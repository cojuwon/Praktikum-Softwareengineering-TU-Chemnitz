import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";

interface AnfrageCreateFormProps {
  loading: boolean;
  formDefinition: FieldDefinition[] | null;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: () => void;
}

export default function AnfrageCreateForm({
  loading,
  formDefinition,
  values,
  onChange,
  onSubmit,
}: AnfrageCreateFormProps) {
  return (
    <div className="px-10 py-10 bg-white">
      {loading && (
        <p className="text-center text-gray-500">Lade Formular...</p>
      )}

      {!loading && formDefinition && (
        <div className="max-w-2xl mx-auto">
          <DynamicForm
            definition={formDefinition}
            values={values}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </div>
      )}

      {!loading && formDefinition?.length === 0 && (
        <p className="text-center text-gray-500">Keine Felder definiert.</p>
      )}
    </div>
  );
}
