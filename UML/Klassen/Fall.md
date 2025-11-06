# Fall

| *Attribut*     | *Datentyp* | *Beschreibung*                                            |
| -------------- | ---------- | --------------------------------------------------------- |
| fall_id        | int        | Automatisch generierte ID zur Identifizierung eines Falls |
| client_id      | int        | Zugeordnete Klient:in                                     |
| beratungs_id   | int        | Zugeordnete Beratungen                                    |
| tat_id         | int        | Zugehörige Gewalttaten                                    |
| begleitungs_id | int        | Zugeordnete Begleitungen                                  |
| user_id        | int        | Zuständige Mitarbeiter:in                                 |

# Attribute:

fallID: int

klientID: int 

Name: String 

beratungsTermine: date

statistikDaten: ?

# Methoden:

fallSpeichern()

fallBearbeiten()

datenAktualisieren()

