# Statistik API Dokumentation

Diese Dokumentation beschreibt die neuen dynamischen Endpunkte der Statistik-API. Das Backend dient als "Single Source of Truth" für verfügbare Felder, Filter und Metriken.

## Überblick

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| `GET` | `/api/statistik/metadata/` | Liefert Metadaten (Felder, Typen, Choices) aller analysierbaren Models. |
| `POST` | `/api/statistik/dynamic-query/` | Führt eine dynamische Aggregation durch (Count, Sum). |
| `GET` | `/api/statistik/presets/` | Liefert gespeicherte Presets (inkl. Standard-Presets). |

---

## 1. Metadata Endpoint

Liefert Informationen darüber, welche Felder gefiltert und gruppiert werden können.

**Request:**
`GET /api/statistik/metadata/`

**Response (Beispiel):**

```json
{
  "Anfrage": {
    "model_name": "Anfrage",
    "verbose_name": "Anfrage",
    "verbose_name_plural": "Anfragen",
    "filterable_fields": [
      {"name": "anfrage_datum", "label": "Datum der Anfrage", "type": "date"},
      {"name": "anfrage_ort", "label": "Anfrage Ort", "type": "select", "choices": [{"value": "LS", "label": "Leipzig Stadt"}, ...]}
    ],
    "groupable_fields": [
      {"name": "anfrage_ort", "label": "Anfrage Ort", "type": "select", "choices": [...]},
      {"name": "anfrage_art", "label": "Anfrage Art", "type": "select", "choices": [...]}
    ],
    "metrics": [
      {"name": "count", "label": "Anzahl"}
    ]
  },
  "Beratungstermin": {
    "model_name": "Beratungstermin",
    "metrics": [
      {"name": "count", "label": "Anzahl"},
      {"name": "sum_dauer", "label": "Summe Dauer (Minuten)"}
    ],
    ...
  }
}
```

### Verwendung im Frontend
1. **Model-Auswahl:** Zeige Dropdown mit Keys aus Metadata (z.B. "Anfrage", "Fall").
2. **Dimensionen:** Wenn Model gewählt (z.B. "Anfrage"), fülle "Gruppieren nach" Dropdown mit `groupable_fields`.
3. **Filter:** Generiere Filter-UI basierend auf `filterable_fields`.
   - `type: "date"` → Datepicker
   - `type: "select"` → Dropdown mit `choices`
4. **Metriken:** Zeige Verfügbare `metrics` an (meist "Anzahl", manchmal "Summe ...").

---

## 2. Dynamic Query Endpoint

Führt die eigentliche Berechnung durch.

**Request:**
`POST /api/statistik/dynamic-query/`

**Body:**

```json
{
  "base_model": "Anfrage",           // Muss ein Key aus Metadata sein
  "group_by": "anfrage_art",         // Muss in groupable_fields sein
  "metric": "count",                 // "count" oder "sum"
  "filters": {                       // Optional: Django-Lookup Syntax
    "anfrage_datum__gte": "2024-01-01",
    "anfrage_datum__lte": "2024-12-31",
    "anfrage_ort": "LS"
  }
}
```

**Filter-Syntax:**
- `feld__gte`: Größer/Gleich (für Datum/Zahlen)
- `feld__lte`: Kleiner/Gleich
- `feld`: Exakter Match
- `feld__in`: Einer aus Liste (z.B. `[1, 2]`)

**Response (Beispiel):**

```json
{
  "base_model": "Anfrage",
  "group_by": "anfrage_art",
  "metric": "count",
  "results": [
    {
      "anfrage_art": "B",
      "value": 42,
      "label": "Beratungsbedarf"      // Automatisch aufgelöstes Label aus Choices
    },
    {
      "anfrage_art": "MS",
      "value": 15,
      "label": "medizinische Soforthilfe"
    },
    {
      "anfrage_art": null,
      "value": 3,
      "label": "Unbekannt"
    }
  ]
}
```

---

## 3. Presets

Presets sind gespeicherte Abfrage-Konfigurationen.

**Datenstruktur `preset_daten`:**
Das `preset_daten` Feld im Preset-Objekt entspricht exakt dem Body für `dynamic-query`.

```json
{
  "preset_beschreibung": "Anfragen nach Art (2024)",
  "preset_daten": {
    "base_model": "Anfrage",
    "group_by": "anfrage_art",
    "metric": "count",
    "filters": {} 
  }
}
```

### Standard-Presets
Das Backend wird mit folgenden Standard-Presets initialisiert:
- Anfragen nach Herkunft / Person / Art
- Klient:innen Altersstruktur / Geschlecht / Wohnort
- Beratungstermine nach Art / Stelle
- Begleitungen nach Art
- Gewalttaten nach Tatort / Anzeige

---

## Berechtigungen

| Permission | Beschreibung |
|------------|--------------|
| `api.can_view_statistics` | Erforderlich für `metadata` und `dynamic-query`. |
| `api.can_manage_presets` | Erforderlich zum Erstellen/Bearbeiten von Presets. |
| `api.can_share_preset` | Erlaubt das Teilen von Presets mit anderen Usern. |

Normalerweise haben alle Mitarbeiter mit Rolle "Erweiterung" oder "Admin" diese Rechte.
