'use client';

import { useState, useEffect } from 'react';
import {
  FolderOpen,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin
} from "lucide-react";
import { usePermissions } from '@/hooks/usePermissions';
import { Permissions } from '@/types/auth';
import { apiClient } from '@/lib/api-client';
import { Beratungstermin } from '@/types/beratungstermin';
import { AnfrageFormDialog } from '@/components/anfrage';

export default function DashboardPage() {
  const { can } = usePermissions();
  const [isAnfrageDialogOpen, setIsAnfrageDialogOpen] = useState(false);
  const [termins, setTermins] = useState<Beratungstermin[]>([]);
  const [isLoadingTermine, setIsLoadingTermine] = useState(true);

  // Permission Checks
  const canAddAnfrage = can(Permissions.ADD_ANFRAGE);

  // Fetch Termine
  useEffect(() => {
    const fetchTermine = async () => {
      try {
        const response = await apiClient.get<Beratungstermin[]>('/beratungstermine/');
        let data = Array.isArray(response.data) ? response.data : (response.data as any).results || [];

        // Filter: Ab heute
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingTermine = data.filter((t: Beratungstermin) => {
          const tDate = new Date(t.termin_datum);
          return tDate >= today;
        });

        // Sort: Nächste zuerst
        upcomingTermine.sort((a: Beratungstermin, b: Beratungstermin) => {
          const dateA = new Date(`${a.termin_datum}T${a.termin_uhrzeit || '00:00'}`);
          const dateB = new Date(`${b.termin_datum}T${b.termin_uhrzeit || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
        });

        // Limit: 5 items
        setTermins(upcomingTermine.slice(0, 5));
      } catch (error) {
        console.error('Fehler beim Laden der Termine:', error);
      } finally {
        setIsLoadingTermine(false);
      }
    };

    fetchTermine();
  }, []);

  return (
    <div className="page-container">
      {/* Anfrage Dialog */}
      <AnfrageFormDialog
        isOpen={isAnfrageDialogOpen}
        onClose={() => setIsAnfrageDialogOpen(false)}
        onSuccess={() => {
          console.log('Anfrage erfolgreich erstellt');
        }}
      />

      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Willkommen zurück! Hier ist Ihre Übersicht.</p>
        </div>
      </header>

      {/* Statistik Karten */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">24</span>
            <span className="stat-label">Aktive Fälle</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <Clock className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">8</span>
            <span className="stat-label">Offene Anfragen</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">156</span>
            <span className="stat-label">Abgeschlossen</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <Users className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <span className="stat-value">89</span>
            <span className="stat-label">Klient:innen</span>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Meine nächsten Termine Widget */}
        <section className="card col-span-1 lg:col-span-2">
          <div className="card-header flex justify-between items-center">
            <h2 className="card-title">Meine nächsten Termine</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Alle anzeigen
            </button>
          </div>
          <div className="card-content">
            {isLoadingTermine ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : termins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>Keine anstehenden Termine</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {termins.map((t) => (
                  <li key={t.termin_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {new Date(t.termin_datum).toLocaleDateString('de-DE', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {new Date(t.termin_datum).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {t.klient_display || `Termin #${t.termin_id}`}
                          </span>
                          {t.fall && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              Fall
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {t.termin_uhrzeit ? t.termin_uhrzeit.substring(0, 5) : '??:??'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {t.beratungsstelle}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a
                      href={t.fall ? `/dashboard/fall/${t.fall}` : '#'}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      Details
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Letzte Aktivitäten */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Letzte Aktivitäten</h2>
          </div>
          <div className="card-content">
            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-dot activity-dot-primary"></div>
                <div className="activity-content">
                  <p className="activity-text">Neuer Fall #2024-089 erstellt</p>
                  <span className="activity-time">vor 2 Stunden</span>
                </div>
              </li>
              <li className="activity-item">
                <div className="activity-dot activity-dot-success"></div>
                <div className="activity-content">
                  <p className="activity-text">Fall #2024-076 abgeschlossen</p>
                  <span className="activity-time">vor 5 Stunden</span>
                </div>
              </li>
              <li className="activity-item">
                <div className="activity-dot activity-dot-warning"></div>
                <div className="activity-content">
                  <p className="activity-text">Neue Anfrage eingegangen</p>
                  <span className="activity-time">Gestern</span>
                </div>
              </li>
              <li className="activity-item">
                <div className="activity-dot activity-dot-info"></div>
                <div className="activity-content">
                  <p className="activity-text">Beratungstermin hinzugefügt</p>
                  <span className="activity-time">Gestern</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Schnellzugriff */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Schnellzugriff</h2>
          </div>
          <div className="card-content">
            <div className="quick-actions">
              <button className="quick-action-btn">
                <FolderOpen className="w-5 h-5" />
                <span>Neuer Fall</span>
              </button>
              {canAddAnfrage && (
                <button
                  className="quick-action-btn"
                  onClick={() => setIsAnfrageDialogOpen(true)}
                >
                  <FileText className="w-5 h-5" />
                  <span>Neue Anfrage</span>
                </button>
              )}
              <button className="quick-action-btn">
                <Users className="w-5 h-5" />
                <span>Klient:in anlegen</span>
              </button>
              <button className="quick-action-btn">
                <TrendingUp className="w-5 h-5" />
                <span>Statistik</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
