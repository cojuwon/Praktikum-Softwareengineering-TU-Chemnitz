
export function AnfragenTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Datum</th>
                <th className="px-3 py-5 font-medium">Weg</th>
                <th className="px-3 py-5 font-medium">Ort</th>
                <th className="px-3 py-5 font-medium">Person</th>
                <th className="px-3 py-5 font-medium">Art</th>
                <th className="px-3 py-5 font-medium">Mitarbeiter</th>
                <th className="relative py-3 pl-6 pr-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Einfaches Skeleton für eine Tabellenzeile
function TableRowSkeleton() {
  return (
    <tr className="border-b py-3 text-sm last:border-none animate-pulse">
      <td className="whitespace-nowrap py-3 pl-6 pr-3 bg-gray-200 h-4 rounded"></td>
      <td className="whitespace-nowrap px-3 py-3 bg-gray-200 h-4 rounded"></td>
      <td className="whitespace-nowrap px-3 py-3 bg-gray-200 h-4 rounded"></td>
      <td className="whitespace-nowrap px-3 py-3 bg-gray-200 h-4 rounded"></td>
      <td className="whitespace-nowrap px-3 py-3 bg-gray-200 h-4 rounded"></td>
      <td className="whitespace-nowrap px-3 py-3 bg-gray-200 h-4 rounded"></td>
      <td className="whitespace-nowrap py-3 pl-6 pr-3 bg-gray-200 h-4 rounded"></td>
    </tr>
  );
}

// dashboard/(overview)/loading.tsx
export default function OverviewLoading() {
  return (
    <main className="flex min-h-screen flex-col gap-6 p-6">
      {/* Willkommen-Karte */}
      <div className="h-20 rounded-lg bg-gray-200 md:h-36 animate-pulse" />

      {/* Statistikkarten */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-24 rounded-lg bg-gray-200 animate-pulse"></div>
        <div className="h-24 rounded-lg bg-gray-200 animate-pulse"></div>
        <div className="h-24 rounded-lg bg-gray-200 animate-pulse"></div>
      </div>

      {/* Tabelle / Übersicht */}
      <div className="flex flex-col gap-2 overflow-x-auto rounded-lg bg-gray-200 p-4 animate-pulse md:p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 w-full rounded bg-gray-300"></div>
        ))}
      </div>
    </main>
  );
}

