# Praktikum-Softwareengineering-TU-Chemnitz
Praktikum Softwareengineering an der TU Chemnitz im Wintersemester 2025/26

To-Do's auf GoogleDocs: https://docs.google.com/document/d/1HVR-9rVzsoVTS44D9Iv6oBJSmQ-rRtRpz1IJbFZy2sQ/edit?tab=t.0


# 🚀 START LOKAL: Next.js/Django/PostgreSQL (Entwicklungs-Workflow)

---

### I. PROJEKT VORBEREITUNG

| Schritt | Befehl | Erklärung |
| :--- | :--- | :--- |
| **1. Code klonen** | `git clone https://github.com/cojuwon/Praktikum-Softwareengineering-TU-Chemnitz`<br>`cd Praktikum-Softwareengineering-TU-Chemnitz` | Lädt den Code herunter und wechselt in das Hauptverzeichnis. |
| **2. Umgebung kopieren** | `cp .env.example .env` | Erstellt die lokale Konfigurationsdatei. |
| **3. Konfiguration anpassen** | *(Lokales Bearbeiten)* | **WICHTIG:** Passe Passwörter, Keys und DB-Namen in der `.env` an. |

---

### II. SYSTEM STARTEN & INITIALISIEREN (MANUELL)

| Schritt | Befehl | Erklärung |
| :--- | :--- | :--- |
| **Starten & Bauen** | `docker compose up --build -d` | Baut die Images, startet alle Container (`db`, `api`, `frontend`) und trennt sie vom Terminal. |


---

### III. ZUGRIFF & ENTWICKLUNG

| Dienst | Adresse |
| :--- | :--- |
| **Frontend (Next.js)** | `http://localhost:3000` |

| Entwicklungs-Aktion | Befehl |
| :--- | :--- |
| **DB-Struktur ändern** | `docker compose exec api python manage.py makemigrations` |
| **Migration anwenden** | `docker compose exec api python manage.py migrate` |
| **System stoppen** | `docker compose down` |