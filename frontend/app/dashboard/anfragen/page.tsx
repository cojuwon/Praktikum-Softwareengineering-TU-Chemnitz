import Pagination from '@/components/ui/pagination';
import Search from '@/components/ui/search';
import Table from '@/components/anfragen/table';
import { CreateAnfrage } from '@/components/anfragen/buttons';
import { lusitana } from '@/components/ui/fonts';
import { AnfragenTableSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';
import { fetchAnfragenPages } from '@/lib/api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anfragen',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchAnfragenPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Anfragen</h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Suche Anfragen..." />
        <CreateAnfrage />
      </div>

      <Suspense key={query + currentPage} fallback={<AnfragenTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}