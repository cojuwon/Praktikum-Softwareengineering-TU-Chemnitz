# Gewalttat

| *Attribut*              | *Datentyp* | *Beschreibung*     |
| ----------------------- | ---------- | ---------------------- |
| tat_id                  | int        | Eindeutige ID der Gewalttat       |
| alter                   | enum       | Alter zum Tatzeitpunkt oder keine Angabe                     |
| zeitraum                | enum       | Angabe eines Zeitraums oder keine Angabe     |
| anzahl_vorfälle         | enum       | einmalig / mehrere / genaue Zahl / keine Angabe                |
| anzahl_täter_innen      | enum       | 1 / mehrere / genaue Zahl / keine Angabe        |
| art                     | enum       | Art der Gewalt (Mehrfachauswahl möglich, z. B. sexuelle Belästigung, Vergewaltigung, Spiking,                                             digitale Gewalt etc.)       |
| tatort                  | enum       | Leipzig / Leipzig Land / Nordsachsen / Sachsen / Deutschland / Ausland / auf der Flucht / im                                             Herkunftsland / keine Angabe |
| anzeige                 | enum       | Ja / Nein / noch nicht entschieden / keine Angabe             |
| medizinische_versorgung | enum       | Ja / Nein / keine Angabe          |
| spurensicherung         | enum       | Vertrauliche Spurensicherung: Ja / Nein / keine Angabe        |
| mitbetroffene_kinder    | int        | Zahl der mitbetroffenen Kinder                            |
| direktbetroffene_kinder | int        | Zahl der direkt betroffenen Kinder unter den mitbetroffenen     |
| notizen                 | String     | Freifeld für Notizen           |

## Methoden
- gewalttatErfassen()
- gewalttatBearbeiten()
- gewalttatSuchen()
- gewalttatAnzeigen()
