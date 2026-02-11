

export type FieldDefinition = {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "multiselect";
  options?: ({ value: string; label: string } | string)[];
};

type Props = {
  definition: FieldDefinition[];
  values?: { [key: string]: any };
  onChange: (name: string, value: any) => void;
  onSubmit?: () => void;
};

export function DynamicFilterForm({ definition, values, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {definition.map((field) => (
        <div key={field.name} style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>{field.label}</label>

          {field.type === "text" && (
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={values?.[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "date" && (
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={values?.[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "select" && (
            <select
              className="border p-2 rounded w-full"
              value={values?.[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              <option value="">-- alle --</option>
              {field.options?.map((o) => {
                const val = typeof o === "string" ? o : o.value;
                const lab = typeof o === "string" ? o : o.label;
                return (
                  <option key={val} value={val}>
                    {lab}
                  </option>
                );
              })}
            </select>
          )}

          {field.type === "multiselect" && (
            <select
              multiple
              className="border p-2 rounded w-full"
              value={values?.[field.name] || []}
              onChange={(e) =>
                onChange(
                  field.name,
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {field.options?.map((o) => {
                const val = typeof o === "string" ? o : o.value;
                const lab = typeof o === "string" ? o : o.label;
                return (
                  <option key={val} value={val}>
                    {lab}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      ))}

      {onSubmit && (
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
        >
          Filter anwenden
        </button>
      )}
    </form>
  );
}



