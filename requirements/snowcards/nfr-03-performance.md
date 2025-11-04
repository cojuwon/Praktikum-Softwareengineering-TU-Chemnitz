# Requirement #: NFR-03

# Requirement Type: Non-functional

# Event/BUC/PUC #:
- Nutzung des Systems durch Mitarbeiter:innen während der Dateneingabe, Bearbeitung und statistischen Auswertung

# Description:
- das System reagiert ohne wahrnehmbare Verzögerung (< 1 Sekunde beim Öffnen von Dropdowns, < 3 Sekunden beim Laden von Filterergebnissen)
- mehrere Nutzer:innen können gleichzeitig ohne Performanceeinbußen arbeiten
- System (ohne Datenbank und externe Abhängigkeiten) benötigt weniger als 500 MB Speicherplatz
- jährlicher Speicherzuwachs durch Nutzungsdaten liegt unter 50 MB
- Gesamtsystem (inkl. aller Anwendungsdaten, Logs und Konfigurationen) bleibt unter 1 GB bei einer Betriebsdauer von 10 Jahren.

# Rationale:
- Lange Verzögerungen behindern die Arbeit und verschlechtern die Nutzererfahrung
- effiziente Performance spart Zeit und reduziert Frustration bei wiederholter Nutzung
  
# Originator:
- Mitarbeiter:innen des Bellis e.V.

# Fit Criterion:
- öffnen von Dropdowns erfolgt in < 1 Sekunde
- laden von Filterergebnissen erfolgt in < 3 Sekunden
- Speicherverbrauch bleibt innerhalb der angegebenen Grenzen

# Customer Satisfaction:
- 5

# Customer Dissatisfaction:
- 4

# Priority:
- hoch

# Conflicts:
- keine bekannten Konflikte

# Supporting Materials:
- Projektbeschreibung

# History:
- erstellt: 03.11., bearbeitet: 04.10., letzte:r Bearbeiter:in: Pia
