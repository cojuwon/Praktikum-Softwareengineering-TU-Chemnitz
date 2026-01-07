In diesem Projekt gibt es ein Django Backend (im Ordner Backend) und zwei Frontends (Ordner "frontend" und "frontend_neu")
Dabei ist in "frontend" das Frontend, welches vom Frontend Team erstellt wurde und in "frontend_neu" das Redesign-Frontend, welches spontan noch von Eric und Jonathan erstellt wurde.

Diese Readme ist temporär für das MVP.



# Ausführen
Das ganze Projekt läuft zurzeit in einem Docker Stack. Die benötigte docker-compose steht hier schon bereit.

# Initial Setup
- Eventuell müssen in der settings.py (innerhalb des Backends) die Datenbank Einstellungen angepasst werden und eine .env erstellt werden. eine ".env.example" liegt bei.
- die ".env.example" kopieren zu ".env" und die Werte und Secrets nach belieben (sicher) anpassen
- Im Backend muss ein Superuser angelegt werden. Dies geschieht, indem im "django_api" Container "python manage.py createsuperuser" ausgeführt wird. Hier wird dann Email und Passwort vergeben.
- anschließend ist, um erstmalig (temporär fürs MVP) die Berechtigungen festzulegen auch im "django_api" container "python manage.py setup_groups" auszuführen.
- Zurzeit hat dieser Superuser in der Anwendung nur Admin-Rechte, wenn diese ihm Manuell noch zugewiesen werden. Dies geschieht über localhost:8000/admin - hier kann sich mit dem neu erstellten Superuser Account eingeloggt werden und anschließend diesem die Gruppe "Admin" zugewiesen werden. (Wenn die Gruppe im Admin-Panel nicht erscheint, wurde der obere Schritt nicht richtig ausgeführt)


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
