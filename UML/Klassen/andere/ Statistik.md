# Statistik


# Anfrage

| *Attribut*           | *Datentyp*     | *Beschreibung* |
| -------------------- | -------------- |---------------------------------------------------------------|
| statistik_id         | int            | Eindeutige ID der Statistikberechnung                         |
| statistik_titel      | String         | Titel                                                         |
| statistik_notizen    | String         | genauere Beschreibung                                         |
| preset_id            | int            | Referenz auf ein preset, falls vorhanden                      |
| zeitraum_start       | int/date?      | Beginn des Auswertungszeitraums                               |
| zeitraum_ende        | int/date?      | Ende des Auswertungszeitraums                                 |
| datenart             | enum/String[]? | auszuwertende Daten, z. B. Anfrage, Beratung, etc.            |
| ergebnis             | ?              | Objekt mit den Ergebnissen                                    | --> hier unsicher, wie das aussehen soll
| creator_id           | int            | wer die Statistik erstellt hat                                |     
| creation_date        | int/date?      | wann die Statistik erstellt wurde                             |

# Methoden:

- statistikBerechnen() --> StatistikErgebnis
- filterAnwenden() --> preset laden und anwenden
- statistikAnzeigen() --> graphische/tabellarische Darstellung
- exportieren() --> format PDF, XLSX, CSV?
- 

