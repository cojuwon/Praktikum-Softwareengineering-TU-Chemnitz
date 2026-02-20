# BelliS – Beratungs-, Erfassungs- und Leitstelleninformationssystem

Eine webbasierte Fachberatungssoftware zur Dokumentation und statistischen Auswertung von Beratungsfällen im Bereich geschlechtsspezifischer Gewalt.

**Technologie-Stack:** Django (Backend/API) · Next.js (Frontend) · PostgreSQL (Datenbank) · Docker

---

## Voraussetzungen

- [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) (inkl. Docker Compose) muss installiert und gestartet sein.

## 📥 Release herunterladen

1. Navigiere zur [**Releases-Seite**](../../releases) dieses Repositories
2. Lade den neuesten Release als **Source Code (zip)** herunter
3. Entpacke das Archiv in einen beliebigen Ordner

## 🚀 Projekt starten

### Option A: Automatischer Start (Empfohlen)

Die mitgelieferten Startskripte übernehmen das komplette Setup:
- Erstellen automatisch die `.env`-Datei mit sicheren, zufallsgenerierten Passwörtern
- Bauen und starten alle Docker-Container

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Mac / Linux:**
```bash
bash start.sh
```

### Option B: Manueller Start

1. `.env.example` kopieren und als `.env` speichern:
   ```bash
   cp .env.example .env
   ```
2. Optional: Passwörter in `.env` anpassen (für lokale Nutzung sind die Standardwerte ausreichend)
3. Container bauen und starten:
   ```bash
   docker compose up -d --build
   ```

*Für zukünftige Neustarts ohne Neubau:* `docker compose up -d`

## 🌐 Zugriff auf die Anwendung

Nach dem Start sind folgende Dienste erreichbar:

| Dienst | URL |
|---|---|
| **Frontend (Weboberfläche)** | [http://localhost:3000](http://localhost:3000) |
| **Backend (REST-API)** | [http://localhost:8000](http://localhost:8000) |
| **API-Dokumentation (Swagger)** | [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) |

## 🔐 Erster Login & Admin-Zugang

Beim ersten Start wird automatisch ein **Admin-Benutzer** angelegt (sofort aktiv, kein Freigabe-Schritt nötig).

### Login-Daten abrufen

Das Admin-Passwort wird aus Sicherheitsgründen **zufällig generiert** und in den Container-Logs ausgegeben:

```bash
docker compose logs api | grep "Generiertes Passwort"
```

*Windows PowerShell:*
```powershell
docker compose logs api | Select-String "Generiertes Passwort"
```

**Login-Daten:**
- **E-Mail:** `admin@adminuser.de`
- **Passwort:** *(siehe Ausgabe oben)*

> [!WARNING]
> Bitte nach dem ersten Login das Passwort in den **Benutzereinstellungen** ändern!

### Weitere Benutzer anlegen

- **Admin-Panel:** Sidebar → Benutzerverwaltung → „Neuer Benutzer"
- **Selbstregistrierung:** Neue Benutzer können sich über die Login-Seite registrieren. Die Registrierung muss anschließend von einem Admin freigegeben werden.

**Verfügbare Rollen:**
| Rolle | Beschreibung |
|---|---|
| **Basis** | Standardzugriff auf Fälle und Anfragen |
| **Erweiterung** | Erweiterte Rechte inkl. Statistiken |
| **Admin** | Vollzugriff inkl. Benutzerverwaltung und Systemeinstellungen |

## 🛑 Projekt stoppen

```bash
docker compose down
```

Alle Daten (Datenbank) inklusive löschen:
```bash
docker compose down -v
```

> [!CAUTION]
> `docker compose down -v` löscht alle Fälle, Benutzer und das Admin-Passwort unwiderruflich. Beim nächsten Start wird ein neues Setup durchgeführt.

---

## 🔧 Technische Details

### Architektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  PostgreSQL  │
│  (Next.js)  │     │  (Django)   │     │     (DB)     │
│  Port 3000  │     │  Port 8000  │     │  Port 5432   │
└─────────────┘     └─────────────┘     └─────────────┘
```

Alle drei Services laufen als Docker-Container und kommunizieren über ein internes Docker-Netzwerk (`webnet`).

### Was passiert beim ersten Start?

Der Backend-Container führt folgende Schritte automatisch aus (siehe `backend/dockerfile`):

1. **Warten auf Datenbank** – wartet, bis PostgreSQL erreichbar ist
2. **Migrationen anwenden** – `python manage.py migrate`
3. **Gruppen einrichten** – `python manage.py setup_groups` (erstellt Berechtigungsgruppen: Admin, Erweiterung, Basis)
4. **Superuser erstellen** – `python manage.py setup_superuser` (erstellt `admin@adminuser.de` mit generiertem Passwort, direkt aktiv)
5. **Statische Dateien sammeln** – `python manage.py collectstatic`
6. **Gunicorn starten** – Production-WSGI-Server auf Port 8000

> **Hinweis:** Eingabefelder (Formular-Konfiguration) für Anfragen und Fälle werden automatisch beim ersten Zugriff auf die jeweilige Seite initialisiert.

### Custom Management Commands

| Command | Beschreibung |
|---|---|
| `setup_groups` | Erstellt die Berechtigungsgruppen (Admin, Erweiterung, Basis) mit den zugehörigen Django-Permissions |
| `setup_superuser` | Erstellt den initialen Admin-User mit zufälligem Passwort (idempotent, überspringt wenn bereits vorhanden) |
| `init_eingabefelder` | Initialisiert manuell die Formularfelder für Anfragen und Fälle (geschieht auch automatisch beim ersten Zugriff) |
| `cleanup_trash` | Löscht Elemente im Papierkorb, die älter als die konfigurierte Aufbewahrungsfrist sind |
| `create_test_data` | Erstellt Testdaten für die Entwicklungsumgebung |
| `seed_presets` | Erstellt vordefinierte Statistik-Presets |

### Umgebungsvariablen (`.env`)

| Variable | Beschreibung | Standardwert |
|---|---|---|
| `POSTGRES_DB` | Name der Datenbank | `bellis_db` |
| `POSTGRES_USER` | Datenbank-Benutzer | `bellis_user` |
| `POSTGRES_PASSWORD` | Datenbank-Passwort | *(wird automatisch generiert)* |
| `SECRET_KEY` | Django Secret Key | *(wird automatisch generiert)* |
| `DEBUG` | Django Debug-Modus | `True` |
| `DB_HOST` | Datenbank-Host (intern) | `db` |
| `DB_PORT` | Datenbank-Port | `5432` |
| `DJANGO_INTERNAL_HOST` | Interne Django-URL für Next.js SSR | `http://api:8000` |
