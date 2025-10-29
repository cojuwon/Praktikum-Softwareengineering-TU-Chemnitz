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
- Client*innen
- Vereinsmitglieder Bellis e.V.
  

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
- Abgabe mit Docker Image, die Einrichtung auf eigenem Server erleichtert
- ReadMe-Datei mit Installationsanleitung
  
### Namenskonventionen und Terminologie
- **Anfrage**: Beratungsstelle wurde zwecks kurzer Frage oder zur Terminvereinbarung kontaktiert
- **Beratungsfall (Fall)**: Dokumentation einer oder mehrerer Beratungssitzungen
- **Klient*in**: Person, die Beratung in Anspruch nimmt
- **Preset**: gespeicherte Filterkonfiguration für die statistische Auswertung
- **Mitarbeiter*in**: Nutzer*in des Systems mit Basis- oder erweiterten Rechten  
- **Administrator*in**: Nutzerin mit administrativen Rechten zur Benutzerverwaltung.  

### Relevante Fakten und Annahmen
- Vertraulichkeit und auf Wunsch anonyme Nutzung des Beratungsangebotes
- Bellis e.V. ist gemeinnütziger Verein -->
- Nutzung von mehreren Fachberatungsstellen
- bisher Erfassung mit Excel-Tabellen --> Arbeit mit Software ggf. Neuland --> Benutzerfreundlichkeit
- Software muss erweiterbar sein (ggf. Gesetzesänderungen)

## 3. Funktional Requirements
--> Was ist der Sinn des Systems?

### Rahmen der Arbeit

### Datenmodell und Data-dictionary
Das System verwaltet die folgenden zentralen Datentypen:
- **Anfrage**: Enthält Informationen über Erstkontakte (Telefon, E-Mail usw.)
- **Beratungsfall**: Enthält Informationen über laufende Beratungen
- **Klientin**: Person, die beraten wird
- **Preset**: Gespeicherte Filtereinstellungen für Statistiken
- **Benutzerkonto**: Zugangsdaten und Rollen (Basis, Erweiterung, Admin), gespeichert sind Email und Namen

Zwischen den Datentypen bestehen folgende Beziehungen:
- eine Klientin kann mehrere Beratungsfälle haben
- jeder Beratungsfall kann aus einer Anfrage entstehen
- ein Benutzerkonto ist einer Mitarbeiterin zugeordnet
- ein Preset kann einem oder allen Benutzerkonten zugeordnet sein 
  
### Rahmen des Produkts
- Eingabemasken für Anfragen und Fälle
- Suchfunktion
- Bearbeitungsfunktion
- Erweiterbarkeit der Eingabemaske
- Ausgabe von Statistiken
- Nutzerverwaltung über Admin-Zugang

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
  - **Basiskonto**: Datensätze erfassen/bearbeiten, Statistiken abrufen, (selbsterstellte?) Presets speichern/löschen 
  - **Erweiterungskonto**: Zusätzlich neue Formularfelder und geteilte Presets verwalten
  - **Administrationskonto**: Zusätzlich Benutzerkonten verwalten (anlegen, Rechte zuweisen/entziehen, löschen)
- Es muss immer mindestens ein Konto mit Administrationsrechten existieren (empfohlen zwei)

## 4. Non-functional Requirements
--> Was sind (selbstverständliche) Erwartungen an das System?
### Look and feel
- sinnvolle Benutzerführung
- Fehlermeldungen
- optische Hinweise
- Benutzer*innenhandbuch
  
### Usability and humanity
- intuitive Bedienung
- Barrierefreiheit (z.B. Anpassung der Schriftgröße, Kontrast)
- light- und darkmode?
  
### Performance
### Wartbarkeit- und Support
### Sicherheit

### Kulturell und politisch
- Geschlechtergerechte Sprache
- Gestaltung nach traumasensiblen, feministischen und intersektionalen Selbsverständnisses
  
### Gesetzliche
- DSGVO-konform

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
