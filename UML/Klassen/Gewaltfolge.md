# Gewaltfolge

| *Attribut*            | *Datentyp* | *Beschreibung*  |
| --------------------- | ---------- | -------------------------------- |           
| psychische_folgen     | enum       | Depression / Angststörung / PTBS / Burn-out / Schlafstörungen / Sucht /                                                                 Kommunikationsschwierigkeiten / Vernachlässigung alltäglicher Dinge / keine / andere |
| körperliche_folgen    | enum       | Schmerzen / Lähmungen / Krankheit / keine / andere          |
| beeinträchtigungen    | String     | Freifeld für dauerhafte körperliche Beeinträchtigungen                     |
| finanzielle_folgen    | enum       | Ja / Nein – ggf. Freitextfeld               |
| arbeitseinschränkung  | enum       | Ja / Nein – ggf. Freitextfeld         |
| verlust_arbeitsstelle | enum       | Ja / Nein – ggf. Freitextfeld         |
| soziale_isolation     | enum       | Ja / Nein – ggf. Freitextfeld               |
| suizidalität          | enum       | Ja / Nein – ggf. Freitextfeld              |
| weiteres              | String     | Freifeld für zusätzliche Informationen      |
| keine_angabe          | enum       | Falls zuvor kein Feld ausgefüllt wurde                  |
| folgen_notizen        | String     | Freifeld für Notizen           |

## Methoden
gewaltfolgeAnlegen()

gewaltfolgeBearbeiten()

gewaltfolgeSuchen()

gewaltfolgeLoeschen()

notizAnlegen()

notizBearbeiten()

notizLoeschen()
