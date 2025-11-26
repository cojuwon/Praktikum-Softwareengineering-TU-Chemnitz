/*import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

export default function Page() {
  return (
  <main className="flex min-h-screen flex-col p-6">
    <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
    <Link
    href="dashboard/fall/create"
    className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
      <span> Neuen Fall erstellen</span> 
    </Link>
    </div>
    <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
    <Link
    href="dashboard/fall/edit"
    className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
      <span> Fall bearbeiten </span> 
    </Link>
    </div>
  </main>
)}*/

import FallTable from '@/components/fall/fallTable';
import { CreateFallButton } from "@/components/fall/createFallButton";

export default function FallPage() {
  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Fälle</h1>
        <CreateFallButton />
      </div>

      <FallTable query="" currentPage={1} />
    </div>
  );
}