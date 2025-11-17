# Anfrage

| *Attribut*           | *Datentyp* | *Beschreibung* |
| -------------------- | ---------- |---------------------------------------------------------------|
| anfrage_id           | int        | Eindeutige ID der Anfrage  |
| anfrage_weg          | String     | Beschreibung, wie die Anfrage erfolgt ist (z. B. Telefon, E-Mail etc.) |
| anfrage_datum        | date       | Datum der Anfrage  |
| anfrage_ort          | enum       | Anfrage aus: Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / andere  |
| anfrage_person (wer) | enum       | Wer hat angefragt: Fachkraft (F) / Angehörige:r (A) / Betroffene:r (B) / anonym / queer Betroffene:r (qB) / queer Fachkraft (qF) / queer Angehörige:r (qA) / queer anonym / Fachkraft für Betroffene (FfB) /                                       Angehörige:r für Betroffene (AfB) / Fachkraft für queere Betroffene (FFqB) / Angehörige:r für queere Betroffene (AfqB) |
| anfrage_art          | enum       | Art der Anfrage: medizinische Soforthilfe / vertrauliche Spurensicherung / Beratungsbedarf / rechtliche Fragen / Sonstiges |
| beratungs_id         | int        | Wenn ein Termin vereinbart wurde, wird eine Beratung mit ID, Datum und Ort angelegt  |
| user_id              | int        | Mitarbeiter:in, welche Anfrage zugewiesen bekommen hat |


# Methoden:
anfrageAnlegen()

anfrageBearbeiten()

anfrageSuchen()

anfrageLoeschen()

mitarbeiterinZuweisen()

beratungZuweisen() --> Anfrage wird zur Beratung


