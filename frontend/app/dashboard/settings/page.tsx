import { useState, useEffect } from 'react';
import { lusitana } from '@/components/ui/fonts';
import Link from 'next/link';
import { Shield, User, Bell, ChevronRight, Lock, Settings } from 'lucide-react';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';
import { apiFetch } from "@/lib/api";

function SystemSettingsCard() {
  const [retentionDays, setRetentionDays] = useState<number | string>(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = () => {
    setLoading(true);
    apiFetch("/api/system-settings/")
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Fehler beim Laden");
      })
      .then(data => {
        if (data && data.length > 0) {
          setRetentionDays(data[0].trash_retention_days);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSave = () => {
    setSaving(true);
    setMessage(null);
    apiFetch("/api/system-settings/update_settings/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trash_retention_days: Number(retentionDays) })
    })
      .then(res => {
        if (res.ok) {
          setMessage({ type: 'success', text: 'Einstellungen gespeichert' });
          return res.json();
        }
        throw new Error("Fehler beim Speichern");
      })
      .then(data => {
        setRetentionDays(data.trash_retention_days);
      })
      .catch(err => {
        setMessage({ type: 'error', text: 'Fehler beim Speichern' });
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-50 rounded-full text-purple-600">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Systemeinstellungen</h2>
            <p className="text-sm text-gray-500">Globale Konfigurationen</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aufbewahrungsfrist Papierkorb (Tage)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="30"
              />
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '...' : 'Speichern'}
              </button>
            </div>
            {message && (
              <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Objekte im Papierkorb werden nach dieser Zeit automatisch endgültig gelöscht.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto w-full px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`${lusitana.className} text-3xl font-bold text-gray-900`}>Einstellungen</h1>
        <p className="mt-2 text-sm text-gray-500">
          Verwalten Sie hier Ihre persönlichen Einstellungen und Sicherheitsoptionen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sicherheit & Login</h2>
                <p className="text-sm text-gray-500">Passwort und Zugriff</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Passwort ändern</span>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Ändern
                </button>
              </div>
            </div>
          </div>
        </div>

        <SystemSettingsCard />

        {/* Profile Card (Placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow opacity-75">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-100 rounded-full text-gray-500">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Mein Profil</h2>
                <p className="text-sm text-gray-500">Persönliche Daten (Demnächst)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500">Name, E-Mail und Avatar bearbeiten</span>
                <button disabled className="text-gray-400 cursor-not-allowed">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Card (Placeholder) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow opacity-75">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-100 rounded-full text-gray-500">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h2>
                <p className="text-sm text-gray-500">Email & Alerts (Demnächst)</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500">Benachrichtigungspräferenzen</span>
                <button disabled className="text-gray-400 cursor-not-allowed">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
