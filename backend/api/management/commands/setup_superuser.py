from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
import os
import secrets

class Command(BaseCommand):
    help = 'Erstellt einen Standard-Superuser (admin@adminuser.de), falls noch nicht vorhanden'

    def handle(self, *args, **options):
        User = get_user_model()
        email = 'admin@adminuser.de'
        password = secrets.token_urlsafe(16)
        
        # Prüfen, ob der User schon existiert (anhand des Email-Feldes 'mail_mb')
        if not User.objects.filter(mail_mb=email).exists():
            self.stdout.write(f'Erstelle Superuser "{email}"...')
            self.stdout.write(self.style.WARNING(f'WICHTIG! Generiertes Passwort: {password} (Bitte sicher aufbewahren!)'))
            
            # Superuser erstellen
            # Wir setzen auch vorname/nachname, falls diese Pflichtfelder sind
            user = User.objects.create_superuser(
                mail_mb=email,
                password=password,
                vorname_mb='Admin',
                nachname_mb='User'
            )
            
            # Gruppe "Admin" zuweisen
            try:
                admin_group = Group.objects.get(name='Admin')
                user.groups.add(admin_group)
                self.stdout.write(f'  Gruppe "Admin" zugewiesen.')
            except Group.DoesNotExist:
                self.stdout.write(self.style.WARNING('  Warnung: Gruppe "Admin" existiert noch nicht. Bitte "setup_groups" vorher ausführen.'))

            self.stdout.write(self.style.SUCCESS(f'✓ Superuser "{email}" erfolgreich erstellt!'))
        else:
            self.stdout.write(f'  Superuser "{email}" existiert bereits.')