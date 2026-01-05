'use client';

import { useState } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { usePermissions } from '@/hooks/usePermissions';
import { Permissions } from '@/types/auth';
import { AnfrageFormDialog } from '@/components/anfrage';

export default function DashboardPage() {
  const { can } = usePermissions();
  const [isAnfrageDialogOpen, setIsAnfrageDialogOpen] = useState(false);

  // Permission Checks
  const canAddAnfrage = can(Permissions.ADD_ANFRAGE);

  return (
    <div className="page-container">
      {/* Anfrage Dialog */}
      <AnfrageFormDialog 
        isOpen={isAnfrageDialogOpen}
        onClose={() => setIsAnfrageDialogOpen(false)}
        onSuccess={() => {
          // Optional: Statistiken aktualisieren oder Benachrichtigung
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
