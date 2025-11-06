# Anfrage

| *Attribut*   | *Datentyp* | *Beschreibung* |
| ------------ | ---------- |---------------------------------------------------------------|
| anfrage_id   | int        | Eindeutige ID der Anfrage  |
| wie          | String     | Beschreibung, wie die Anfrage erfolgt ist (z. B. Telefon, E-Mail etc.) |
| datum        | date       | Datum der Anfrage  |
| ort          | enum       | Anfrage aus: Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / andere  |
| wer          | enum       | Wer hat angefragt: Fachkraft (F) / Angehörige:r (A) / Betroffene:r (B) / anonym / queer Betroffene:r (qB)                               / queer Fachkraft (qF) / queer Angehörige:r (qA) / queer anonym / Fachkraft für Betroffene (FfB) /                                       Angehörige:r für Betroffene (AfB) / Fachkraft für queere Betroffene (FFqB) / Angehörige:r für queere                                     Betroffene (AfqB) |
| art          | enum       | Art der Anfrage: medizinische Soforthilfe / vertrauliche Spurensicherung / Beratungsbedarf / rechtliche                                 Fragen / Sonstiges |
| beratungs_id | int        | Wenn ein Termin vereinbart wurde, wird eine Beratung mit ID, Datum und Ort angelegt  |
| user_id      | int        | Mitarbeiter:in, welche Anfrage zugewiesen bekommen hat |


# Methoden:

anfrageSpeichern()

anfrageBearbeiten()

anfrageSuchen()

