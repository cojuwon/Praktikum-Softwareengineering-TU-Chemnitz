In diesem Projekt gibt es ein Django Backend (im Ordner Backend) und zwei Frontends (Ordner "frontend" und "frontend_neu")
Dabei ist in "frontend" das Frontend, welches vom Frontend Team erstellt wurde und in "frontend_neu" das Redesign-Frontend, welches spontan noch von Eric und Jonathan erstellt wurde.

Diese Readme ist temporär für das MVP.



# Ausführen
Das ganze Projekt läuft zurzeit in einem Docker Stack. Die benötigte docker-compose steht hier schon bereit.

# Initial Setup
- Eventuell müssen in der settings.py (innerhalb des Backends) die Datenbank Einstellungen angepasst werden und eine .env erstellt werden. Eine ".env.example" liegt bei.
- Kopiere die ".env.example" zu ".env" und passe die Werte und Secrets nach Belieben (sicher) an.
- Führe im Backend-Container (oder lokal im `backend`-Ordner) den folgenden Befehl aus, um das Projekt vollständig zu initialisieren:
  `python manage.py init_project`
  Dies führt folgende Schritte automatisch aus:
  1. Richtet Gruppen und Berechtigungen ein (`setup_groups`)
  2. Initialisiert Standard-Eingabefelder (`init_eingabefelder`)
  3. Initialisiert Statistik-Presets (`init_statistics`)
  4. Erstellt einen Standard-Superuser (`admin@test.de` mit Passwort `admin123`), falls noch nicht vorhanden (`setup_superuser`)

- Alternativ können diese Schritte auch einzeln ausgeführt werden:
  - `python manage.py setup_groups`
  - `python manage.py init_eingabefelder`
  - `python manage.py init_statistics`
  - `python manage.py setup_superuser` (oder `createsuperuser` für manuelle Eingabe)
  Hinweis: Wenn `setup_superuser` manuell ausgeführt wird, stelle sicher, dass `setup_groups` vorher gelaufen ist, damit der User automatisch der Admin-Gruppe zugewiesen wird.
- Eine detaillierte Dokumentation zur Systeminitialisierung finden Sie unter [`docs/setup_initial.md`](docs/setup_initial.md).

- Der Superuser kann sich nun im Frontend und unter localhost:8000/admin einloggen.


# API 
- Die API lässt sich über "localhost:8000/api/docs" testen. Hier kann zurzeit manuell ein User hinzugefügt werden, indem unter AUTH "POST /api/auth/registration/" ausgeführt wird. Dem User wird hier die Rolle Benutzer zugewiesen. Damit dieser aber Rechte bekommt, muss ihm die Rolle "Benutzer" zurzeit auch noch über das Admin-Dashboard ("localhost:8000/admin") als Gruppe zugewiesen werden.
- Debugging: Wenn die Permissions funktionieren, werden diese beim Login als API response auch an das Frontend übergeben. Wenn hier der Permissions Array leer sein sollte, sind dem User noch keine Permissions zugewiesen.

# Frontend aufrufen
- Das Frontend ist, wenn alle drei Docker Container (DB, API und Frontend) laufen, unter localhost:3000 erreichbar. Nachdem wie oben beschrieben ein Nutzer erstellt wurde, kann sich dieser einloggen


# Weitere Informationen
- Das Anlegen eines neuen Nutzers über das Admin Dashboard funktionert nicht vollständig, dieser muss zuerst per API angelegt werden (wegen dem Passwort). Im Admin Dashboard wird das Passwort nur verschlüsselt gespeichert - gibt man hier direkt "Freitext" ein Passwort ein, funktioniert deswegen der Login damit nicht. Nachdem der Nutzer initial über die API angelegt wurde, kann er auch über das Admin Dashboard bearbeitet werden.


# Um den Code manuell zu testen:

## III. System starten (Entwicklungsmodus)

Es werden **3 Terminals** benötigt.

---

### **Terminal 1: Datenbank starten**
```bash
docker compose up db
```

---

### **Terminal 2: Backend (Django) starten**
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

### **Terminal 3: Frontend (Next.js) starten**
```bash
cd frontend
npm install
npm run dev
```

Frontend erreichbar unter: **http://localhost:3000**

---
