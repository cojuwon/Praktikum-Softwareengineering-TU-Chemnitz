# Klasse: Konto

| *Attribut* | *Datentyp* | *Beschreibung*                                    |
| ---------- | ---------- | ------------------------------------------------- |
| user_id    | int        | Eindeutige ID des Benutzerkontos                  |
| vorname    | String     | Vorname der Mitarbeiter:in                        |
| nachname   | String     | Nachname der Mitarbeiter:in                       |
| mail       | String     | E-Mail-Adresse der Mitarbeiter:in                 |
| position   | enum       | Zugriffsberechtigung: Basis / Erweiterung / Admin |
| preset_id  | int        | Zugeordnete Filtereinstellungen                   |
| anfrage_id | int        | Anfragen, die von diesem Konto bearbeitet wurden  |
| fall_id    | int        | Fälle, die von diesem Konto bearbeitet wurden     |

# Methoden:

-anmelden()

-passwortAendern()

-statistikenAnzeigen()

-presetSpeichern()

-presetLaden()



