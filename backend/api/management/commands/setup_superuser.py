from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

class Command(BaseCommand):
    help = 'Erstellt einen Standard-Superuser (admin@test.de), falls noch nicht vorhanden'

    def handle(self, *args, **options):
        User = get_user_model()
        email = 'admin@test.de'
        password = 'admin123'
        
        # Prüfen, ob der User schon existiert (anhand des Email-Feldes 'mail_mb')
        if not User.objects.filter(mail_mb=email).exists():
            self.stdout.write(f'Erstelle Superuser "{email}"...')
            
            # Superuser erstellen
            # Wir setzen auch vorname/nachname, falls diese Pflichtfelder sind
            User.objects.create_superuser(
                mail_mb=email,
                password=password,
                vorname_mb='Admin',
                nachname_mb='User'
            )
            
            self.stdout.write(self.style.SUCCESS(f'✓ Superuser "{email}" erfolgreich erstellt!'))
        else:
            self.stdout.write(f'  Superuser "{email}" existiert bereits.')