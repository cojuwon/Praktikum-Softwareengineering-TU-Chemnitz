# Projekt Setup Guide

Dieses Projekt ist so konfiguriert, dass es so einfach wie möglich mithilfe von Docker gestartet werden kann. Alle notwendigen Abhängigkeiten, Datenbank-Initialisierungen und Setup-Schritte werden beim Starten der Container automatisch im Hintergrund ausgeführt.

## Voraussetzungen
- **Docker** und **Docker Compose** müssen auf deinem System installiert sein.

## 🚀 Projekt starten

### Option A: Automatischer Start (Empfohlen)
Wir haben Startskripte vorbereitet, die dir jegliche Vorarbeit abnehmen. Sie prüfen automatisch, ob eine `.env`-Datei existiert. Wenn nicht, wird sie aus der `.env.example` kopiert und an relevanten Stellen mit **sicheren, zufallsgenerierten Passwörtern** (z. B. für die Datenbank) befüllt. Danach werden sofort die Docker-Container gebaut und gestartet.

**Auf Windows:**
```powershell
.\start.ps1
```

**Auf Mac / Linux:**
```bash
bash start.sh
```

### Option B: Manueller Start
Falls du das Skript nicht nutzen möchtest, kannst du das Setup manuell durchführen:

1. Kopiere die Datei `.env.example` und nenne sie `.env`.
   Falls nötig, kannst du in dieser Datei Passwörter, Datenbank-Credentials (`POSTGRES_PASSWORD`) und den `DJANGO_SECRET_KEY` anpassen. Da die Datenbank in Docker lokal läuft, sind Standardwerte für die rein lokale Entwicklung auch völlig in Ordnung.
2. Baue und starte die Container im Hintergrund:
   ```bash
   docker compose up -d --build
   ```

*Für zukünftige Neustarts ohne Neubau reicht in beiden Fällen ein einfaches:* `docker compose up -d`

## 🔐 Erster Start & Admin-Zugang

Beim **allersten** Start des Backends wird die Datenbank automatisch eingerichtet und ein initialer Superuser (Admin) angelegt. 

Aus Sicherheitsgründen ist das Passwort für diesen Admin **nicht** im Code hardcodiert. Stattdessen wird bei der Erstellung ein zufälliges Setup-Passwort generiert.

Um dein Passwort zu erfahren, musst du in die Logs des API-Containers schauen. Führe dazu folgenden Befehl aus:

```bash
docker compose logs api | grep "Generiertes Passwort"
```
*(Hinweis für Windows PowerShell: `docker compose logs api | Select-String "Generiertes Passwort"`)*

In der Ausgabe findest du die Login-Daten:
- **E-Mail:** `admin@adminuser.de`
- **Passwort:** *<Das generierte Passwort aus den Logs>*

> [!WARNING]
> **Wichtig:** Bitte logge dich sofort nach dem ersten Start mit diesen Daten ein und wechsle das Passwort in den Benutzereinstellungen des Dashboards!

## 🛑 Projekt stoppen

Um das Projekt zu stoppen, führe folgenden Befehl aus:

```bash
docker compose down
```

Wenn du auch die gespeicherten Daten (die Datenbank-Volumes) unwiderruflich löschen möchtest, nutze:

```bash
docker compose down -v
```
*(Achtung: Dies löscht alle angelegten Fälle, Benutzer und das generierte initial-Passwort. Beim nächsten Start wird wieder ein frisches Passwort generiert).*
