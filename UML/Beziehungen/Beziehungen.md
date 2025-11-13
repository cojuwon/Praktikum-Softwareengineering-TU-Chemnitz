# Beziehungen 

Benutzer → Anfrage: 1..* (ein Benutzer kann mehrere Anfragen bearbeiten) assoziation

Benutzer → Fall: 1..* (ein Benutzer kann mehrere Fälle bearbeiten) assoziation

Fall → Klient: 1..1 (jeder Fall gehört genau zu einem Klienten) assoziation

Fall (raute )→ Termin: 1..* (ein Fall kann mehrere Termine haben) Komposition (ein Termin existiert nur im Zusammenhang mit einem Fall.) oder constraint, weil termin nicht in vergangenheit liegen darf?

Fall (ausgefüllte Raute) → Eingabefeld: 0..* (dynamische Formularelemente) Komposition (dynamische Formularelemente gehören zum Fall/Datensatz)

Benutzer (raute) → Preset: 0..* (Benutzer kann mehrere Presets speichern) AGGREGATION (Preset gehört zum Benutzer, könnte aber theoretisch unabhängig existieren?)

Statistik → Fall: 1..* (Statistik wird über Fälle berechnet) DEPENDENCY? statistik verwendet fälle, besitzt sie aber nicht

Gewalttat (raute) → Gewaltfolgen 0..1 (jede Gewalttat kann Gewaltfolgen haben) Komposition (Gewaltfolge existiert nur im Kontext einer Gewalttat) 
