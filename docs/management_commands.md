# Django Management Commands Dokumentation

Dieses Dokument beschreibt die benutzerdefinierten Management-Commands, die für die Initialisierung und Wartung der Anwendung verwendet werden.

Alle Befehle können via `python manage.py <command_name>` ausgeführt werden (lokal oder im Docker-Container).

## Übersicht

| Command | Beschreibung |
|---------|--------------|
| `init_project` | **Haupt-Setup-Skript**: Führt alle anderen Initialisierungsschritte nacheinander aus. |
| `setup_groups` | Erstellt Nutzergruppen (Basis, Erweiterung, Admin) und weist Berechtigungen (Permissions) zu. |
| `init_eingabefelder` | Initialisiert die dynamischen Formularfelder für "Anfrage" und "Fall" in der Datenbank. |
| `init_statistics` | Erstellt Standard-Statistik-Presets (z.B. "Anfragen nach Herkunft"). |
| `setup_superuser` | Erstellt einen initialen Admin-Account (`admin@test.de`), falls dieser noch nicht existiert. |

---

## Detaillierte Beschreibung

### 1. `init_project`

Dies ist der zentrale Einstiegspunkt für die System-Initialisierung. Es ist ein Wrapper-Skript, das sicherstellt, dass alle Komponenten in der korrekten Reihenfolge eingerichtet werden.

**Verwendung:**
```bash
python manage.py init_project
```

**Was passiert:**
1. Ruft `setup_groups` auf.
2. Ruft `init_eingabefelder` auf.
3. Ruft `init_statistics` auf.
4. Ruft `setup_superuser` auf.

---

### 2. `setup_groups`

Richtet das Berechtigungssystem (ACL) der Anwendung ein.

**Verwendung:**
```bash
python manage.py setup_groups
```

**Funktionalität:**
- Erstellt die Django-Gruppen: `Basis`, `Erweiterung`, `Admin`.
- Weist Standard-CRUD-Berechtigungen (Create, Read, Update, Delete) für alle wichtigen Models (`Konto`, `Fall`, `KlientIn`, etc.) zu.
- Setzt spezielle Berechtigungen wie `can_export_statistik` oder `can_manage_users`.
- **Idempotent:** Kann mehrfach ausgeführt werden, um Berechtigungen zu aktualisieren/reparieren. Setzt Permissions zurück auf den definierten Soll-Zustand.

---

### 3. `init_eingabefelder`

Konfiguriert die dynamischen Eingabefelder für die Erfassungsbögen.

**Verwendung:**
```bash
python manage.py init_eingabefelder
```

**Funktionalität:**
- Liest die Anforderungen aus `statistik_bogen.md` (implizit im Code hinterlegt).
- Erstellt oder aktualisiert Einträge in der Tabelle `Eingabefeld`.
- Definiert Felder für die Kontexte `Anfrage` und `Fall`.
- Legt Datentypen, Labels, Pflichtfeld-Status und Auswahloptionen (für Dropdowns) fest.

---

### 4. `init_statistics`

Lädt vordefinierte Statistik-Auswertungen in das System.

**Verwendung:**
```bash
python manage.py init_statistics
```

**Funktionalität:**
- Erstellt `Preset`-Objekte für häufig benötigte Auswertungen.
- Beispiele: "Anfragen nach Herkunft", "Anfragen nach Art", "Anfragen nach Person".
- Diese Presets stehen dann im Statistik-Dashboard zur Verfügung.

---

### 5. `setup_superuser`

Hilfsskript zum schnellen Erstellen eines Administrators für Entwicklungs- oder Erst-Deployment-Zwecke.

**Verwendung:**
```bash
python manage.py setup_superuser
```

**Funktionalität:**
- Prüft, ob ein User mit der E-Mail `admin@test.de` existiert.
- Falls nicht: Erstellt den User mit Passwort `admin123`.
- Weist dem User automatisch die Gruppe `Admin` zu (setzt voraus, dass `setup_groups` bereits lief).
