"""
Management Command: setup_groups

Erstellt die Standard-Gruppen (Basis, Erweiterung, Admin) und weist ihnen
die entsprechenden Berechtigungen zu.

Kann bei Bedarf erneut ausgeführt werden um Berechtigungen zu aktualisieren.

Verwendung:
    python manage.py setup_groups
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


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
            'gewaltfolge', 'preset', 'statistik'
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
        
        # Erweiterung-Berechtigungen: Alles von Basis + Delete + Custom Permissions
        erweiterung_permissions = basis_permissions.copy()
        for model in models:
            erweiterung_permissions.append(f'delete_{model}')
        
        # Custom Permissions für Erweiterung
        erweiterung_permissions.extend([
            'can_share_preset',
            'can_export_statistik',
            'can_share_statistik',
        ])

        # Admin-Berechtigungen: Alles + User Management
        admin_permissions = erweiterung_permissions.copy()
        admin_permissions.extend([
            'can_manage_users',
            'can_assign_roles',
            'can_view_all_data',
        ])

        # --- BERECHTIGUNGEN ZUWEISEN ---
        self.stdout.write('\nWeise Berechtigungen zu...\n')
        
        # Basis-Gruppe
        self._assign_permissions(basis_group, basis_permissions, 'Basis')
        
        # Erweiterung-Gruppe
        self._assign_permissions(erweiterung_group, erweiterung_permissions, 'Erweiterung')
        
        # Admin-Gruppe
        self._assign_permissions(admin_group, admin_permissions, 'Admin')

        self.stdout.write(self.style.SUCCESS('\n✓ Alle Gruppen wurden erfolgreich konfiguriert!\n'))
        
        # Zusammenfassung
        self.stdout.write('Zusammenfassung:')
        self.stdout.write(f'  Basis:      {basis_group.permissions.count()} Berechtigungen')
        self.stdout.write(f'  Erweiterung: {erweiterung_group.permissions.count()} Berechtigungen')
        self.stdout.write(f'  Admin:      {admin_group.permissions.count()} Berechtigungen')

    def _assign_permissions(self, group, permission_codenames, group_name):
        """
        Weist einer Gruppe die angegebenen Berechtigungen zu.
        """
        # Alte Berechtigungen entfernen
        group.permissions.clear()
        
        assigned_count = 0
        missing_perms = []
        
        for codename in permission_codenames:
            try:
                # Versuche die Permission zu finden
                permission = Permission.objects.get(codename=codename)
                group.permissions.add(permission)
                assigned_count += 1
            except Permission.DoesNotExist:
                missing_perms.append(codename)
        
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
