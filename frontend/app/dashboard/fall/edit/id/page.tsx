import FallForm from '@/components/fall/fallForm';
import { fetchFallById } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditFallPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  
  // Falls die ID ungültig ist
  if (isNaN(id) || id <= 0) {
    notFound();
  }

  let fall;
  try {
    fall = await fetchFallById(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/fall/edit"
          className="text-blue-600 hover:text-blue-500 mb-4 inline-block"
        >
          ← Zurück
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Fall bearbeiten (ID: {id})
        </h1>
      </div>
      <FallForm existingFall={fall} />
    </div>
  );
}