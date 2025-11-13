# Begleitungen

| *Attribut*          | *Datentyp* | *Beschreibung*        |
| ------------------- | ---------- | --------------------------------------------- |
| begleitungs_id      | int        | Eindeutige ID zur Identifikation einer Begleitung          |
| anzahl_begleitungen | int        | Gesamtanzahl der Begleitungen         |
| art_begleitung      | enum       | Begleitung bei: Gerichte / Polizei / Rechtsanwält:innen / Ärzt:innen / Rechtsmedizin / Jugendamt /                                       Sozialamt / Jobcenter / Beratungsstellen / Frauen- und Kinderschutzeinrichtungen / spezialisierte                                        Schutzeinrichtungen / Interventionsstellen / sonstige – Freitextfeld bei „sonstige“ |
| anzahl_verweisungen | int        | Gesamtanzahl der Verweisungen       |
| art_verweisungen    | enum       | Verweis an: Gerichte / Polizei / Rechtsanwält:innen / Ärzt:innen / Rechtsmedizin / Jugendamt /                                           Sozialamt / Jobcenter / Beratungsstellen / Frauen- und Kinderschutzeinrichtungen / spezialisierte                                        Schutzeinrichtungen / Interventionsstellen / sonstige – Freitextfeld bei „sonstige“     |

## Methoden
- begleitungAnlegen()
- begleitungHinzufuegen() --> gleiches wie anlegen, nur dass Person schon existiert und schon Begleitungen gespeichert hat
- begleitungBearbeiten()
- begleitungAnzeigen()
- begleitungLoeschen()
- verweisungAnlegen()
- verweisungHinzufuegen() --> gleiches wie anlegen, nur dass Person schon existiert und schon Verweisungen gespeichert hat
- verweisungBearbeiten()
- verweisungAnzeigen()
- verweisungLoeschen()
