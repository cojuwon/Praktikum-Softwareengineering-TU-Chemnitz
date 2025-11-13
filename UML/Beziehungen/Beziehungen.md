# Beziehungen 



Benutzer → Anfrage
1..*
Assoziation

Ein Benutzer kann mehrere Anfragen bearbeiten, aber Anfragen können theoretisch auch ohne festen Benutzer existieren (z. B. wenn anonym).

Benutzer → Fall
1..*
Assoziation
Benutzer (Beraterin) bearbeitet mehrere Fälle, aber der Fall ist nicht Besitz des Benutzers.

Fall → Klient
1..1
Assoziation
Jeder Fall gehört genau zu einem Klienten. Beide existieren unabhängig voneinander.

Fall → Termin
1..*
Komposition (ausgefüllte Raute)
Ein Termin existiert nur im Kontext eines Falls. Wenn der Fall gelöscht wird, verschwinden auch seine Termine. → Constraint: TerminDatum ≥ aktuellesDatum (Termin darf nicht in der Vergangenheit liegen).

Fall → Eingabefeld
0..*
Komposition (ausgefüllte Raute)
Dynamische Formularelemente gehören logisch zum Fall und werden mit diesem gespeichert/gelöscht.

Benutzer → Preset
0..*
Aggregation (leere Raute)
Presets sind mit Benutzer verknüpft, können aber unabhängig (z. B. geteilt oder systemweit) existieren.

Statistik → Fall
1..*
Dependency
Statistik greift auf Falldaten zu, besitzt sie aber nicht. Sie hängt funktional von Fällen ab.

Gewalttat → Gewaltfolge
0..*
Komposition (ausgefüllte Raute)
Eine Gewaltfolge existiert nur im Zusammenhang mit einer Gewalttat. Wird die Gewalttat gelöscht, entfällt auch die Folge.
