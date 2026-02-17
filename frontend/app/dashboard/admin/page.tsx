'use client';

import { useUser } from '@/lib/userContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserList from '@/components/dashboard/admin/UserList';
import { Users, Shield, Activity, UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import GroupList from '@/components/dashboard/admin/GroupList';
import RequestsList from '@/components/dashboard/admin/RequestsList';

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, admins: 0, active: 0 });
  const [pendingCount, setPendingCount] = useState(0); // Track pending requests
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'requests'>('users');

  useEffect(() => {
    if (!loading && user?.rolle_mb !== 'AD') {
      router.push('/dashboard');
    }
    // Fetch simple stats
    apiFetch('/api/konten/stats/').then(res => res.json()).then(data => {
      setStats(data);
    }).catch(console.error);

    // Check for pending requests count
    apiFetch('/api/konten/?is_active=false').then(res => res.json()).then(data => {
      const count = Array.isArray(data) ? data.length : data.count || 0;
      setPendingCount(count);
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
        <div className="px-6 py-4 border-b border-gray-100 flex gap-6 bg-gray-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={18} />
            Benutzerverwaltung
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'groups' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Shield size={18} />
            Gruppen & Rechte
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <div className="relative">
              <UserPlus size={18} />
              {pendingCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{pendingCount}</span>}
            </div>
            Registrierungsanfragen
          </button>
        </div>

        {/* Content */}
        <div className="">
          {activeTab === 'users' && <UserList embedded={true} />}
          {activeTab === 'groups' && <GroupList />}
          {activeTab === 'requests' && (
            <div className="p-6">
              <RequestsList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}