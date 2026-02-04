# Softwareengineering – TU Chemnitz

## 1. Projektübersicht

Dieses Repository enthält die praktische Umsetzung eines Softwareengineering-Projekts im Rahmen des Praktikums an der Technischen Universität Chemnitz.

Ziel des Projekts ist die Konzeption und Implementierung eines softwarebasierten Systems zur strukturierten Erfassung, Verwaltung und Auswertung von Beratungs- und Begleitungsdaten für den Bellis e.V..

Das System soll analoge und manuelle Dokumentationsprozesse (z. B. Papierformulare, Tabellenkalkulationen) ablösen und eine nachvollziehbare Datengrundlage für statistische Auswertungen schaffen.

---

## 2. Projektstruktur

Die folgende Übersicht beschreibt die wichtigsten Ordner und Dateien im `main`-Branch des Repositories sowie deren jeweilige Aufgabe.

### Übersicht der Verzeichnisstruktur

```text
├── backend/              # Django Backend (REST API)
│   ├── api/              # ViewSets, Serializers und Permissions
│   ├── models/           # Datenbank-Models
│   ├── migrations/       # Datenbank-Migrationen
│   └── settings.py       # Django-Projekteinstellungen
├── frontend/             # React Frontend
│   ├── components/       # Wiederverwendbare UI-Komponenten
│   ├── pages/            # Frontend-Seiten (z. B. Login, Dashboard)
│   └── services/         # API-Aufrufe an das Backend
├── frontend_neu/         # Experimentelles / überarbeitetes Frontend (nicht produktiv)
├── UML/                  # UML-Diagramme (nur Dokumentation)
├── requirements/         # Anforderungsdokumente und theoretische Ausarbeitungen
├── docker-compose.yml    # Docker-Compose-Konfiguration
└── .env.example          # Beispielhafte Umgebungsvariablen
```

### Beschreibung der Hauptordner

#### backend/

Enthält das Backend der Anwendung, implementiert mit Django.  
Hier befinden sich unter anderem die Datenmodelle, Views, Serializer, Berechtigungen sowie die REST-API.

#### 1. Models (Datenbankstruktur)
Models definieren, **welche Daten gespeichert werden**.
Typische Aufgaben:
- Speicherung von Benutzerdaten
- Zuordnung von Rollen zu Benutzern
- Definition von Beziehungen zwischen Daten
Jedes Model wird automatisch als Tabelle in der Datenbank angelegt.
---
#### 2. Serializers (Datenumwandlung)
Serializer übernehmen:
- die Umwandlung von Datenbankobjekten in **JSON**
- die Validierung von Daten, die vom Frontend gesendet werden
Sie stellen sicher, dass nur gültige und erlaubte Daten verarbeitet werden.
---
#### 3. Views / ViewSets (Programmlogik)
Views enthalten die **Programmlogik**:
- Empfangen HTTP-Anfragen (GET, POST, PUT/PATCH, DELETE)
- Greifen auf Models und Serializers zu
- Überprüfen Permissions
- Liefern strukturierte Antworten zurück
Beispiele:
- Benutzer anlegen
- Benutzerinformationen abrufen
- Rollen ändern
- Daten löschen
Hier wird gesteuert, welche Aktionen ein Benutzer ausführen darf.
---
#### 4. Permissions (Zugriffsrechte)
Permissions stellen sicher, dass:
- nur berechtigte Benutzer Zugriff erhalten
- Administratoren alle Daten verwalten können
- normale Nutzer nur ihre eigenen Daten einsehen dürfen
Diese Prüfungen erfolgen vor jeder Anfrageverarbeitung
- nur eingeloggte Benutzer dürfen Daten abrufen
- bestimmte Aktionen sind nur Administratoren erlaubt
- Rollen bestimmen die verfügbaren Funktionen
---
#### 5. Authentifizierung
Die Authentifizierung stellt sicher, dass:
- Benutzer eindeutig identifiziert werden
- geschützte Endpunkte nur für berechtigte Nutzer zugänglich sind
Ablauf:
Ablauf beim Login:
1. Benutzer gibt Login-Daten im Frontend ein
2. Daten werden an das Backend gesendet
3. Backend prüft Benutzername und Passwort
4. Bei Erfolg wird der Benutzer authentifiziert
5. Zugriff auf geschützte Endpunkte ist erlaubt
---
#### 6. Admin-Interface
Django stellt ein integriertes Admin-Interface bereit.
Dort können:
- Benutzer erstellt und bearbeitet werden
- Rollen verwaltet werden
- Daten direkt in der Datenbank eingesehen werden
Das Admin-Interface ist erreichbar unter: http://localhost:8000/admin
---

#### frontend/

Beinhaltet das aktuell genutzte Frontend der Anwendung.  
Dieses stellt die Benutzeroberfläche bereit und kommuniziert mit dem Backend über die API.

#### 1. Aufbau
- **Components**: wiederverwendbare UI-Elemente
- **Pages**: Login, Dashboard, Benutzerverwaltung
- **Services**: API-Kommunikation
#### 2. Aufgaben
- Darstellung der Benutzeroberfläche
- Weiterleitung von Benutzeraktionen an das Backend
- Anzeige von Ergebnissen und Fehlermeldungen
#### 3. Kommunikation mit Backend
- `GET`: Daten abrufen
- `POST`: neue Daten anlegen (z. B. Benutzer)
- `PUT/PATCH`: Daten ändern
- `DELETE`: Daten löschen
Antworten werden als JSON verarbeitet und im Frontend dargestellt.
#### 4. Rollenabhängige Darstellung
Das Frontend passt die Ansicht abhängig von:
- Login-Status
- Benutzerrolle
Beispiel: Nur Admins sehen die Benutzerverwaltung.
Die endgültige Zugriffskontrolle erfolgt immer im Backend.
---

#### frontend_neu/

Experimentelles bzw. überarbeitetes Frontend-Konzept.  
Dieser Ordner ist nicht Teil des aktuellen Projekts und wird für die Ausführung des Projekts nicht benötigt.

#### UML/

Sammlung von UML-Diagrammen (z. B. Klassen- oder Sequenzdiagramme), die zur Modellierung und zum besseren Verständnis der Systemarchitektur dienen.  
Dieser Ordner hat ausschließlich dokumentativen Charakter.

#### requirements/

Enthält Anforderungsdokumente sowie theoretische Ausarbeitungen zur Aufteilung der Klassen und Funktionalitäten.  
Auch dieser Ordner ist nicht für den laufenden Betrieb relevant.

#### Konfigurationsdateien

Weitere Konfigurationsdateien (z. B. `docker-compose.yml`, `.env.example`) dienen zur Konfiguration und zum Starten der Anwendung, insbesondere im Rahmen der containerbasierten Entwicklung.

> **Hinweis:**  
> Die Ordner `frontend_neu/`, `UML/` und `requirements/` sind nicht notwendig, um das Projekt auszuführen.  
> Sie dienen ausschließlich der Dokumentation, Planung oder Weiterentwicklung.

---

## 3. Verwendete Technologien

Für die Umsetzung des Projekts wurden folgende Technologien und Werkzeuge eingesetzt:

### Backend
- Python
- Django
- Django REST Framework

### Frontend
- Node.js
- JavaScript-basiertes Frontend-Framework (z. B. React / Next.js)

### Infrastruktur & Tools
- Docker
- Docker Compose
- Git & GitHub zur Versionsverwaltung

---

## 4. Funktionalität der Anwendung

Die Anwendung besteht aus einem zentralen Backend, das die Geschäftslogik und Datenhaltung übernimmt, sowie einem Frontend, das als Benutzeroberfläche dient.

Das Backend stellt eine REST-API bereit, über die das Frontend mit dem System interagiert.  
Anfragen aus dem Frontend werden verarbeitet, validiert und anschließend in der Datenbank gespeichert oder aus dieser gelesen. Dabei kommen rollen- und berechtigungsbasierte Zugriffskonzepte zum Einsatz.

Das Frontend ermöglicht es den Nutzern, mit den im Backend bereitgestellten Funktionen zu interagieren, ohne direkten Zugriff auf die internen Strukturen des Systems zu benötigen.  
Die Kommunikation erfolgt ausschließlich über definierte API-Schnittstellen.

Eine detaillierte Beschreibung einzelner Funktionen, Use-Cases oder Abläufe kann bei Bedarf ergänzt werden.

---

## 5. Installation und Ausführung

## Ausführen
Das ganze Projekt läuft zurzeit in einem Docker Stack. Die benötigte docker-compose steht hier schon bereit.

## Initial Setup
- Eventuell müssen in der settings.py (innerhalb des Backends) die Datenbank Einstellungen angepasst werden und eine .env erstellt werden. eine ".env.example" liegt bei.
- die ".env.example" kopieren zu ".env" und die Werte und Secrets nach belieben (sicher) anpassen
- Im Backend muss ein Superuser angelegt werden. Dies geschieht, indem im "django_api" Container "python manage.py createsuperuser" ausgeführt wird. Hier wird dann Email und Passwort vergeben.
- anschließend ist, um erstmalig (temporär fürs MVP) die Berechtigungen festzulegen auch im "django_api" container "python manage.py setup_groups" auszuführen.
- Zurzeit hat dieser Superuser in der Anwendung nur Admin-Rechte, wenn diese ihm Manuell noch zugewiesen werden. Dies geschieht über localhost:8000/admin - hier kann sich mit dem neu erstellten Superuser Account eingeloggt werden und anschließend diesem die Gruppe "Admin" zugewiesen werden. (Wenn die Gruppe im Admin-Panel nicht erscheint, wurde der obere Schritt nicht richtig ausgeführt)


## API 
- Die API lässt sich über "localhost:8000/api/docs" testen. Hier kann zurzeit manuell ein User hinzugefügt werden, indem unter AUTH "POST /api/auth/registration/" ausgeführt wird. Dem User wird hier die Rolle Benutzer zugewiesen. Damit dieser aber Rechte bekommt, muss ihm die Rolle "Benutzer" zurzeit auch noch über das Admin-Dashboard ("localhost:8000/admin") als Gruppe zugewiesen werden.
- Debugging: Wenn die Permissions funktionieren, werden diese beim Login als API response auch an das Frontend übergeben. Wenn hier der Permissions Array leer sein sollte, sind dem User noch keine Permissions zugewiesen.

## Frontend aufrufen
- Das Frontend ist, wenn alle drei Docker Container (DB, API und Frontend) laufen, unter localhost:3000 erreichbar. Nachdem wie oben beschrieben ein Nutzer erstellt wurde, kann sich dieser einloggen


## Weitere Informationen
- Das Anlegen eines neuen Nutzers über das Admin Dashboard funktionert nicht vollständig, dieser muss zuerst per API angelegt werden (wegen dem Passwort). Im Admin Dashboard wird das Passwort nur verschlüsselt gespeichert - gibt man hier direkt "Freitext" ein Passwort ein, funktioniert deswegen der Login damit nicht. Nachdem der Nutzer initial über die API angelegt wurde, kann er auch über das Admin Dashboard bearbeitet werden.


## Um den Code manuell zu testen:

### III. System starten (Entwicklungsmodus)

Es werden **3 Terminals** benötigt.

---

#### **Terminal 1: Datenbank starten**
```bash
docker compose up db
```

---

#### **Terminal 2: Backend (Django) starten**
```bash
cd backend

python -m venv venv
# macOS/Linux:
source venv/bin/activate
# Windows CMD:
venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend erreichbar unter: **http://localhost:8000**

---

#### **Terminal 3: Frontend (Next.js) starten**
```bash
cd frontend
npm install
npm run dev
```

Frontend erreichbar unter: **http://localhost:3000**

---