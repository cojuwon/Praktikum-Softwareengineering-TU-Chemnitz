"""
Management Command: init_eingabefelder

Initialisiert die Eingabefelder (Formular-Konfiguration) für Anfrage und Fall
basierend auf anforderungen/statistik_bogen.md.

Verwendung:
    python manage.py init_eingabefelder
"""
from django.core.management.base import BaseCommand
from api.services.eingabefeld_init_service import init_anfrage_fields, init_fall_fields

class Command(BaseCommand):
    help = 'Initialisiert Eingabefelder für Anfrage und Fall aus den Anforderungsdokumenten'

    def handle(self, *args, **options):
        # We pass self.stdout to the logger so the command still prints output
        class CommandLogger:
            def info(self, msg):
                self._stdout.write(msg)
            def debug(self, msg):
                self._stdout.write(msg)
            def __init__(self, stdout):
                self._stdout = stdout
                
        logger = CommandLogger(self.stdout)
        
        init_anfrage_fields(logger, force_update=True)
        init_fall_fields(logger, force_update=True)
        
        self.stdout.write(self.style.SUCCESS("Alle Eingabefelder wurden erfolgreich initialisiert."))
