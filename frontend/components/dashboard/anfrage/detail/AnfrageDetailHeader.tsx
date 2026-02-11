import Link from 'next/link';
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';

interface AnfrageDetailHeaderProps {
  anfrageId: number;
  isEditing: boolean;
  onEdit: () => void;
}

export default function AnfrageDetailHeader({
  anfrageId,
  isEditing,
  onEdit,
}: AnfrageDetailHeaderProps) {
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
            <Link
              href="/dashboard/anfrage"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-[#42446F] m-0">
                Anfrage #{anfrageId}
              </h1>
              <p className="text-sm text-gray-500 m-1 mt-0">
                {isEditing ? "Daten bearbeiten" : "Details der Anfrage anzeigen"}
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={onEdit}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400 shadow-sm flex items-center gap-2"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Bearbeiten
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
