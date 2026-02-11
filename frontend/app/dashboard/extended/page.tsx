import ExtendedHeader from '@/components/dashboard/extended/ExtendedHeader';
import ExtendedNavigation from '@/components/dashboard/extended/ExtendedNavigation';

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto w-full pt-6">
      <ExtendedHeader />
      <ExtendedNavigation />
    </div>
  );
}