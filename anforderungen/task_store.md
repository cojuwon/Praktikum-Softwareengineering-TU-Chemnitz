# Statistik-API Refactoring - Aufgabenstellung & Implementierungsplan

## Originale Aufgabenstellung

**Rolle:** Senior Django Backend Developer  
**Projekt:** Django REST Backend für eine Next.js Frontend Applikation (Verwaltungssystem für eine Beratungsstelle gegen sexualisierte Gewalt)

**Kontext:** Refactoring des Statistik-Moduls im Backend. Der aktuelle Code enthält hardcodierte Aggregationen. Ziel: Backend als "Single Source of Truth". Frontend soll vom Backend erfahren, welche Daten analysierbar sind.

### Anforderungen

1. **Metadaten-Endpunkt** (`/api/statistik/metadata/`)
   - Models: `Anfrage`, `Fall`, `KlientIn`, `Beratungstermin`, `Begleitung`, `Gewalttat`, `Gewaltfolge`
   - Liefert filterbare Felder, gruppierbare Dimensionen, Metriken
   - Nutzt `verbose_name` und `choices` aus Django Models

2. **Generischer Query-Endpoint** (`POST /api/statistik/query/`)
   - Akzeptiert: `{base_model, filters, group_by, metric}`
   - Dynamisches QuerySet mit `.filter()`, `.values()`, `.annotate()`
   - Whitelist-Validierung gegen Metadaten

3. **Preset-Erweiterung**
   - Presets speichern Query-Konfiguration als JSON
   - Frontend sendet gespeicherte Konfiguration

4. **Management Command** (`init_statistics.py`)
   - Standard-Presets aus Anforderungsdokumenten

5. **Permissions**
   - `can_view_statistics`, `can_manage_presets`

6. **Testing**
   - `test_statistik_dynamic.py`

---

## Standard-Presets (aus Anforderungsdokumenten)

### Anfragen
| Preset | Model | group_by | Beschreibung |
|--------|-------|----------|--------------|
| Anfragen nach Herkunft | Anfrage | anfrage_ort | Leipzig Stadt/Land/Nordsachsen/Sachsen/Andere |
| Anfragen nach Person | Anfrage | anfrage_person | Fachkraft/Angehörige/Betroffene/queer etc. |
| Anfragen nach Art | Anfrage | anfrage_art | Med. Soforthilfe/Spurensicherung/Beratung etc. |
| Wartezeit (Durchschnitt) | Beratungstermin | - | Differenz Anfrage-Datum zu Termin-Datum |

### Klient:innen
| Preset | Model | group_by | Beschreibung |
|--------|-------|----------|--------------|
| Altersstruktur | KlientIn | klient_alter | Altersgruppen |
| Geschlechtsidentität | KlientIn | klient_geschlechtsidentitaet | Verteilung |
| Wohnort | KlientIn | klient_wohnort | Nach Standort |
| Migrationshintergrund | KlientIn | klient_migrationshintergrund | J/N/KA |
| Behinderung | KlientIn | klient_schwerbehinderung | J/N/KA |

### Begleitungen/Verweisungen
| Preset | Model | group_by | Beschreibung |
|--------|-------|----------|--------------|
| Begleitungen nach Art | Begleitung | begleitungsart | Gericht/Polizei/Arzt etc. |
| Anzahl Begleitungen | Begleitung | - | Gesamtzahl |

### Netzwerk (für Geldgeber)
| Preset | Model | group_by | Beschreibung |
|--------|-------|----------|--------------|
| Zugang über | Fall/Anfrage | kontakt_quelle | Polizei/Beratungsstellen/Internet/Ämter etc. |

---

## Implementierungsplan

### Phase 1: Service-Layer

**[MODIFY] statistik_service.py**
- `ModelMetadataExtractor` Klasse für dynamische Feld-Extraktion
- `get_metadata()` → JSON mit allen Models und Feldern
- `execute_query(base_model, filters, group_by, metric)` → Aggregierte Daten
- Whitelist-Validierung

### Phase 2: Views

**[MODIFY] statistik.py (views)**
- `@action metadata` (GET) → `StatistikService.get_metadata()`
- `@action query` (POST) → Neues Format, ruft `execute_query()`
- Permission-Prüfung

**[NEW] statistik_query.py (serializers)**
```python
class DynamicQuerySerializer(serializers.Serializer):
    base_model = serializers.ChoiceField(choices=[...])
    filters = serializers.DictField(required=False)
    group_by = serializers.CharField(required=True)
    metric = serializers.ChoiceField(choices=['count', 'sum'])
```

### Phase 3: Presets & Permissions

**[MODIFY] models.py**
- Neue Permission: `can_view_statistics`
- Neue Permission: `can_manage_presets`

**[MODIFY] preset.py (serializer)**
- Validierung von `preset_daten` gegen `DynamicQuerySerializer`

### Phase 4: Management Command

**[NEW] init_statistics.py**
- Erstellt ~15 Standard-Presets basierend auf Anforderungsdokumenten

### Phase 5: Tests

**[NEW] test_statistik_dynamic.py**
- Metadaten-Struktur testen
- Query mit verschiedenen Filtern/Gruppierungen
- Permission-Enforcement
- Whitelist-Validierung (invalid fields)

### Phase 6: Dokumentation

**[NEW] statistik_dokumentation.md**
- Dokumentation der Statistik-API
- Endpunkte und Parameter
- Beispiel-Requests
- Antwort-Struktur
- Soll vollständig sein, sodass die Frontend-Entwickler direkt loslegen können.

---

## Verifikation

```bash
# Tests ausführen
python manage.py test api.tests.test_statistik_dynamic -v 2

# Management Command
python manage.py init_statistics

# Manuell testen
curl -X GET http://localhost:8000/api/statistik/metadata/
curl -X POST http://localhost:8000/api/statistik/dynamic-query/ -d '{"base_model":"Anfrage","group_by":"anfrage_art","metric":"count"}'
```

