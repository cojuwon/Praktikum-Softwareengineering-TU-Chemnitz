import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

export default function Page() {
  return (
  <main className="flex min-h-screen flex-col p-6">
    <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
    <Link
    href="dashboard/anfrage/create"
    className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
      <span> Neue Anfrage erstellen</span> 
    </Link>
    </div>
  </main>
)}