import { fetchFall } from '@/lib/api';
import { updateFall, deleteFall } from "@/lib/api";
import { formatDateToLocal } from '@/lib/utils';
import { lusitana } from '@/components/ui/fonts';
import { EditFallButton } from './editFallButton';
import { DeleteFallButton } from './deleteFallButton'

export default async function FallTable({ query, currentPage }: {
  query: string;
  currentPage: number;
}) {
  const fall = await fetchFall(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">

          <table className="min-w-full text-gray-900">
            <thead className="text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Fall-ID</th>
                <th className="px-3 py-5 font-medium">Klient:in</th>
                <th className="px-3 py-5 font-medium">Beratung</th>
                <th className="px-3 py-5 font-medium">Tat</th>
                <th className="px-3 py-5 font-medium">Begleitung</th>
                <th className="px-3 py-5 font-medium">Zuständige Mitarbeiter:in</th>
                <th className="px-3 py-5 font-medium"></th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {fall?.map((f) => (
                <tr key={f.fall_id} className="border-b py-3 text-sm last:border-none">
                  <td className="whitespace-nowrap px-4 py-3">{f.fall_id}</td>
                  <td className="whitespace-nowrap px-3 py-3">{f.klient_id}</td>
                  <td className="whitespace-nowrap px-3 py-3">{f.beratungs_id}</td>
                  <td className="whitespace-nowrap px-3 py-3">{f.tat_id}</td>
                  <td className="whitespace-nowrap px-3 py-3">{f.begleitungs_id}</td>
                  <td className="whitespace-nowrap px-3 py-3">{f.user_id}</td>

                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <EditFallButton id={f.fall_id} />
                    <DeleteFallButton id={f.fall_id} />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
