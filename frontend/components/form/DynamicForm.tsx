// -----------------------------
// Types
// -----------------------------
export type FieldDefinition = {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "multiselect";
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
  switch (field.type) {
    case "text":
      return (
        <input
          id={field.name}
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "date":
      return (
        <input
          id={field.name}
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "select":
      return (
        <select
          id={field.name}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
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
    >
      {definition.map((field) => (
        <div key={field.name} style={{ marginBottom: "1rem" }}>
          <label htmlFor={field.name} style={{ display: "block", fontWeight: 500 }}>
            {field.label}
            {field.required && <span style={{ color: "red" }}> *</span>}
          </label>

          <FieldRenderer
            field={field}
            value={values[field.name]}
            onChange={(value) => onChange(field.name, value)}
          />
        </div>
      ))}

      {onSubmit && <button type="submit">Formular abschicken</button>}
    </form>
  );
}
