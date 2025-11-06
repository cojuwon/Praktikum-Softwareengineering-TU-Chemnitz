# Beziehungen 

Benutzer → Anfrage: 1..* (ein Benutzer kann mehrere Anfragen bearbeiten)

Benutzer → Fall: 1..* (ein Benutzer kann mehrere Fälle bearbeiten)

Fall → Klient: 1..1 (jeder Fall gehört genau zu einem Klienten)

Fall → Termin: 1..* (ein Fall kann mehrere Termine haben)

Fall → Eingabefeld: 0..* (dynamische Formularelemente)

Benutzer → Preset: 0..* (Benutzer kann mehrere Presets speichern)

Statistik → Fall: 1..* (Statistik wird über Fälle berechnet)

