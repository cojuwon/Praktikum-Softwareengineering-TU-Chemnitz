# Beziehungen 

Konto → Anfrage
1..*
Assoziation
Ein Benutzer kann mehrere Anfragen bearbeiten, aber Anfragen können theoretisch auch ohne festen Benutzer existieren (z. B. wenn anonym).

Konto → Fall
1..*
Assoziation
Benutzer (Beraterin) bearbeitet mehrere Fälle, aber der Fall ist nicht Besitz des Benutzers.

 Klient-> Begleitung
 1..*
 Komposition 
 Begleitung nur da, wenn Klient existiert 

 
Fall → Klient
1..1
Assoziation
Jeder Fall gehört genau zu einem Klienten. Beide existieren unabhängig voneinander.

Klient → Beratung
1..*
Komposition (ausgefüllte Raute)
Ein Termin existiert nur im Kontext eines Falls. Wenn der Fall gelöscht wird, verschwinden auch seine Termine. 

Konto → Preset
0..* (konto muss kein preset haben)
Aggregation (leere Raute)
Presets sind mit Benutzer verknüpft, können aber unabhängig (z. B. geteilt oder systemweit) existieren.

Statistik → Fall
Statistik → Preset
Statistik → Beratung
Statistik → Gewaltfolge
Statistik → Gewalttat
1..*
Dependency
Statistik greift auf Falldaten zu, besitzt sie aber nicht. Sie hängt funktional von Fällen ab.

Klient → Gewalttat
0/1..*
Komposition

Gewalttat → Gewaltfolge
1..1
Komposition (ausgefüllte Raute)
Eine Gewaltfolge existiert nur im Zusammenhang mit einer Gewalttat. Wird die Gewalttat gelöscht, entfällt auch die Folge.
