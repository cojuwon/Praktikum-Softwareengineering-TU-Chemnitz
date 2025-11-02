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
  - ermittlung an weiterführende Hilfen
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

| *Attribut*   | *Datentyp* | *Beschreibung*                                                                                                                                                                                                                                                                                                                      |
| ------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| anfrage_id   | int        | Eindeutige ID der Anfrage                                                                                                                                                                                                                                                                                                           |
| wie          | string     | Beschreibung, wie die Anfrage erfolgt ist (z. B. Telefon, E-Mail etc.)                                                                                                                                                                                                                                                              |
| datum        | date       | Datum der Anfrage                                                                                                                                                                                                                                                                                                                   |
| ort          | enum       | Anfrage aus: Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / andere                                                                                                                                                                                                                                                          |
| wer          | enum       | Wer hat angefragt: Fachkraft (F) / Angehörige:r (A) / Betroffene:r (B) / anonym / queer Betroffene:r (qB) / queer Fachkraft (qF) / queer Angehörige:r (qA) / queer anonym / Fachkraft für Betroffene (FfB) / Angehörige:r für Betroffene (AfB) / Fachkraft für queere Betroffene (FFqB) / Angehörige:r für queere Betroffene (AfqB) |
| art          | enum       | Art der Anfrage: medizinische Soforthilfe / vertrauliche Spurensicherung / Beratungsbedarf / rechtliche Fragen / Sonstiges                                                                                                                                                                                                          |
| beratungs_id | int        | Wenn ein Termin vereinbart wurde, wird eine Beratung mit ID, Datum und Ort angelegt                                                                                                                                                                                                                                                 |
| user_id      | int        | Mitarbeiter*in, der*die Anfrage zugewiesen bekommen hat                                                                                                                                                                                                                                                                             |


##### Fall


##### Klient*in
##### Beratung
##### Gewalttat
##### Gewaltfolgen
##### Begleitungen
##### Konto
##### Preset

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
Nicht Bestandteil des Produkts sind:
- Bereitstellung von Hardware (z. B. Server oder Endgeräte)
- Externe Schnittstellen zu Drittsystemen (z. B. Bundesamt für Statistik)
- Datenarchivierung außerhalb der Anwendung

### Funktionelle Anforderungen und Anforderungen an Daten

#### 3.1 Eingabe
- es gibt zwei Arten von Datensätzen: **Anfragen** und **Beratungsfälle**
- für jede Art müssen **Eingabemasken** zur Verfügung stehen
- beim Speichern wird geprüft, ob alle Pflichtfelder ausgefüllt sind
  - falls nicht: Meldung --> Option, fehlende Felder nachzutragen oder unvollständige Daten zu speichern

#### 3.2 Daten bearbeiten
- alle Mitarbeiter*innen können bestehende Datensätze suchen und aktualisieren
  - Anfrage nach Tag suchen und bearbeiten
  - Fall suchen (Suchkriterium?)
- neue Informationen ergänzen und speichern
- nach Beratungstermin vermerken, dass Termin stattgefunden hat und in welcher Form

#### 3.3 Eingabemaske erweitern
- Name des neuen Feldes
- Art der Eingabe
  - Textfeld
  - Zahlenfeld
  - Datum
  - anpassbare Auswahlmöglichkeiten/ Dropdownlisten
  - Kontrollkästchen?

#### 3.4 Ausgabe von Statistiken
- Filter setzen mit Zeitraum und Merkmal 
- Filter als "preset" speichern
  - persönliches "preset"
  - geteiltes "preset"
- drei Standard-Presets sind mitgeliefert
- Daten sollen exportiert werden können (PDF, XLSX, CSV)

#### 3.5 Berechtigungen und Nutzerverwaltung
- Das System benötigt passwortgeschützte Konten mit abgestuften Rechten:  
  - **Basiskonto**: Datensätze erfassen/bearbeiten, Statistiken abrufen, selbsterstellte Presets speichern/löschen 
  - **Erweiterungskonto**: Zusätzlich neue Formularfelder und geteilte Presets verwalten
  - **Administrationskonto**: Zusätzlich Benutzerkonten verwalten (anlegen, Rechte zuweisen/entziehen, löschen)
- Es muss immer mindestens ein Konto mit Administrationsrechten existieren (empfohlen zwei)

## 4. Non-functional Requirements
--> Was sind (selbstverständliche) Erwartungen an das System?

### Look and feel
- sinnvolle Benutzerführung
- Fehlermeldungen
- optische Hinweise
- blau und gelb als Vereinsfarben 
  
### Usability and humanity
- intuitive Bedienung
- Barrierefreiheit (z.B. Anpassung der Schriftgröße, Kontrast) besonders in Hinblick auf visuelle Einschränkungen
- light- und darkmode?
- Benutzer*innenhandbuch
  
### Performance
- kurze Reaktionszeiten (z. B. für Öffnung von Dropdown-Menü x sek, für Laden von Daten bei Filter y sek --> ist Zeiteinsparung für unser Projekt überhaupt eine sinnvolle Anforderung?)
- mehrere Nutzer*innen können gleichzeitig ohne Performanceeinbußen darauf zugreifen (da nur 1 Computer pro Beratungsstelle eher vernachlässigbar)
- 

### Wartbarkeit- und Support
- Cleane/übersichtliche Codestruktur und Dokumentation
- Übergabe der Verantwortung für Wartung muss sichergestellt werden

### Sicherheit
- Multifaktorauthentifizierung (eher nicht, oder?)
- Automatische Abmeldung nach gewisser Zeitspanne der Inaktivität
- Passwortrichtlinien (bestimmte Anzahl + Inklusive Sonderzeichen)
- Zurücksetzung des Passworts muss möglich sein
  
### Kulturell und politisch
- Geschlechtergerechte Sprache
- Gestaltung nach traumasensiblen, feministischen und intersektionalen Selbsverständnisses
- breite Definition des Gewaltbegriffs

### Gesetzliche
- DSGVO-konform
- Datensicherheit

## 5. Project Issues
Sonstige Eigenschaften:
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
