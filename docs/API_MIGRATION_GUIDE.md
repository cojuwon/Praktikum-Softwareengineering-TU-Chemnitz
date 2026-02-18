# API Migration & Compatibility Guide (Statistik)

Dieses Dokument beschreibt die Unterschiede zwischen der bisherigen Fake-API im Frontend und dem echten Backend-Implementation.

## 1. Endpunkte & URLs
Die wichtigste Änderung betrifft die URL-Struktur. Das Django-Backend erwartet **Trailing Slashes** (abschließende Schrägstriche).

| Funktion | Alte URL (Fake API) | Neue URL (Backend) | Methode |
| :--- | :--- | :--- | :--- |
| **Filter-Optionen laden** | `/api/statistik/filters` | `/api/statistik/filters/` | GET |
| **Presets laden** | `/api/statistik/presets` | `/api/statistik/presets/` | GET |
| **Report abfragen** | `/api/statistik/query` | `/api/statistik/query/` | POST |

> **Wichtig:** Alle Requests müssen nun authentifiziert erfolgen (siehe unten).

## 2. Authentifizierung
Die Fake-API benötigte keine Authentifizierung. Das Backend erfordert zwingend einen gültigen **JWT-Token** oder Session-Cookie.
Allerdings handhabt die `apiFetch`-Utility im Frontend dies bereits automatisch, indem sie den Token aus `localStorage` oder Cookies liest und den `Authorization: Bearer <token>` Header setzt.

## 3. Datenstruktur (Kompatibilität)
Die Antwortstruktur der API (`/api/statistik/query/`) ist **identisch** zur Fake-API.
Das Backend liefert weiterhin ein JSON-Objekt mit den Hauptschlüsseln:
- `structure`: Definition der Labels und Hierarchie für die Anzeige.
- `data`: Die tatsächlichen Zahlenwerte.

Das Frontend muss daher **nicht** angepasst werden, um die Daten zu parsen.

## 4. Filter-Logik & Einschränkungen
Hier gibt es funktionale Unterschiede zwischen der Erwartungshaltung des Frontends (basierend auf der Fake-API) und der aktuellen Backend-Implementierung für den Standard-Report.

### Unterstützte Filter
Das Backend unterstützt aktuell im **Standard-Report** (`/api/statistik/query/`) nur folgende Filter:
- `zeitraum_start` (Datum)
- `zeitraum_ende` (Datum)

### Aktuell ignorierte Filter
Das Frontend bietet zwar Dropdowns für weitere Filter an (z.B. *Tatort*, *Beratungsstelle*, *Anfrage-Ort*), diese werden vom Backend für den **Gesamt-Report** derzeit **ignoriert**.
Der Report wird immer über alle Fälle im gewählten Zeitraum generiert.

> **Hintergrund:** Der Standard-Statistikbogen ist sehr komplex und aggregiert Daten über viele verschiedene Dimensionen hinweg. Eine Filterung nach z.B. "Tatort" würde erfordern, dass *jede einzelne Kennzahl* (auch solche, die nichts mit dem Tatort zu tun haben, wie z.B. Beratungsarten) darauf gefiltert wird, was semantisch oft nicht möglich ist.

Für spezifische Analysen (z.B. "Anzahl Fälle pro Tatort") sollte langfristig der `/api/statistik/dynamic-query/` Endpoint genutzt werden.

## 5. Filter-Optionen (Dropdowns)
Die URL `/api/statistik/filters/` liefert nun **echte** Datenbank-Werte (aus den Django `Choices` Enums) statt harcdodierter Strings.
- **Vorteil:** Die Dropdowns im Frontend zeigen nun nur noch valide, im System existierende Optionen an.
- **Keine Änderung nötig:** Das Format der Antwort (`{ filters: [...] }`) ist kompatibel geblieben.
