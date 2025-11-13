# Beratung

| *Attribut*               | *Datentyp* | *Beschreibung*                                                                                  |
| ------------------------ | ---------- | ----------------------------------------------------------------------------------------------- |
| beratungs_id             | int        | Eindeutige ID zur Identifikation einer Beratung                                                 |
| beratungsstelle          | enum       | Zuständige Beratungsstelle (z. B. Fachberatung Leipzig Stadt / Nordsachsen / Landkreis Leipzig) |
| anzahl_beratungen        | int        | Gesamtanzahl der Beratungen                                                                     |
| datum_beratung           | date       | Datum des Beratungstermins                                                                      |
| beratungsart             | enum       | Durchführungsart: persönlich / Video / Telefon / aufsuchend / schriftlich                       |
| beratungsort             | enum       | Durchführungsort: Leipzig Stadt / Leipzig Land / Nordsachsen                                    |
| notizen_beratung         | String     | Freifeld für Notizen                                                                            |

## Methoden
- terminAnlegen()
- terminBearbeiten() --> vermutlich das gleiche wie terminVerschieben()
- notizenHinzufuegen()
- notizenBearbeiten()
- terminSuchen()
- terminLoeschen()
- berater:inZuweisen() --> könnte man noch dazu nehmen, falls wir das auch speichern sollen?
- beratungStatusAendern()
