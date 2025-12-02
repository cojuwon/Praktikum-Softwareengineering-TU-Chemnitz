# Klient_in

| *Attribut*                  | *Datentyp* | *Beschreibung*  |
| --------------------------- | ---------- | ------------ |
| klient_id                   | int        | Automatisch generierte numerische ID     |
| klient_rolle                | enum       | Rolle der ratsuchenden Person: Betroffene:r / Angehörige:r / Fachkraft       |
| klient_alter                | int        | Alter in Jahren oder keine Angabe   |
| klient_geschlechtsidentitaet| enum       | cis weiblich / cis männlich / trans weiblich / trans männlich / trans nicht-binär / inter /                                             agender / divers / keine Angabe               |
| klient_sexualitaet          | enum       | lesbisch / schwul / bisexuell / asexuell / heterosexuell / keine Angabe     |
| klient_wohnort              | enum       | Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / Deutschland / andere / keine Angabe –                                             Freitextfeld bei „Deutschland“ oder „andere“ |
| klient_staatsangehoerigkeit | enum       | deutsch / nicht deutsch – falls „nicht deutsch“, Textfeld oder Auswahl des Landes   |
| klient_beruf                | String     | arbeitslos / studierend / berufstätig / berentet / Azubi / berufsunfähig / keine Angabe   |
| klient_schwerbehinderung    | enum       | Liegt eine Schwerbehinderung vor? Ja / Nein – bei Ja: Form (kognitiv/körperlich) und Grad der                                            Behinderung                                 |
| klient_kontaktpunkt         | enum       | Quelle, woher die Person von der Beratungsstelle erfahren hat (z. B. Polizei, Internet, Ämter                                            etc.) – Freitextfeld bei „andere“           |
| klient_dolmetschungsstunden | int        | Anzahl in Anspruch genommener Dolmetschungen (in Stunden) |
| klient_dolmetschungssprachen| String     | Freitextfeld für Sprache(n)  |
| klient_notizen              | String     | Freifeld für Notizen       |

# Methoden
klientAnlegen() --> mit ID-Generierung

klientBearbeiten()

klientSuchen()

klientLoeschen()

anfrageZuweisen()

begleitungZuweisen()

beratungZuweisen()

kontoZuweisen()

fallZuweisen()

gewaltfolgenZuweisen()

gewalttatZuweisen()

klientNotizAnlegen()

klientNotizBearbeiten()

klientNotizLoeschen()
