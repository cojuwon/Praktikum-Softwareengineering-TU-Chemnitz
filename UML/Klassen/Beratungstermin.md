# Beratungstermin

| *Attribut*               | *Datentyp* | *Beschreibung*                                                                                  |
| ------------------------ | ---------- | ----------------------------------------------------------------------------------------------- |
| beratungs_id             | int        | Eindeutige ID zur Identifikation einer Beratung                                                 |
| beratungsstelle          | enum       | Zuständige Beratungsstelle (z. B. Fachberatung Leipzig Stadt / Nordsachsen / Landkreis Leipzig) |
| anzahl_beratungen        | int        | Gesamtanzahl der Beratungen                                                                     |
| termin_beratung           | date       | Datum des Beratungstermins                                                                      |
| beratungsart             | enum       | Durchführungsart: persönlich / Video / Telefon / aufsuchend / schriftlich                       |
| notizen_beratung         | String     | Freifeld für Notizen                                                                            |
| berater_id               | int        | ID der zugewiesenen Berater:in (konto_id)

## Methoden
terminAnlegen()

terminBearbeiten()

terminSuchen()

terminLoeschen()

notizenHinzufuegen()

notizenBearbeiten()

beraterZuweisen() 
