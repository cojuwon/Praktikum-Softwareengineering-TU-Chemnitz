# **Automatisierung und Digitalisierung zur Erfassung von Statistiken für den Bellis e.V. Leipzig**

## **1\. Über den Bellis e.V.**

Der Bellis e.V. Leipzig ist ein gemeinnütziger Verein, der sich für Frauen, trans\*, inter\* und nicht-binäre Menschen einsetzt, die sexualisierte Gewalt erlebt haben. Ziel des Vereins ist es, Betroffene zu stärken, ihre Selbstbestimmung zu fördern und sie auf ihrem Weg der Verarbeitung und Selbstermächtigung zu begleiten.

Der Verein bietet ein vielfältiges Unterstützungsangebot, das unter anderem psychosoziale Beratung, Krisenintervention, längerfristige Begleitung sowie die Vermittlung an weiterführende Hilfen umfasst. Die Angebote sind kostenlos, vertraulich und auf Wunsch anonym nutzbar.

Bellis e.V. versteht sich als parteilich für Betroffene und arbeitet auf Grundlage eines traumasensiblen, feministischen und intersektionalen Selbstverständnisses.

Der Bellis e.V. ist in mehrere Projektbereiche gegliedert, die aus unterschiedlichen Mitteln finanziert werden:

1. Fachberatungsstelle für queere Betroffene von sexualisierter Gewalt in der Stadt Leipzig.  
2. Fachberatung gegen sexualisierte Gewalt im Landkreis Nordsachsen.  
3. Fachberatung gegen sexualisierte Gewalt im Landkreis Leipzig.

## **2\. Problemstellung**

Für alle drei Projektbereiche müssen aufgrund gesetzlicher Vorgaben Statistiken geführt werden. Deswegen müssen die Mitarbeiterinnen Daten erfassen und auswerten. Dies erfolgt im Moment händisch. Die Mitarbeiterinnen verfassen handschriftliche Notizen und übertragen diese in Excel-Listen. Das ist fehleranfällig und zeitaufwendig. Unterschiedliche Anforderungen je nach Finanzierungsquelle (Stadt vs. Landkreise) erschweren den Prozess zusätzlich.

## **3\. Ziel der Software**

Entwicklung einer webbasierten Anwendung zur digitalen Erfassung und Auswertung der Daten.

**Hauptfunktionen:**

* Erfassung von Klienten- und Falldaten.  
* Automatische Generierung der benötigten Statistiken für die Geldgeber.  
* Ablösung der manuellen Zettelwirtschaft.

## **4\. Technische Anforderungen & Architektur**

* **Architektur:** Die Anwendung basiert auf einer Client-Server-Architektur, die eine zentrale Serverinstanz nutzt, auf der ein Microservice läuft. Dieser Microservice verarbeitet die Anfragen der Nutzerinnen und ist für die Kommunikation mit der Datenbank zuständig (Django).  
* **Deployment:** Ihre Abgabe besitzt ein Docker Image, das die Einrichtung auf einem eigenen Server erleichtert. Die zur Installation notwendigen Schritte sollen in einer ReadMe-Datei erklärt werden.

## **5\. Anforderungen an UX (User Experience)**

Generell wird Wert auf eine sinnvolle Benutzerführung gelegt, z.B. durch sinnvolle Fehlermeldungen und optische Hinweise. Ergänzt wird die UX durch ein Benutzerhandbuch, das die einzelnen Funktionen der Software verständlich erklärt.

## **6\. Bonus Anforderungen**

### **Zusatzfunktion: Visualisierung in einem Dashboard**

Für die weitere Nutzung durch die Mitarbeiterinnen sollen die Daten in sinnvollen Graphen visualisiert werden, damit z.B. Veränderungen über die Zeit nachvollzogen werden können. Die Mitarbeiterinnen sollen flexibel wählen können, welche Daten und welcher Zeitraum beachtet werden soll. Die erstellten Graphen sollen anschließend exportiert werden können.

### **Technische Bonus Anforderungen**

Bei der Entwicklung der webbasierten Anwendung wird hoher Wert auf Qualität gelegt. Dies wird durch die Implementierung von **CI/CD-Pipelines** zur automatisierten Prüfung und Bereitstellung der Software unterstützt. Die Entwicklung erfolgt in einem Scrum-ähnlichen Prozess, der durch Git-Issues und den **GitFlow**\-Ansatz strukturiert wird.

