'use client';

import axios, { AxiosError } from 'axios';

/**
 * API Client für die Kommunikation mit dem Django Backend.
 * 
 * Konfiguration:
 * - Basis-URL aus Umgebungsvariable oder Fallback auf localhost:8000
 * - withCredentials: true für automatisches Senden von Session-Cookies
 * - Response Interceptor für automatische Weiterleitung bei 401
 * 
 * @example
 * ```tsx
 * import { apiClient } from '@/lib/api-client';
 * 
 * // GET Request
 * const response = await apiClient.get('/anfrage/');
 * 
 * // POST Request
 * const response = await apiClient.post('/anfrage/', data);
 * ```
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true, // Wichtig: Session-Cookies automatisch mitsenden
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response Interceptor für globales Error Handling.
 * Bei 401 Unauthorized wird der User zur Login-Seite weitergeleitet.
 */
apiClient.interceptors.response.use(
  // Bei erfolgreicher Response: einfach durchreichen
  (response) => response,
  
  // Bei Error: 401 abfangen und zur Login-Seite weiterleiten
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Nur im Browser (nicht auf Server) weiterleiten
      if (typeof window !== 'undefined') {
        // Aktuelle URL als Redirect-Parameter speichern
        const currentPath = window.location.pathname;
        const loginUrl = `/login${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
        
        // Weiterleitung zur Login-Seite
        window.location.href = loginUrl;
      }
    }
    
    // Error weiter nach oben propagieren für lokales Handling
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
