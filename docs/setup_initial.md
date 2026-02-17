# Initialer Setup Plan

Dieses Dokument beschreibt die Schritte für die initiale Einrichtung des Systems für Entwicklung und Deployment.

## Übersicht der Initialisierungs-Skripte

Wir haben ein zentrales Setup-Skript erstellt, das alle notwendigen Schritte automatisiert.

### Setup-Skript: `init_project.py`

Dieses Management-Command (`python manage.py init_project`) orchestriert die folgenden Teilschritte:

1.  **Gruppen und Berechtigungen** (`setup_groups`)
    -   Erstellt die Nutzergruppen: "Basis", "Erweiterung", "Admin"
    -   Weist Standard-Berechtigungen zu (CRUD für Models)
    -   Konfiguriert spezielle Berechtigungen wie `can_view_statistics` etc.

2.  **Eingabefelder** (`init_eingabefelder`)
    -   Initialisiert dynamische Formularfelder für "Anfrage" und "Fall"
    -   Basiert auf den Anforderungen in `anforderungen/statistik_bogen.md`

3.  **Statistik-Presets** (`init_statistics`)
    -   Legt Standard-Auswertungen an (z.B. "Anfragen nach Herkunft")

4.  **Superuser** (`setup_superuser`)
    -   Erstellt einen initialen Admin-Account (`admin@test.de` / `admin123`) falls dieser noch nicht existiert
    -   **Neu:** Weist diesem User automatisch die Gruppe "Admin" zu, sodass keine manuellen Schritte im Django-Admin mehr nötig sind.

## Durchführung der Einrichtung

### Via Docker (Empfohlen)

```bash
docker compose exec api python manage.py init_project
```

### Lokal (ohne Docker)

Stellen Sie sicher, dass Ihre virtuelle Umgebung aktiviert ist und Sie sich im `backend`-Verzeichnis befinden.

```bash
python manage.py init_project
```

## Weitere Hinweise

-   Die Initialisierungs-Skripte sind **idempotent**, d.h. sie können mehrfach ausgeführt werden, ohne Daten zu duplizieren oder den Zustand zu zerstören (vorhandene Datensätze werden geprüft).
-   Für Details zu den Eingabefeldern siehe [setup_eingabefelder.md](./setup_eingabefelder.md).

---
