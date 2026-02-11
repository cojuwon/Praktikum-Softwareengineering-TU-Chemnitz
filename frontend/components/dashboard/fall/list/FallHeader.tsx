import Link from 'next/link';
import Image from 'next/image';

export default function FallHeader() {
  return (
    <div>
      <Image
        src="/bellis-favicon.png"
        alt="Bellis Logo"
        width={100}
        height={100}
        className="w-[60px] h-auto object-contain block mx-auto mb-5"
      />

      <div className="bg-white rounded-t-xl overflow-visible shadow-sm">
        <div className="px-10 py-8 border-b border-gray-200 flex justify-between items-center flex-wrap gap-5">
          <div>
            <h1 className="text-2xl font-semibold text-[#42446F] m-0">
              Fälle
            </h1>
            <p className="text-sm text-gray-500 m-1.5">
              Verwalten Sie alle Fälle und Beratungen
            </p>
          </div>

          <Link
            href="/dashboard/fall/create"
            className="bg-[#42446F] text-white border-none rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer no-underline inline-block hover:bg-[#36384d] transition-colors"
          >
            + Fall erstellen
          </Link>
        </div>
      </div>
    </div>
  );
}
