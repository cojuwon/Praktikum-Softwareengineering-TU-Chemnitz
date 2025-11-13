# Klasse: Konto

| *Attribut*    | *Datentyp*   | *Beschreibung*                                    |
| ------------- | ------------ | ------------------------------------------------- |
| user_id       | int          | Eindeutige ID des Benutzerkontos                  |
| vorname_mb    | String       | Vorname der Mitarbeiter:in                        |
| nachname_mb   | String       | Nachname der Mitarbeiter:in                       |
| mail_mb       | String       | E-Mail-Adresse der Mitarbeiter:in                 |
| position_mb   | enum         | Zugriffsberechtigung: Basis / Erweiterung / Admin |
| preset_ids    | int[]        | Zugeordnete Filtereinstellungen                   |
| anfragen_ids  | int[]        | Anfragen, die von diesem Konto bearbeitet wurden  |
| fall_ids      | int[]        | Fälle, die von diesem Konto bearbeitet wurden     |

# Methoden:

- kontoErstellen()
- kontoBearbeiten()
- kontoLoeschen()
- positionPruefen() --> bzw. berechtigungPruefen()
- anmelden()
- abmelden()
- passwortAendern()
- statistikenAnzeigen() --> Statisitken eher auslagern? Ist ja nicht von Mitarbeiter:in abhängig,oder?
- presetSpeichern()
- presetLaden()
- presetLoeschen()
- verknuepfungMitAnfrage()
- verknuepfungMitFall()
