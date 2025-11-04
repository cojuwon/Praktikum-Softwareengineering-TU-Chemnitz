# Requirement #: FR-05

# Requirement Type: Functional

# Event/BUC/PUC #:
- Mitarbeiter:in möchte sich am System anmelden und je nach Rolle (Basis, Erweiterung, Admin) unterschiedliche Funktionen nutzen
- Administrator:in möchte Benutzerkonten anlegen, Rechte zuweisen, ändern oder löschen

# Description:
- das System benötigt passwortgeschützte Konten mit abgestuften Rechten:  
  - Basiskonto: Datensätze erfassen/bearbeiten, Statistiken abrufen, selbsterstellte Presets speichern/löschen 
  - Erweiterungskonto: zusätzlich neue Formularfelder und geteilte Presets verwalten
  - Administrationskonto: zusätzlich Benutzerkonten verwalten (anlegen, Rechte zuweisen/entziehen, löschen)
- es muss immer mindestens ein Konto mit Administrationsrechten existieren (empfohlen zwei)

# Rationale:
- Sicherheit der Daten und Vermeidung von Überforderung durch unnötig viele Optionen
- Principle of least required privilege

# Originator:
- Mitarbeiter:innen des Bellis e.V.

# Fit Criterion:
- Nutzer:innen können sich nur mit gültigen Anmeldedaten ins System einloggen
- Funktionen sind nur entsprechend der vergebenen Rolle sichtbar und nutzbar
- es existiert mindestens ein aktives Administrationskonto
- Administrator:innen können erfolgreich Konten anlegen, bearbeiten und löschen

# Customer Satisfaction:
- 5

# Customer Dissatisfaction:
- 5

# Priority:
- hoch

# Conflicts: 
- zu strikte Berechtigungsstufen könnten Arbeitsprozesse behindern (z. B. wenn Adminrechte fehlen)

# Supporting Materials:
- Anforderungsbeschreibung

# History:
- erstellt: 03.11., bearbeitet: 04.10., letzte:r Bearbeiter:in Anton
