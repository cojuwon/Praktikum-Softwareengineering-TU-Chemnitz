// -----------------------------
// Types
// -----------------------------
export type FieldDefinition = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "multiselect";
  required?: boolean;
  options?: (string | { value: string; label: string })[];
};

type Props = {
  definition: FieldDefinition[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit?: () => void;
};

// -----------------------------
// Field Renderer Component
// -----------------------------
function FieldRenderer({ field, value, onChange }: {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
}) {
  const inputBaseClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

  switch (field.type) {
    case "text":
      return (
        <input
          id={field.name}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputBaseClass}
        />
      );

    case "textarea":
      return (
        <textarea
          id={field.name}
          rows={4}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputBaseClass}
        />
      );

    case "date":
      return (
        <input
          id={field.name}
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputBaseClass}
        />
      );

    case "select":
      return (
        <select
          id={field.name}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputBaseClass}
        >
          <option value="">-- bitte wählen --</option>
          {field.options?.map((o) => {
            const val = typeof o === 'string' ? o : o.value;
            const lab = typeof o === 'string' ? o : o.label;
            return (
              <option key={val} value={val}>
                {lab}
              </option>
            );
          })}
        </select>
      );

    case "multiselect":
      return (
        <select
          id={field.name}
          multiple
          value={value ?? []}
          onChange={(e) =>
            onChange(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
          className={`${inputBaseClass} min-h-[100px]`}
        >
          {field.options?.map((o) => {
            const val = typeof o === 'string' ? o : o.value;
            const lab = typeof o === 'string' ? o : o.label;
            return (
              <option key={val} value={val}>
                {lab}
              </option>
            );
          })}
        </select>
      );

    default:
      return null;
  }
}

// -----------------------------
// Main Form Component
// -----------------------------
export function DynamicForm({ definition, values, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="space-y-5"
    >
      {definition.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          <FieldRenderer
            field={field}
            value={values[field.name]}
            onChange={(value) => onChange(field.name, value)}
          />
        </div>
      ))}

      {onSubmit && (
        <div className="pt-4">
          {/* 
               Button is rendered by parent usually if they want custom placement, 
               but if `onSubmit` is passed here we render a default one. 
               However, usually the parent handles the submit button.
               I'll keep it but style it nicely just in case.
            */}
          <button
            type="submit"
            style={{ backgroundColor: "#42446F" }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Speichern
          </button>
        </div>
      )}
    </form>
  );
}
