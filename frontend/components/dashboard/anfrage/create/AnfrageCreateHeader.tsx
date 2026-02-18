import Link from 'next/link';
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';

export default function AnfrageCreateHeader() {
  return (
    <div>
      <Image
        src="/bellis-favicon.png"
        alt="Bellis Logo"
        width={100}
        height={100}
        className="w-[60px] h-auto object-contain block mx-auto mb-5"
      />

      <div className="bg-white rounded-t-xl overflow-hidden shadow-sm">
        <div className="px-10 py-8 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/anfrage" className="text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-[#42446F] m-0">
                Anfrage anlegen
              </h1>
              <p className="text-sm text-gray-500 mt-1 m-0">
                Erfassen Sie eine neue Anfrage im System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
