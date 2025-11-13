#!/bin/sh

# Warte auf die PostgreSQL-Datenbank, bis der Port 5432 geöffnet ist.
echo "Warte auf PostgreSQL (Host: db, Port: 5432)..."

# Die Hostadresse 'db' ist der Service-Name aus der docker-compose.yml
# netcat (nc) wird zur Prüfung der Erreichbarkeit verwendet
while ! nc -z db 5432; do
  sleep 0.5
done

echo "PostgreSQL ist bereit. Führe Django-Migrationen aus..."

# Führt die Migrationen aus (mit --noinput, um keine Fragen zu stellen)
python manage.py migrate --noinput

echo "Starte Django Server..."
# Startet den Django Server (ersetzt den alten CMD-Befehl)
exec python manage.py runserver 0.0.0.0:8000