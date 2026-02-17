'use client';

import { useUser } from '@/lib/userContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserList from '@/components/dashboard/admin/UserList';
import { Users, Shield, Activity } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, admins: 0, active: 0 });

  useEffect(() => {
    if (!loading && user?.rolle_mb !== 'AD') {
      router.push('/dashboard');
    }
    // Fetch simple stats
    apiFetch('/api/konten/stats/').then(res => res.json()).then(data => {
      setStats(data);
    }).catch(console.error);
  }, [user, loading, router]);

  if (loading || !user || user.rolle_mb !== 'AD') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="mt-1 text-sm text-gray-500">Verwalten Sie Benutzer, Rollen und Systemeinstellungen.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Benutzer Gesamt</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Administratoren</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Aktive Konten</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Benutzerverwaltung</h2>
          {/* Quick Actions or Filters could go here */}
        </div>

        {/* User List Component with stripped padding to fit container */}
        <div className=""> {/* Wrapper to control padding if needed */}
          <UserList embedded={true} />
        </div>
      </div>
    </div>
  );
}