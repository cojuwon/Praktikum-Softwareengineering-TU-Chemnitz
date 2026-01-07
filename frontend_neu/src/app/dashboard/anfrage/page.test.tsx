import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import AnfragePage from './page';

// Mock für next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock für den API Client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock für usePermissions Hook
const mockCan = jest.fn();
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: mockCan,
    canAny: jest.fn(),
    isAdmin: jest.fn(() => false),
  }),
}));

// Mock für useAuth Hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      vorname_mb: 'Test',
      nachname_mb: 'User',
      mail_mb: 'test@example.com',
      rolle_mb: 'B',
      groups: ['Basis'],
      permissions: [],
    },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  }),
}));

import { apiClient } from '@/lib/api-client';

describe('AnfragePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Permission Check', () => {
    it('zeigt "Zugriff verweigert" wenn api.view_anfrage Permission fehlt', async () => {
      // Permission verweigern
      mockCan.mockImplementation((permission: string) => {
        return permission !== 'api.view_anfrage';
      });

      render(<AnfragePage />);

      // Warte auf das Rendering
      await waitFor(() => {
        expect(screen.getByText('Zugriff verweigert')).toBeInTheDocument();
      });

      // Prüfe ob die Fehlermeldung angezeigt wird
      expect(
        screen.getByText(/Sie haben nicht die erforderlichen Berechtigungen/)
      ).toBeInTheDocument();

      // API sollte nicht aufgerufen werden
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('Erfolgreiche Anzeige', () => {
    // Mock-Daten entsprechend dem Backend Anfrage Model
    const mockAnfragen = [
      {
        anfrage_id: 1,
        anfrage_datum: '2024-01-15',
        anfrage_art: 'B', // Beratungsbedarf
        anfrage_ort: 'LS', // Leipzig Stadt
        anfrage_person: 'B', // Betroffene:r
        anfrage_weg: 'Telefon',
        mitarbeiterin: 1,
        mitarbeiterin_display: 'Max Mustermann',
        fall: 42, // Hat einen Fall
        beratungstermin: null,
      },
      {
        anfrage_id: 2,
        anfrage_datum: '2024-02-20',
        anfrage_art: 'MS', // medizinische Soforthilfe
        anfrage_ort: 'NS', // Nordsachsen
        anfrage_person: 'F', // Fachkraft
        anfrage_weg: 'E-Mail',
        mitarbeiterin: 1,
        mitarbeiterin_display: 'Max Mustermann',
        fall: null,
        beratungstermin: null, // Offen
      },
    ];

    it('zeigt die Anfragen-Tabelle mit Daten wenn Permission vorhanden', async () => {
      // Permission erlauben
      mockCan.mockImplementation((permission: string) => {
        return permission === 'api.view_anfrage';
      });

      // API Mock Response
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: mockAnfragen,
      });

      render(<AnfragePage />);

      // Warte auf das Laden
      await waitFor(() => {
        expect(screen.queryByText('Anfragen werden geladen...')).not.toBeInTheDocument();
      });

      // Prüfe ob die API mit dem korrekten Endpoint aufgerufen wurde
      expect(apiClient.get).toHaveBeenCalledWith('/anfragen/');

      // Prüfe ob die Tabelle gerendert wird
      expect(screen.getByText('Anfragen')).toBeInTheDocument();

      // Prüfe ob die Daten angezeigt werden
      // Datum im deutschen Format (15.01.2024)
      expect(screen.getByText('15.01.2024')).toBeInTheDocument();
      expect(screen.getByText('20.02.2024')).toBeInTheDocument();

      // Art der Anfrage (Labels aus ANFRAGE_ART_CHOICES)
      expect(screen.getByText('Beratungsbedarf')).toBeInTheDocument();
      expect(screen.getByText('medizinische Soforthilfe')).toBeInTheDocument();

      // Ort (Labels aus STANDORT_CHOICES)
      expect(screen.getByText('Leipzig Stadt')).toBeInTheDocument();
      expect(screen.getByText('Nordsachsen')).toBeInTheDocument();

      // Status Badges
      expect(screen.getByText('Fall #42')).toBeInTheDocument();
      expect(screen.getByText('Offen')).toBeInTheDocument();

      // Bearbeiten Buttons
      const editButtons = screen.getAllByText('Bearbeiten');
      expect(editButtons).toHaveLength(2);
    });

    it('zeigt leere Tabelle wenn keine Anfragen vorhanden', async () => {
      mockCan.mockImplementation((permission: string) => {
        return permission === 'api.view_anfrage';
      });

      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: [],
      });

      render(<AnfragePage />);

      await waitFor(() => {
        expect(screen.queryByText('Anfragen werden geladen...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Keine Anfragen vorhanden')).toBeInTheDocument();
    });

    it('zeigt Fehlermeldung bei API-Fehler', async () => {
      mockCan.mockImplementation((permission: string) => {
        return permission === 'api.view_anfrage';
      });

      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      render(<AnfragePage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Die Anfragen konnten nicht geladen werden/)
        ).toBeInTheDocument();
      });
    });
  });
});
