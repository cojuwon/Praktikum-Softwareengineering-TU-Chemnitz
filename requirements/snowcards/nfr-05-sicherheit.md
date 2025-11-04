# Requirement #: NFR-05

# Requirement Type: Non-functional

# Event/BUC/PUC #:
- Zugriff auf gespeicherte Daten
- Authentifizierung
- Schutz sensibler Informationen

# Description:
- Rollenbasierte Zugriffsrechte verhindern unautorisierte Zugriffe und schützen personenbezogene und sensible Informationen
- Passwortschutz nach klaren Richtlinien (Mindestlänge, Sonderzeichen, regelmäßige Erneuerung)
- Passwort-Zurücksetzung durch autorisierte Administrator:innen möglich
- Daten werden nach Möglichkeit pseudonymisiert/anonymisiert gespeichert
- Statistiken sollen keine Rückschlüsse auf Einzelpersonen zulassen (z. B. erst exportierbar ab 10 gespeicherten Datensätzen)
- automatische Abmeldung nach definierter Inaktivitätszeit (z. B. 10 Minuten, TBC)
- alle gespeicherten Daten werden verschlüsselt abgelegt und ausschließlich über gesicherte Verbindungen übertragen (TBC)
- Optional: Multifaktorauthentifizierung (TBC, geringe Priorität)

# Rationale:
- Schutz sensibler Informationen von Klient:innen und Mitarbeiter:innen ist essenziell, um Datenschutzrichtlinien einzuhalten und Vertrauen in das System zu sichern

# Originator:
- Mitarbeiter:innen des Bellis e.V.

# Fit Criterion:
- Datenbankinhalte sind verschlüsselt gespeichert 
- unautorisierte Zugriffe werden verhindert
- automatische Abmeldung erfolgt nach definierter Inaktivitätszeit
- Passwortregeln werden durchgesetzt
- Statistische Auswertungen erlauben keine Rückschlüsse auf Einzelpersonen.

# Customer Satisfaction:
- 5

# Customer Dissatisfaction:
- 5

# Priority:
- hoch

# Conflicts:
- hohe Sicherheitsanforderungen können die Bedienungsfreundlichkeit einschränken (z. B. komplexere Passwörter)

# Supporting Materials:
- Datenschutzrichtlinien
- Projektbeschreibung

# History:
- erstellt: 03.11., bearbeitet: 03.10., letzte:r Bearbeiter:in: Pia

