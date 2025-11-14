# Praktikum-Softwareengineering-TU-Chemnitz

Praktikum Softwareengineering an der TU Chemnitz im Wintersemester 2025/26

**To-Do's auf GoogleDocs:**  
https://docs.google.com/document/d/1HVR-9rVzsoVTS44D9Iv6oBJSmQ-rRtRpz1IJbFZy2sQ/edit?tab=t.0

---

## 🚀 Projektstart & Workflows

Es gibt zwei empfohlene Wege, um das Projekt lokal zu starten:

- **Workflow 1:** Startet die gesamte Anwendung (DB, Backend, Frontend) in Docker. Ideal für finale Tests.
- **Workflow 2:** Startet nur die Datenbank in Docker. Frontend & Backend laufen lokal mit Live-Reload (für Entwicklung empfohlen).

---

# Workflow 1: Alles über Docker Compose (Produktions-Simulation)

Dieser Workflow baut und startet das gesamte System (Frontend, Backend, DB) in Docker-Containern.

---

## I. Projekt Vorbereitung

### 1. Code klonen
```bash
git clone https://github.com/cojuwon/Praktikum-Softwareengineering-TU-Chemnitz
cd Praktikum-Softwareengineering-TU-Chemnitz
```

### 2. Umgebung kopieren
```bash
cp .env.example .env
```

### 3. Konfiguration anpassen
Passe Passwörter, Keys und DB-Namen in der `.env` Datei an.

---

## II. System starten & initialisieren

### Starten & Bauen
```bash
docker compose up --build -d
```

---

## III. Zugriff & Verwaltung

| Dienst | Adresse |
|--------|---------|
| Frontend (Next.js) | http://localhost:3000 |

### Entwickler-Aktionen

**DB-Struktur ändern**
```bash
docker compose exec api python manage.py makemigrations
```

**Migration anwenden**
```bash
docker compose exec api python manage.py migrate
```

**System stoppen**
```bash
docker compose down
```

---

# Workflow 2: Lokale Entwicklung (Empfohlen für Entwickler)

Nur die Datenbank läuft in Docker – Frontend & Backend laufen auf deinem PC.  
Ermöglicht Live-Reload und einfaches Debugging.

---

## I. Voraussetzungen

- Git  
- Docker & Docker Compose  
- Node.js + npm  
- Python 3.11+ + pip  

---

## II. Projekt Vorbereitung (nur einmal nötig)

### Klonen & Setup
```bash
git clone https://github.com/cojuwon/Praktikum-Softwareengineering-TU-Chemnitz
cd Praktikum-Softwareengineering-TU-Chemnitz
cp .env.example .env
```

### Datenbank-Port freigeben

**docker-compose.yml – db Service erweitern:**
```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: postgres_db
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    env_file:
      - .env
    ports:
      - "5432:5432" # Add this line to expose the database port
    networks:
      - webnet
```

### `.env` Datei anpassen
```env
DB_HOST=localhost
DB_PORT=5432
```

---

## III. System starten (Entwicklungsmodus)

Du benötigst **3 Terminals**.

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
# .\venv\Scripts\activate

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

## IV. Zugriff & Stoppen

### URLs
- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:8000

### System stoppen
- In Terminal 2 & 3: `Strg + C`  
- In Terminal 1: `Strg + C` (Datenbank stoppen)

---

