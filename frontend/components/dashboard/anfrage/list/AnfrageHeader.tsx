import Link from 'next/link';

export default function AnfrageHeader() {
  return (
    <div className="px-10 py-8 border-b border-gray-200 flex justify-between items-center flex-wrap gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#42446F] m-0">
          Anfragen
        </h1>
        <p className="text-sm text-gray-500 m-1.5">
          Verwalten Sie alle eingehenden Anfragen
        </p>
      </div>

      <Link
        href="/dashboard/anfrage/create"
        className="bg-[#42446F] text-white border-none rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer no-underline inline-block hover:bg-[#36384d] transition-colors"
      >
        + Anfrage erstellen
      </Link>
    </div>
  );
}
