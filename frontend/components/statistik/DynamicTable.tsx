"use client";

type Column = {
  field: string;
  label: string;
};

type Props = {
  columns: Column[];
  rows: Record<string, any>[];
};

export function DynamicTable({ columns, rows }: Props) {
  if (!columns?.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.field} className="px-4 py-2 text-sm text-gray-900">
                  {row[col.field] ?? "–"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
