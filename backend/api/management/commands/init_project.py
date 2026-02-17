from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Initialisiert das gesamte Projekt (Gruppen, Eingabefelder, Statistiken, Superuser)'

    def handle(self, *args, **options):
        self.stdout.write("Starte Projekt-Initialisierung...")

        # 1. Gruppen & Permissions
        self.stdout.write("\n1. Richte Gruppen und Berechtigungen ein...")
        call_command('setup_groups')

        # 2. Eingabefelder
        self.stdout.write("\n2. Initialisiere Eingabefelder...")
        call_command('init_eingabefelder')

        # 3. Statistik-Presets
        self.stdout.write("\n3. Initialisiere Statistik-Presets...")
        call_command('init_statistics')

        # 4. Superuser
        self.stdout.write("\n4. Erstelle Superuser (falls nicht vorhanden)...")
        call_command('setup_superuser')

        self.stdout.write(self.style.SUCCESS('\n✓ Projekt-Initialisierung abgeschlossen!'))
