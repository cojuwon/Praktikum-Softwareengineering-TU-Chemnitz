# Klient_in

| *Attribut*           | *Datentyp* | *Beschreibung*  |
| -------------------- | ---------- | ------------ |
| client_id            | int        | Automatisch generierte numerische ID     |
| client_rolle         | enum       | Rolle der ratsuchenden Person: Betroffene:r / Angehörige:r / Fachkraft       |
| alter                | int        | Alter in Jahren oder keine Angabe   |
| geschlechtsidentität | enum       | cis weiblich / cis männlich / trans weiblich / trans männlich / trans nicht-binär / inter /                                             agender / divers / keine Angabe               |
| sexualität           | enum       | lesbisch / schwul / bisexuell / asexuell / heterosexuell / keine Angabe     |
| wohnort              | enum       | Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / Deutschland / andere / keine Angabe –                                             Freitextfeld bei „Deutschland“ oder „andere“ |
| staatsangehörigkeit  | enum       | deutsch / nicht deutsch – falls „nicht deutsch“, Textfeld oder Auswahl des Landes   |
| beruf                | String     | arbeitslos / studierend / berufstätig / berentet / Azubi / berufsunfähig / keine Angabe   |
| schwerbehinderung    | enum       | Liegt eine Schwerbehinderung vor? Ja / Nein – bei Ja: Form (kognitiv/körperlich) und Grad der                                            Behinderung                                 |
| kontaktpunkt         | enum       | Quelle, woher die Person von der Beratungsstelle erfahren hat (z. B. Polizei, Internet, Ämter                                            etc.) – Freitextfeld bei „andere“           |
| dolmetschungsstunden | int        | Anzahl in Anspruch genommener Dolmetschungen (in Stunden) |
| dolmetschungssprachen| String     | Freitextfeld für Sprache(n)  |
| notizen              | String     | Freifeld für Notizen       |

# Methoden

