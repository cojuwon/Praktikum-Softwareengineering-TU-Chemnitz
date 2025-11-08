# Beratung

| *Attribut*      | *Datentyp* | *Beschreibung*                                                                                  |
| --------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| beratungs_id    | int        | Eindeutige ID zur Identifikation einer Beratung                                                 |
| beratungsstelle | enum       | Zuständige Beratungsstelle (z. B. Fachberatung Leipzig Stadt / Nordsachsen / Landkreis Leipzig) |
| anzahl          | int        | Gesamtanzahl der Beratungen                                                                     |
| datum           | date       | Datum des Beratungstermins                                                                      |
| art             | enum       | Durchführungsart: persönlich / Video / Telefon / aufsuchend / schriftlich                       |
| ort             | enum       | Durchführungsort: Leipzig Stadt / Leipzig Land / Nordsachsen                                    |
| notizen         | String     | Freifeld für Notizen                                                                            |

## Methoden
- terminAnlegen()
- terminBearbeiten()
- notizenHinzufuegen()
- terminSuchen()
