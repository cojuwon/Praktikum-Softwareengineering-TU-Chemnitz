# Preset

| *Attribut*          | *Datentyp*             | *Beschreibung*                                                                              |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| preset_id           | int                    | Eindeutige ID der Filtereinstellung                                                         |
| preset_daten        | enum                   | Auswahlmöglichkeiten an Daten, die für die statistische Auswertung ausgegeben werden sollen | --> das sollten wir noch spezifizieren
| preset_beschreibung | String                 | eigene Beschreibung der anlegenden Person, was gefiltert wird                               |
| berechtigte_ids     | int[]                  | Wer darf ein preset bearbeiten/löschen                                                      |
| preset_ersteller_in | int                    | id der Person, die preset erstellt hat                                                      |
| filterKriterien     | enum[]                 | wonach gefiltert werden soll, z. B. „Ort=Leipzig“, „Zeitraum=2025“                          |

# Methoden:
presetAnlegen()

presetBearbeiten()

presetLoeschen()

beschreibungAnlegen()

beschreibungBearbeiten()

beschreibungLoeschen()
