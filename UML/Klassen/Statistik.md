# Statistik

| *Attribut*           | *Datentyp*     | *Beschreibung* |
| -------------------- | -------------- |---------------------------------------------------------------|
| statistik_id         | int            | Eindeutige ID der Statistikberechnung                         |
| statistik_titel      | String         | Titel                                                         |
| statistik_notizen    | String         | genauere Beschreibung                                         |
| preset_id            | int            | Referenz auf ein preset, falls vorhanden                      |
| zeitraum_start       | date           | Beginn des Auswertungszeitraums                               |
| zeitraum_ende        | date           | Ende des Auswertungszeitraums                                 |
| ergebnis             | Datei          | Objekt mit den Ergebnissen                                    |
| creator_id           | int            | wer die Statistik erstellt hat                                |     
| creation_date        | date           | wann die Statistik erstellt wurde                             |

# Methoden:
statistikBerechnen() --> StatistikErgebnis

filterAnwenden() --> preset laden und anwenden

statistikeExportieren() --> format PDF, XLSX, CSV?


