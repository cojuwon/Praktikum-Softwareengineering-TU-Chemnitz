# Statistik-API Refactoring - Fortschritt

**Letztes Update:** 2026-02-09 20:42

## Status: 🟡 In Planung

### Übersicht

| Phase | Status | Beschreibung |
|-------|--------|--------------|
| 1. Service-Layer | ⬜ Ausstehend | `ModelMetadataExtractor`, `get_metadata()`, `execute_query()` |
| 2. Views | ⬜ Ausstehend | `metadata` Action, neuer `query` Endpoint |
| 3. Presets & Permissions | ⬜ Ausstehend | Neue Permissions, Preset-Validierung |
| 4. Management Command | ⬜ Ausstehend | `init_statistics.py` mit Standard-Presets |
| 5. Tests | ⬜ Ausstehend | `test_statistik_dynamic.py` |

---

## Detaillierter Fortschritt

### ✅ Abgeschlossen

- [x] Bestehenden Code analysiert (`statistik.py`, `statistik_service.py`)
- [x] Models und Choices verstanden
- [x] Permissions-Dokumentation gelesen
- [x] Anforderungsdokumente analysiert
- [x] Standard-Presets identifiziert
- [x] Implementierungsplan erstellt

### 🔄 In Bearbeitung

- [ ] Plan vom User bestätigen lassen

### ⬜ Ausstehend

#### Phase 1: Service-Layer
- [ ] `ModelMetadataExtractor` implementieren
- [ ] `get_metadata()` implementieren
- [ ] `execute_query()` implementieren
- [ ] Whitelist-Validierung

#### Phase 2: Views
- [ ] `DynamicQuerySerializer` erstellen
- [ ] `metadata` Action hinzufügen
- [ ] `query` Action refaktorieren

#### Phase 3: Presets & Permissions
- [ ] Permissions in `models.py` hinzufügen
- [ ] Migration erstellen
- [ ] `setup_groups.py` aktualisieren
- [ ] Preset-Serializer mit Validierung

#### Phase 4: Management Command
- [ ] `init_statistics.py` erstellen
- [ ] Standard-Presets definieren
- [ ] Idempotentes Update implementieren

#### Phase 5: Tests
- [ ] Test-Setup
- [ ] Metadaten-Tests
- [ ] Query-Tests
- [ ] Permission-Tests

---

## Changelog

| Datum | Phase | Änderung |
|-------|-------|----------|
| 2026-02-09 | Planung | Initiale Analyse und Implementierungsplan erstellt |
