# Volere Requirements Specification

## 1. Project Drivers

### Zweck des Systems
- Vereinfachung der Datenerfassung
- Automatisierung der Datenauswertung 
  
### Stakeholder
- Mitarbeiter*innen Fachberatungsstelle für queere Betroffene von sexualisierter
Gewalt in der Stadt Leipzig
- Mitarbeiter*innen Fachberatung gegen sexualisierte Gewalt im Landkreis
Nordsachsen
- Mitarbeiter*innen Fachberatung gegen sexualisierte Gewalt im Landkreis Leipzig
- Klient*innen
- Vereinsmitglieder Bellis e.V. *(bedeutet das Mitarbeiter*innen oder meint das andere Personen? Wenn ja, wen?)*
- Land Sachsen?
  

## 2. Project Constraints
--> Welche (gesetzlichen) Rahmenbedingungen müssen eingehalten werden?

### Einschränkungen
- Datenschutz (DSGVO)
  - passwortgeschütztes Konto
  - abgestufte Berechtigungen (Basis, Erweiterung, Administration)
  - Welche Daten dürfen gespeichert werden? Anonymisierung? Wer hat Zugriff auf Daten?
  - Ab wann werden Daten gelöscht? (z.B. automatische Löschung nach 2 Jahren)
- Client-Server-Architektur mit zentraler Serverinstanz
- auf Serverinstanz läuft Microservice, der die Anfragen der Nutzer*innen verarbeitet und mit Datenbank kommuniziert
- Abgabe mit Docker Image, die Einrichtung auf eigenem Server erleichtert (Einschränkung?)
- ReadMe-Datei mit Installationsanleitung (keine Einschränkung? Genau wie Benutzerhandbuch aber wo kommt das hin?)

  
### Namenskonventionen und Terminologie
- **Anfrage**: Beratungsstelle wurde zwecks kurzer Frage oder zur Terminvereinbarung kontaktiert
- **Beratungsfall (Fall)**: Dokumentation einer oder mehrerer Beratungssitzungen und/oder Begleitungen (z.B. zur Polizei)
- **Klient*in**: Person, die Beratung in Anspruch nimmt
- **Preset**: gespeicherte Filterkonfiguration für die statistische Auswertung
- **Mitarbeiter*in**: Nutzer:in des Systems mit Basis-, erweiterten oder admninistrativen Berechtigungen 
- **Administrator*in**: Nutzer:in mit administrativen Rechten zur Benutzerverwaltung.  

### Relevante Fakten und Annahmen
- Vertraulichkeit und auf Wunsch anonyme Nutzung des Beratungsangebotes
- Bellis e.V. ist gemeinnütziger Verein -->
- Nutzung von drei Fachberatungsstellen: Eingabe der Daten in Software nur jeweils am entsprechenden Computer  
- bisher Erfassung mit Excel-Tabellen --> Arbeit mit Software ggf. Neuland --> Benutzerfreundlichkeit
- Software muss erweiterbar sein (ggf. Gesetzesänderungen)
- Accessability (besonders in Hinsicht auf visuelle Einschränkungen)
- Zugriff auf alle Datensätze durch alle Mitarbeiter:innen möglich

## 3. Functional Requirements
--> Was ist der Sinn des Systems?

### Rahmen der Arbeit
- gemeinnütziger Verein Bellis e.V. Leipzig setzt sich für Frauen, trans*, inter* und nicht-binäre Menschen ein, die sexualisierte Gewalt erlebt haben
- Ziele: Betroffene stärken, Selbstbestimmung fördern, Begleitung
- Unterstützungsangebot:
  - psychosoziale Beratung
  - Krisenintervention
  - längerfristige Begleitung
  - Vermittlung an weiterführende Hilfen
- kostenloses, vertrauliches, ggf. anonym nutzbares Angebot
- Verein ist in mehrere Projektbereiche gegliedert
  - Fachberatungsstelle für queere Betroffene von sexualisierter Gewalt in der Stadt Leipzig
  - Fachberatung gegen sexualisierte Gewalt im Landkreis Nordsachsen
  - Fachberatung gegen sexualisierte Gewalt im Landkreis Leipzig
- Beratungsstellen müssen Statistiken führen (gesetzliche Vorgabe)
- Mitarbeiter*innen müssen dazu Daten erfassen und auswerten
- bisher: 
  - händische Datenerfassung
  - Übertragung der Notizen in Excel Tabellen
- Ziel: Softwarelösung für Mitarbeiter*innen von Bellis e.V. welche den Prozess automatisiert
  - Datenerfassung mithilfe eines Webformulars
  - Berechnung und Export von Statistiken aus gespeicherten Daten
- nicht im Aufgabenbereich liegt Koordination zwischen Beratungsstellen, Zuweisung der Fälle, interne Organisation (wie Finanzen, Personalverwaltung) oder externe Kommunikation (Website, E-Mail-System)

### Datenmodell und Data-dictionary
#### Datenmodell
- Anfrage
  - enthält Informationen über Erstkontakte (Telefon, E-Mail usw.) 
  - kann zu einem Fall führen
  - 1 Anfrage → 0..1 Fall
- Fall
  - entsteht aus Anfrage oder wird direkt angelegt
  - enthält Informationen über laufende Beratungen 
  - gehört zu einer Klient*in
  - umfasst mehrere Beratungstermine, Gewaltvorfälle, Begleitungen/Verweise, Folgen der Gewalt
- Klient*in
  - Person, die beraten wird 
  - kann mehrere Fälle haben
  - enthält personenbezogene Daten
- Beratung
  - enthält Informationen wann und wo Beratung stattgefunden hat
  - gehört zu genau einem Fall
- Gewaltttat
- Gewaltfolgen
- Begleitung
- Preset
  - gespeicherte Filtereinstellungen für Statistiken 
  - kann einem oder mehreren Konten gehören
- Konto
  - authentifizierte Person mit zugewiesener Rolle (Basis, Erweiterung, Admin)
  - Zugangsdaten (Name, E-Mail und Passwort)
  - hat zugewiesene Fälle und Anfragen

Zwischen den Datentypen bestehen folgende Beziehungen:
- eine Klient*in kann mehrere Beratungsfälle haben 
- jeder Fall kann aus einer Anfrage entstehen
- jeder Fall ist einer Klient*in und Mitarbeiter*in zugordnet
- eine Beratung ist einer Mitarbeiter*in ud Klient*in zugeordnet
- Gewalttaten und Gewaltfolgen können einander zugeordnet sein aber auch unabhängig voneinander registriert werden
- Gewalttaten und Gewaltfolgen sind einer Klient*in zugeordnet
- Begleitungen werden einer Mitarbeiter*in und einer Klient*in zugeordnet
- ein Konto ist einer Mitarbeiter*in zugeordnet 
- jedem Konto ist eine Rolle zugeordnet (Basis, Erweiterung, Admin)
- ein Preset kann einem, mehreren oder allen Benutzerkonten zugeordnet sein

#### Datadictionary

##### Anfrage
| *Attribut*   | *Datentyp* | *Beschreibung* |
| ------------ | ---------- |---------------------------------------------------------------|
| anfrage_id   | int        | Eindeutige ID der Anfrage  |
| wie          | String     | Beschreibung, wie die Anfrage erfolgt ist (z. B. Telefon, E-Mail etc.) |
| datum        | date       | Datum der Anfrage  |
| ort          | enum       | Anfrage aus: Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / andere  |
| wer          | enum       | Wer hat angefragt: Fachkraft (F) / Angehörige:r (A) / Betroffene:r (B) / anonym / queer Betroffene:r (qB)                               / queer Fachkraft (qF) / queer Angehörige:r (qA) / queer anonym / Fachkraft für Betroffene (FfB) /                                       Angehörige:r für Betroffene (AfB) / Fachkraft für queere Betroffene (FFqB) / Angehörige:r für queere                                     Betroffene (AfqB) |
| art          | enum       | Art der Anfrage: medizinische Soforthilfe / vertrauliche Spurensicherung / Beratungsbedarf / rechtliche                                 Fragen / Sonstiges |
| beratungs_id | int        | Wenn ein Termin vereinbart wurde, wird eine Beratung mit ID, Datum und Ort angelegt  |
| user_id      | int        | Mitarbeiter*in, welche Anfrage zugewiesen bekommen hat |

##### Fall

| *Attribut*     | *Datentyp* | *Beschreibung*                                            |
| -------------- | ---------- | --------------------------------------------------------- |
| fall_id        | int        | Automatisch generierte ID zur Identifizierung eines Falls |
| client_id      | int        | Zugeordnete Klient*in                                     |
| beratungs_id   | int        | Zugeordnete Beratungen                                    |
| tat_id         | int        | Zugehörige Gewalttaten                                    |
| begleitungs_id | int        | Zugeordnete Begleitungen                                  |
| user_id        | int        | Zuständige Mitarbeiter*in                                 |



##### Klient*in
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

##### Beratung
| *Attribut*      | *Datentyp* | *Beschreibung*                                                                                  |
| --------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| beratungs_id    | int        | Eindeutige ID zur Identifikation einer Beratung                                                 |
| beratungsstelle | enum       | Zuständige Beratungsstelle (z. B. Fachberatung Leipzig Stadt / Nordsachsen / Landkreis Leipzig) |
| anzahl          | int        | Gesamtanzahl der Beratungen                                                                     |
| datum           | date       | Datum des Beratungstermins                                                                      |
| art             | enum       | Durchführungsart: persönlich / Video / Telefon / aufsuchend / schriftlich                       |
| ort             | enum       | Durchführungsort: Leipzig Stadt / Leipzig Land / Nordsachsen                                    |
| notizen         | String     | Freifeld für Notizen                                                                            |

##### Gewalttat
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

##### Gewaltfolgen
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
| notiz                 | String     | Freifeld für Notizen           |

##### Begleitungen
| *Attribut*          | *Datentyp* | *Beschreibung*        |
| ------------------- | ---------- | --------------------------------------------- |
| begleitungs_id      | int        | Eindeutige ID zur Identifikation einer Begleitung          |
| anzahl_begleitungen | int        | Gesamtanzahl der Begleitungen         |
| art_begleitung      | enum       | Begleitung bei: Gerichte / Polizei / Rechtsanwält:innen / Ärzt:innen / Rechtsmedizin / Jugendamt /                                       Sozialamt / Jobcenter / Beratungsstellen / Frauen- und Kinderschutzeinrichtungen / spezialisierte                                        Schutzeinrichtungen / Interventionsstellen / sonstige – Freitextfeld bei „sonstige“ |
| anzahl_verweisungen | int        | Gesamtanzahl der Verweisungen       |
| art_verweisungen    | enum       | Verweis an: Gerichte / Polizei / Rechtsanwält:innen / Ärzt:innen / Rechtsmedizin / Jugendamt /                                           Sozialamt / Jobcenter / Beratungsstellen / Frauen- und Kinderschutzeinrichtungen / spezialisierte                                        Schutzeinrichtungen / Interventionsstellen / sonstige – Freitextfeld bei „sonstige“     |

##### Konto
| *Attribut* | *Datentyp* | *Beschreibung*                                    |
| ---------- | ---------- | ------------------------------------------------- |
| user_id    | int        | Eindeutige ID des Benutzerkontos                  |
| vorname    | String     | Vorname der Mitarbeiter*in                        |
| nachname   | String     | Nachname der Mitarbeiter*in                       |
| mail       | String     | E-Mail-Adresse der Mitarbeiter*in                 |
| position   | enum       | Zugriffsberechtigung: Basis / Erweiterung / Admin |
| preset_id  | int        | Zugeordnete Filtereinstellungen                   |
| anfrage_id | int        | Anfragen, die von diesem Konto bearbeitet wurden  |
| fall_id    | int        | Fälle, die von diesem Konto bearbeitet wurden     |

##### Preset
| *Attribut* | *Datentyp* | *Beschreibung*                                                                              |
| ---------- | ---------- | ------------------------------------------------------------------------------------------- |
| preset_id  | int        | Eindeutige ID der Filtereinstellung                                                         |
| daten      | enum       | Auswahlmöglichkeiten an Daten, die für die statistische Auswertung ausgegeben werden sollen |


### Rahmen des Produkts
Das Produkt umfasst eine Softwarelösung zur digitalen Erfassung, Verwaltung und Auswertung von Anfragen und Beratungsfällen.
Hauptfunktionen sind:
- Eingabe und Verwaltung von Daten
  - Eingabemasken für Anfragen und Beratungsfälle
  - Such- und Bearbeitungsfunktionen
  - Erweiterbarkeit der Eingabemasken
- Auswertung und Analyse
  - Ausgabe von Statistiken auf Basis gespeicherter Daten
  - Filter- und Exportfunktionen (z. B. PDF, XLSX, CSV)
- Benutzerverwaltung und Rollenrechte
  - Konten mit abgestuften Berechtigungen (Basis, Erweiterung, Administration)
  - Verwaltung von Nutzer*innen durch Administratorinnen
- Nicht Bestandteil des Produkts sind:
  - Bereitstellung von Hardware (z. B. Server oder Endgeräte)
  - Externe Schnittstellen zu Drittsystemen (z. B. Staatsministerium der Justiz, Bundesamt für Statistik)
  - Datenarchivierung außerhalb der Anwendung

### Funktionelle Anforderungen und Anforderungen an Daten

#### 3.1 Eingabe [Snow Card FR-01: Eingabe]
- es gibt zwei Arten von Datensätzen: **Anfragen** und **Beratungsfälle**
- für jede Art müssen **Eingabemasken** zur Verfügung stehen
- beim Speichern wird geprüft, ob alle Pflichtfelder ausgefüllt sind
  - falls nicht: Meldung --> Option, fehlende Felder nachzutragen oder unvollständige Daten zu speichern

#### 3.2 Daten bearbeiten [Snow Card FR-02: Datenbearbeitung]
- alle Mitarbeiter*innen können bestehende Datensätze suchen und aktualisieren
  - Anfrage nach Tag suchen und bearbeiten
  - Fall suchen (Suchkriterium?)
- neue Informationen ergänzen und speichern
- nach Beratungstermin vermerken, dass Termin stattgefunden hat und in welcher Form

#### 3.3 Eingabemaske erweitern (Erweiterung + Admin) [Snow Card FR-03: Eingabeerweiterung]
- Name des neuen Feldes
- Art der Eingabe
  - Textfeld
  - Zahlenfeld
  - Datum
  - anpassbare Auswahlmöglichkeiten/ Dropdownlisten
  - Kontrollkästchen?

#### 3.4 Ausgabe von Statistiken [Snow Card FR-04: Statistikausgabe]
- Filter setzen mit Zeitraum und Merkmal 
- Filter als "preset" speichern
  - persönliches "preset" erstellen und löschen
  - geteiltes "preset" erstellen (und löschen?)
  - Erweiterung + Admin können außerdem geteilte presets verwalten und löschen
- drei Standard-Presets sind mitgeliefert
- Daten sollen exportiert werden können (PDF, XLSX, CSV)

#### 3.5 Berechtigungen und Nutzerverwaltung [Snow Card FR-05: Kontoverwaltung]
- Das System benötigt passwortgeschützte Konten mit abgestuften Rechten:  
  - **Basiskonto**: Datensätze erfassen/bearbeiten, Statistiken abrufen, selbsterstellte Presets speichern/löschen 
  - **Erweiterungskonto**: Zusätzlich neue Formularfelder und geteilte Presets verwalten
  - **Administrationskonto**: Zusätzlich Benutzerkonten verwalten (anlegen, Rechte zuweisen/entziehen, löschen)
- Es muss immer mindestens ein Konto mit Administrationsrechten existieren (empfohlen zwei)

## 4. Non-functional Requirements
--> Was sind (selbstverständliche) Erwartungen an das System?

### Look and feel [Snow Card NFR-01: Look and Feel]
- Einheitliche, sinnvolle Benutzerführung mit klaren Navigationswegen
- verständliche und konsistente Fehlermeldungen 
- Optische Hinweise zur Orientierung (z. B. Farbmarkierungen bei Pflichtfeldern)
- Verwendung der Vereinsfarben blau und gelb  
  
### Usability and humanity [Snow Card FR-02: Usability and Humanity]
- Intuitive Bedienbarkeit: System ist für Nutzer*innen ohne technische Vorkenntnisse nach 2 Übungsstunden erlernbar
- Barrierefreiheit durch anpassbare Schriftgröße, Kontrast und Screenreader-Kompatibilität  
- ggf. Option für light- und darkmode (TBC)
- Bereitstellung eines Benutzer*innenhandbuchs
- ReadMe Datei mit Installationsanleitung 
  
### Performance [Snow Card FR-03: Performance]
- System reagiert ohne wahrnehmbare Verzögerung (z. B. < 1 Sekunde beim Öffnen von Dropdowns, < 3 Sekunden beim Laden von Filterergebnissen)  
- mehrere Nutzer*innen können gleichzeitig ohne Performanceeinbußen darauf zugreifen (da nur 1 Computer pro Beratungsstelle eher vernachlässigbar)
- Das System (ohne Datenbank und externe Abhängigkeiten) benötigt weniger als 500 MB Speicherplatz.
- Der jährliche Speicherzuwachs durch Nutzungsdaten liegt unter 50 MB.
- Das Gesamtsystem (inkl. aller Anwendungsdaten, Logs und Konfigurationen) bleibt unter 1 GB bei einer Betriebsdauer von 10 Jahren.


### Wartbarkeit- und Support [Snow Card FR-04: Wartbarkeit]
- Saubere und dokumentierte Codestruktur (Kommentare, modulare Architektur, Namenskonventionen) ermöglicht externe Wartung
- Änderungen am System sind ohne tiefgreifende Eingriffe möglich (modularer Aufbau?)

### Sicherheit [Snow Card FR-05: Sicherheit]
- Automatische Abmeldung nach definierter Inaktivitätszeit (z. B. 10 Minuten)
- ggf. Multifaktorauthentifizierung (TBC, geringe Priorität)
- Passwortschutz nach klaren Richtlinien (Mindestlänge, Sonderzeichen, regelmäßige Erneuerung)  
- Passwort-Zurücksetzung durch autorisierte Admins möglich
- Vertraulichkeit der Daten
  - Speicherung erfolgt pseudonymisiert/anonymisiert 
  - Statistiken sollen keine Rückschlüsse auf Einzelpersonen zulassen (z.B. erst exportierbar ab 10 gespeicherten Datensätzen?)
- Datenspeicherung verschlüsselt (unsere Verantwortung?)
  
### Kulturell und politisch [Snow Card FR-06: Kulturell und Politisch]
- Verwendung gendergerechter Sprache
- Gestaltung nach traumasensiblen, feministischen und intersektionalen Selbsverständnisses 
- breite Definition des Gewaltbegriffs
- Parteilichkeit für Betroffene als Leitprinzip

### Gesetzliche [Snow Card FR-07: Gesetzlich]
- Einhaltung der DSGVO und anderer datenschutzrechtlicher Vorgaben  
- Gewährleistung von Datensicherheit, insbesondere bei personenbezogenen Informationen
  
## 5. Project Issues
--> Sonstige Eigenschaften:
– Offene Probleme
– Off-the-Shelf Lösungen
– Neue Probleme
– Aufgaben
– Migration auf neues Produkt
– Risiken
– Kosten
– Nutzerdokumentation und –training
– Waiting room
– Ideen für Lösungen
