import AdminHeader from '@/components/dashboard/admin/AdminHeader';
import AdminNavigation from '@/components/dashboard/admin/AdminNavigation';

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto w-full pt-6">
      <AdminHeader />
      <AdminNavigation />
    </div>
  );
}