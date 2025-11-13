# Klient_in

| *Attribut*                  | *Datentyp* | *Beschreibung*  |
| --------------------------- | ---------- | ------------ |
| client_id                   | int        | Automatisch generierte numerische ID     |
| client_rolle                | enum       | Rolle der ratsuchenden Person: Betroffene:r / Angehörige:r / Fachkraft       |
| client_alter                | int        | Alter in Jahren oder keine Angabe   |
| client_geschlechtsidentität | enum       | cis weiblich / cis männlich / trans weiblich / trans männlich / trans nicht-binär / inter /                                             agender / divers / keine Angabe               |
| client_sexualität           | enum       | lesbisch / schwul / bisexuell / asexuell / heterosexuell / keine Angabe     |
| client_wohnort              | enum       | Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / Deutschland / andere / keine Angabe –                                             Freitextfeld bei „Deutschland“ oder „andere“ |
| client_staatsangehörigkeit  | enum       | deutsch / nicht deutsch – falls „nicht deutsch“, Textfeld oder Auswahl des Landes   |
| client_beruf                | String     | arbeitslos / studierend / berufstätig / berentet / Azubi / berufsunfähig / keine Angabe   |
| client_schwerbehinderung    | enum       | Liegt eine Schwerbehinderung vor? Ja / Nein – bei Ja: Form (kognitiv/körperlich) und Grad der                                            Behinderung                                 |
| client_kontaktpunkt         | enum       | Quelle, woher die Person von der Beratungsstelle erfahren hat (z. B. Polizei, Internet, Ämter                                            etc.) – Freitextfeld bei „andere“           |
| client_dolmetschungsstunden | int        | Anzahl in Anspruch genommener Dolmetschungen (in Stunden) |
| client_dolmetschungssprachen| String     | Freitextfeld für Sprache(n)  |
| client_notizen              | String     | Freifeld für Notizen       |

# Methoden

- clientAnlegen() --> mit ID-Generierung
- clientBearbeiten()
- clientSuchen()
- clientAnzeigen()
- clientLoeschen()
- verknuepfungMitAnfrage()
- verknuepfungMitBegleitung()
- verknuepfungMitBeratung()
- verknuepfungMitFall()
- verknuepfungMitGewaltfolgen()
- verknuepfungMitGewalttat()
- clientNotizHinzufuegen()
- clientNotizBearbeiten()
- clientNotizLoeschen()
