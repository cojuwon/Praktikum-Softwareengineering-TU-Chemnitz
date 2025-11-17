// lädt Daten und zeigt sie als Tabelle an

//TO-DO:
// - Update Anfrage & Delete Anfrage Button erstellen
// - fetch Anfragen erstellen

import { fetchAnfrage } from '@/lib/api';
//import { UpdateAnfrage, DeleteAnfrage } from '@/app/ui/anfragen/buttons';
import { formatDateToLocal } from '@/lib/utils';
import { lusitana } from '@/components/ui/fonts';

export default async function AnfragenTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const anfragen = await fetchAnfrage(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          
          <table className="min-w-full text-gray-900">
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
              {anfragen?.map((a) => (
                <tr
                  key={a.id}
                  className="border-b py-3 text-sm last:border-none"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {formatDateToLocal(a.anfrage_datum)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{a.anfrage_weg}</td>
                  <td className="whitespace-nowrap px-3 py-3">{a.anfrage_ort}</td>
                  <td className="whitespace-nowrap px-3 py-3">{a.anfrage_person}</td>
                  <td className="whitespace-nowrap px-3 py-3">{a.anfrage_art}</td>
                  <td className="whitespace-nowrap px-3 py-3">{a.user_id}</td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      {/* <UpdateAnfrage id={a.id} /> */}
                      {/* <DeleteAnfrage id={a.id} /> */}
                    </div>
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



