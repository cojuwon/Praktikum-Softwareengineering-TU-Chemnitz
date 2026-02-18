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
        
        # 3. Migrations
        self.stdout.write("Running migrations...")
        call_command('migrate')
        
        # 4. Permissions & Groups
        self.stdout.write("Setting up permissions...")
        call_command('setup_permissions')
        
        # 5. Statistik-Presets
        self.stdout.write("\n5. Initialisiere Statistik-Presets...")
        call_command('init_statistics')
        
        # 6. Superuser
        self.stdout.write("\n6. Erstelle Superuser (falls nicht vorhanden)...")
        call_command('setup_superuser')
        
        # 7. Default Presets
        self.stdout.write("Seeding default presets...")
        call_command('seed_presets')

        self.stdout.write(self.style.SUCCESS("Project initialization complete!"))
