

export type FieldDefinition = {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "multiselect";
  options?: string[];
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
        <div key={field.name}>
          <label>{field.label}</label>

          {field.type === "text" && (
            <input
              type="text"
              value={values?.[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "date" && (
            <input
              type="date"
              value={values?.[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}

          {field.type === "select" && (
            <select
              value={values?.[field.name] || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              <option value="">-- alle --</option>
              {field.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}

          {field.type === "multiselect" && (
            <select
              multiple
              value={values?.[field.name] || []}
              onChange={(e) =>
                onChange(
                  field.name,
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {field.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      {onSubmit && <button type="submit">Filter anwenden</button>}
    </form>
  );
}



