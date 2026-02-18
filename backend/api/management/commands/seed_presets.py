from django.core.management.base import BaseCommand
from api.models import Preset, Konto
from django.conf import settings

class Command(BaseCommand):
    help = 'Seeds default presets for statistics'

    def handle(self, *args, **options):
        # Ensure we have an admin user to own the global presets
        admin_user = Konto.objects.filter(rolle_mb='AD').first()
        if not admin_user:
            self.stdout.write(self.style.WARNING('No admin user found. Creating a dummy system user for presets...'))
            # Try to find ANY user or create one if db is empty (unlikely in dev but possible)
            admin_user = Konto.objects.first()
            if not admin_user:
                 self.stdout.write(self.style.ERROR('No users found in database. Cannot seed presets without an owner.'))
                 return

        default_presets = [
            {
                "name": "Fachberatungsstelle Leipzig Stadt",
                "filters": {"beratungsstelle": "LS"},
                "description": "Statistik für Leipzig Stadt (Datenerfassung gemäß Förderrichtlinie)",
                "preset_daten": {"visible_sections": ["all"]} # Default to all, frontend will handle this
            },
            {
                "name": "Fachberatungsstelle Landkreis Leipzig",
                "filters": {"beratungsstelle": "LL"},
                "description": "Statistik für Landkreis Leipzig (Datenerfassung gemäß Förderrichtlinie)",
                "preset_daten": {"visible_sections": ["all"]}
            },
            {
                "name": "Fachberatungsstelle Nordsachsen",
                "filters": {"beratungsstelle": "NS"},
                "description": "Statistik für Nordsachsen (Datenerfassung gemäß Förderrichtlinie)",
                "preset_daten": {"visible_sections": ["all"]}
            }
        ]

        for p_data in default_presets:
            preset, created = Preset.objects.get_or_create(
                preset_beschreibung=p_data["name"],
                defaults={
                    "filterKriterien": p_data["filters"],
                    "preset_daten": p_data["preset_daten"],
                    "is_global": True,
                    "ersteller": admin_user
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created preset: {p_data["name"]}'))
            else:
                # Update existing if needed to ensure they are global
                if not preset.is_global:
                    preset.is_global = True
                    preset.save()
                    self.stdout.write(self.style.SUCCESS(f'Updated preset to global: {p_data["name"]}'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Preset already exists: {p_data["name"]}'))

