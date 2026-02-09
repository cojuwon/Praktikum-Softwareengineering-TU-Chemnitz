# Setup Eingabefelder (Formular-Konfiguration)

Dieses Dokument beschreibt die Initialisierung der Eingabefelder für die Erfassungsformulare (Anfrage und Fall).

## Hintergrund

Die Anwendung nutzt dynamische Formular-Konfigurationen, die in der Datenbanktabelle `api_eingabefeld` gespeichert sind. Diese Konfiguration steuert, welche Felder im Frontend angezeigt werden, welche Optionen verfügbar sind (bei Dropdowns) und welche Validierungen greifen (z.B. Pflichtfeld).

## Initialisierung ausführen

Um die Standard-Felder basierend auf den Anforderungen (`statistik_bogen.md`) anzulegen oder zu aktualisieren, führen Sie folgenden Befehl im Backend-Container aus:

```bash
python manage.py init_eingabefelder
```

### Verwendung mit Docker

Wenn die Anwendung in Docker läuft:

```bash
docker compose exec api python manage.py init_eingabefelder
```

## Enthaltene Felder

Der Befehl initialisiert folgende Felder:

### Kontext: Anfrage

| Name (Technisch) | Label | Typ | Optionen |
| :--- | :--- | :--- | :--- |
| `anfrage_weg` | Eingangsweg | text | - |
| `anfrage_datum` | Datum der Anfrage | date | - |
| `anfrage_ort` | Anfrage aus | select | Leipzig Stadt, Leipzig Land, Nordsachsen, ... |
| `anfrage_person` | Wer hat angefragt | select | Fachkraft, Angehörige:r, Betroffene:r, ... |
| `anfrage_art` | Art der Anfrage | select | Medizinische Soforthilfe, Spurensicherung, ... |

### Kontext: Fall

| Name (Technisch) | Label | Typ | Optionen |
| :--- | :--- | :--- | :--- |
| `status` | Status | select | Offen, Laufend, Abgeschlossen, Gelöscht |
| `startdatum` | Startdatum | date | - |
| `notizen` | Notizen | textarea | - |

> **Hinweis:** Bestehende konfigurierte Felder werden aktualisiert, aber **nicht gelöscht**. Wenn Sie Felder entfernen möchten, müssen Sie diese manuell über den Django Admin oder die Shell löschen.
