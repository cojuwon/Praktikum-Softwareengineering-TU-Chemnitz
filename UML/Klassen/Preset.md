# Preset

| *Attribut* | *Datentyp* | *Beschreibung*                                                                              |
| ---------- | ---------- | ------------------------------------------------------------------------------------------- |
| preset_id  | int        | Eindeutige ID der Filtereinstellung                                                         |
| daten      | enum       | Auswahlmöglichkeiten an Daten, die für die statistische Auswertung ausgegeben werden sollen |

# Attribute:

presetID: int

name: string

sichtbarkeit: ? {Persoenlich, Gemeinsame}

# Methoden:

presetSpeichern()

presetLaden()

presetLoeschen()

