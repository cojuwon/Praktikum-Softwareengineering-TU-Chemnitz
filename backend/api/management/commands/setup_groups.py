"""
Management Command: setup_groups

Erstellt die Standard-Gruppen (Basis, Erweiterung, Admin) und weist ihnen
die entsprechenden Berechtigungen zu.

Kann bei Bedarf erneut ausgeführt werden um Berechtigungen zu aktualisieren.

Verwendung:
    python manage.py setup_groups
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Group, Permission


class Command(BaseCommand):
    help = 'Erstellt Standard-Gruppen (Basis, Erweiterung, Admin) mit entsprechenden Berechtigungen'

    def handle(self, *args, **options):
        self.stdout.write('Erstelle Berechtigungsgruppen...\n')

        # --- GRUPPEN ERSTELLEN ---
        basis_group, created = Group.objects.get_or_create(name='Basis')
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Gruppe "Basis" erstellt'))
        else:
            self.stdout.write('  Gruppe "Basis" existiert bereits')

        erweiterung_group, created = Group.objects.get_or_create(name='Erweiterung')
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Gruppe "Erweiterung" erstellt'))
        else:
            self.stdout.write('  Gruppe "Erweiterung" existiert bereits')

        admin_group, created = Group.objects.get_or_create(name='Admin')
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Gruppe "Admin" erstellt'))
        else:
            self.stdout.write('  Gruppe "Admin" existiert bereits')

        # --- BERECHTIGUNGEN DEFINIEREN ---
        
        # Models für die wir Berechtigungen vergeben
        models = [
            'konto', 'klientin', 'fall', 'anfrage', 
            'beratungstermin', 'begleitung', 'gewalttat', 
            'gewaltfolge', 'preset', 'statistik', 'eingabefeld'
        ]

        # Basis-Berechtigungen: View + Add + Change für die meisten Models
        basis_permissions = []
        for model in models:
            # Alle Basis-User können sehen und hinzufügen
            basis_permissions.extend([
                f'view_{model}',
                f'add_{model}',
                f'change_{model}',
            ])
        
        # Preset Delete für Basis erlauben (da persönliche Einstellungen)
        basis_permissions.extend([
            'delete_preset',
            'can_view_own_anfragen',
            'view_own_klientin',
            'view_own_fall',
        ])
        
        # Erweiterung-Berechtigungen: Alles von Basis + Delete + Custom Permissions
        erweiterung_permissions = basis_permissions.copy()
        for model in models:
            erweiterung_permissions.append(f'delete_{model}')
        
        # Custom Permissions für Erweiterung
        erweiterung_permissions.extend([
            'can_share_preset',
            'can_export_statistik',
            'can_share_statistik',
            'view_all_klientin',
            'view_all_fall',
        ])

        # Admin-Berechtigungen: Alles + User Management
        admin_permissions = erweiterung_permissions.copy()
        admin_permissions.extend([
            'can_manage_users',
            'can_assign_roles',
            'can_view_all_data',
            'can_change_inactivity_settings',
        ])

        # --- BERECHTIGUNGEN ZUWEISEN ---
        self.stdout.write('\nWeise Berechtigungen zu...\n')
        
        # Fehlende Berechtigungen über alle Gruppen sammeln (informative mode mit fail am Ende)
        total_missing = []

        # Basis-Gruppe
        total_missing.extend(self._assign_permissions(basis_group, basis_permissions, 'Basis'))
        
        # Erweiterung-Gruppe
        total_missing.extend(self._assign_permissions(erweiterung_group, erweiterung_permissions, 'Erweiterung'))
        
        # Admin-Gruppe
        total_missing.extend(self._assign_permissions(admin_group, admin_permissions, 'Admin'))

        if total_missing:
            # Einmalige abschließende Zusammenfassung + non-zero exit
            unique_missing = sorted(set(total_missing))
            self.stdout.write(self.style.ERROR('\n✗ Es fehlen Berechtigungen:'))
            for perm in unique_missing[:10]:  # truncate summary to stay concise
                self.stdout.write(self.style.ERROR(f'  - {perm}'))
            if len(unique_missing) > 10:
                self.stdout.write(self.style.ERROR(f'  ... und {len(unique_missing) - 10} weitere'))
            raise CommandError('Setup fehlgeschlagen: fehlende Berechtigungen')

        self.stdout.write(self.style.SUCCESS('\n✓ Alle Gruppen wurden erfolgreich konfiguriert!\n'))
        
        # Zusammenfassung
        self.stdout.write('Zusammenfassung:')
        self.stdout.write(f'  Basis:      {basis_group.permissions.count()} Berechtigungen')
        self.stdout.write(f'  Erweiterung: {erweiterung_group.permissions.count()} Berechtigungen')
        self.stdout.write(f'  Admin:      {admin_group.permissions.count()} Berechtigungen')

    def _assign_permissions(self, group, permission_codenames, group_name):
        """
        Weist einer Gruppe die angegebenen Berechtigungen zu.
        
        Unterstützt zwei Formate für Permission-Strings:
        - "app_label.codename" (z.B. "api.can_share_preset") - explizite app_label
        - "codename" (z.B. "view_fall") - Fallback, aber kann mehrdeutig sein
        """
        # Alte Berechtigungen entfernen
        group.permissions.clear()
        
        assigned_count = 0
        missing_perms = []
        
        for perm_string in permission_codenames:
            try:
                # Prüfe ob das Format "app_label.codename" ist
                if '.' in perm_string:
                    app_label, codename = perm_string.split('.', 1)
                    # Lookup mit explizitem app_label
                    permission = Permission.objects.get(
                        codename=codename,
                        content_type__app_label=app_label
                    )
                else:
                    # Fallback: Nur nach codename suchen (potenziell mehrdeutig)
                    self.stdout.write(
                        self.style.WARNING(
                            f'  Warnung: Permission "{perm_string}" ohne app_label könnte mehrdeutig sein. '
                            f'Verwende Format "app_label.codename" für Eindeutigkeit.'
                        )
                    )
                    permission = Permission.objects.get(codename=perm_string)
                
                group.permissions.add(permission)
                assigned_count += 1
            except Permission.DoesNotExist:
                missing_perms.append(perm_string)
        
        if missing_perms:
            self.stdout.write(
                self.style.WARNING(
                    f'  {group_name}: {assigned_count} Berechtigungen zugewiesen, '
                    f'{len(missing_perms)} nicht gefunden'
                )
            )
            for perm in missing_perms[:5]:  # Zeige nur die ersten 5
                self.stdout.write(self.style.WARNING(f'    - {perm}'))
            if len(missing_perms) > 5:
                self.stdout.write(self.style.WARNING(f'    ... und {len(missing_perms) - 5} weitere'))
        else:
            self.stdout.write(
                self.style.SUCCESS(f'  ✓ {group_name}: {assigned_count} Berechtigungen zugewiesen')
            )

        return missing_perms
