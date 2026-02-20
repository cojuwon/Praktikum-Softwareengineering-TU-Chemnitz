from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Fall, Anfrage, SystemSettings

class Command(BaseCommand):
    help = 'Löscht Elemente endgültig, die länger als die konfigurierte Frist im Papierkorb liegen.'

    def handle(self, *args, **options):
        # 1. Konfiguration laden
        settings = SystemSettings.load()
        days = settings.trash_retention_days
        cutoff_date = timezone.now() - timedelta(days=days)

        self.stdout.write(f"Starte Bereinigung... (Lösche Elemente gelöscht vor {cutoff_date})")

        # 2. Fälle löschen
        faelle = Fall.objects.filter(deleted_at__lt=cutoff_date)
        count_faelle = faelle.count()
        if count_faelle > 0:
            faelle.delete() # Hard Delete
            self.stdout.write(self.style.SUCCESS(f"{count_faelle} alte Fälle endgültig gelöscht."))
        else:
            self.stdout.write("Keine alten Fälle gefunden.")

        # 3. Anfragen löschen
        anfragen = Anfrage.objects.filter(deleted_at__lt=cutoff_date)
        count_anfragen = anfragen.count()
        if count_anfragen > 0:
            anfragen.delete() # Hard Delete
            self.stdout.write(self.style.SUCCESS(f"{count_anfragen} alte Anfragen endgültig gelöscht."))
        else:
            self.stdout.write("Keine alten Anfragen gefunden.")
            
        self.stdout.write(self.style.SUCCESS("Bereinigung abgeschlossen."))
