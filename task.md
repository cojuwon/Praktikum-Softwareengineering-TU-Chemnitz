**Rolle:** Senior Django Backend Developer **Projekt:** Django REST Backend für eine Next.js Frontend Applikation (Verwaltungssystem für eine Beratungsstelle gegen sexualisierte Gewalt).

**Kontext:** Wir refactoring das Statistik-Modul im Backend. Der aktuelle Code in `backend/api/views/statistik.py` und `backend/api/services/statistik_service.py` enthält viele hardcodierte Aggregationen und spezifische Endpunkte für einzelne Diagramme. Das ist nicht wartbar und entspricht nicht den Anforderungen an ein dynamisches Dashboard. Das Ziel ist es, das Backend zur "Single Source of Truth" zu machen. Das Frontend (welches "dumm" ist) soll vom Backend erfahren, welche Daten analysierbar sind, und dann generische Abfragen senden.

**Deine Aufgabe:** Refactoriere und erweitere die Statistik-API im Backend, um ein dynamisches, konfigurierbares Reporting-System zu ermöglichen. Nichts Chart-Spezifisches soll hardgecodet sein.

**Spezifische Anforderungen & Implementierungsschritte:**

1. **Metadaten-Endpunkt (`/api/statistik/metadata/`):**  
   * Erstelle einen neuen Endpoint, der dem Frontend liefert, welche Models und Felder für Statistiken verfügbar sind.  
   * Berücksichtige folgende Models: `Anfrage`, `Fall`, `Klient`, `Beratungstermin`, `Begleitung`, `Gewalttat`, `Gewaltfolge`.  
   * Die Antwort soll JSON sein und pro Model enthalten:  
     * **Filterbare Felder:** (z. B. Datum, Boolean-Flags, Enums).  
     * **Gruppierbare Felder (Dimensionen):** (z. B. `anfrage_art`, `geschlecht`, `wohnort` etc. \- nutze `get_FOO_display` Logik für Enums).  
     * **Metriken:** (Standardmäßig "Anzahl", aber bereite Summenfelder vor, z. B. für "Dauer").  
   * *Wichtig:* Lies die `field.verbose_name` und `choices` aus den Django Models aus, damit das Frontend korrekte Labels anzeigen kann.  
2. **Generischer Query-Endpoint (`POST /api/statistik/query/`):**  
   * Ersetze die vielen einzelnen GET-Methoden durch einen zentralen Endpoint.  
   * Dieser Endpoint akzeptiert einen JSON-Body mit:  
     * `base_model`: (z. B. "Anfrage")  
     * `filters`: Ein Dictionary mit Django-Lookups (z. B. `{"datum__gte": "2024-01-01", "ort": "Leipzig"}`).  
     * `group_by`: Das Feld, nach dem gruppiert werden soll (z. B. "anfrage\_art").  
     * `metric`: Die Aggregationsfunktion (z. B. "count").  
   * Implementiere die Logik im `StatistikService`, die basierend darauf dynamisch das QuerySet zusammenbaut (`.filter()`, `.values()`, `.annotate()`).  
   * Sichere dies ab: Erlaube nur Felder, die auch in den Metadaten exponiert sind, um SQL-Injection oder Information Disclosure zu verhindern.  
3. **Erweiterung des `Preset` Models (oder neues `StatistikConfig` Model):**  
   * Das bestehende `Preset`\-System (falls vorhanden) oder ein neues Model soll genutzt werden, um diese Konfigurationen zu speichern.  
   * Anstatt nur einen Namen zu speichern, soll ein `Preset` das JSON-Objekt für den Query-Endpoint speichern (welches Model, welche Filter, welche Gruppierung).  
   * Damit kann der Benutzer im Frontend eine Einstellung wählen, und das Frontend sendet einfach die gespeicherte Konfiguration an den Query-Endpoint.  
4. **Initialisierungs-Skript (`backend/api/management/commands/init_statistics.py`):**  
   * Die Anforderungen (siehe PDF "Statistik-Bogen" und "Statistische Angaben") verlangen spezifische Standard-Statistiken (z. B. "Anfragen nach Art", "Altersstruktur der Klient\*innen", "Wohnortverteilung").  
   * Schreibe ein Management Command, das diese *Standard-Presets* in die Datenbank schreibt.  
   * Das ist der Ort, an dem "hardgecodet" wird – aber nur als *Initialdaten*, die später über die API geändert/gelöscht werden könnten.  
   * Stelle sicher, dass Felder wie "Migrationshintergrund" oder "Behinderung" (aus den PDFs) als dynamische Filter/Presets angelegt werden.  
5. **Berechtigungen (Permissions):**  
   * Halte dich strikt an `dev_documentation/permissions`.  
   * Nutze oder erstelle Berechtigungen wie `can_view_statistics` und `can_manage_presets`.  
   * Prüfe diese Permissions in den Views (`permission_classes`).  
6. **Testing:**  
   * Schreibe Tests in `backend/api/tests/test_statistik_dynamic.py`.  
   * Teste den Metadaten-Endpunkt (kommt die richtige Struktur zurück?).  
   * Teste den Query-Endpunkt mit verschiedenen Filtern und Gruppierungen (stimmen die Zahlen?).  
   * Teste die Permissions (darf ein User ohne Rechte abfragen?).

**Hinweise zur Architektur:**

* Das Frontend ist "dumm". Wenn das Backend sagt, das Feld heißt "Geschlecht", zeigt das Frontend "Geschlecht" an.  
* Nutze `django-filter` falls hilfreich, oder baue dynamische `Q`\-Objekte.  
* Ignoriere den Ordner `frontend_neu`, konzentriere dich rein auf die Bereitstellung der API, die vom bestehenden Frontend (angepasst) konsumiert werden kann.

**Output:** Liefere den Code für die geänderten Files (`views`, `serializers`, `services`, `models`, `urls`), das Management Command und die Tests. Erkläre kurz, wie das Frontend die neuen Endpoints nutzen soll.

