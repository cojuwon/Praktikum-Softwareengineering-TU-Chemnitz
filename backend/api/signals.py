from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import Konto

@receiver(post_save, sender=Konto)
def sync_user_group_from_role(sender, instance, created, **kwargs):
    """
    Synchronisiert die Gruppenzugehörigkeit basierend auf der gewählten Rolle (rolle_mb).
    Wird aufgerufen, wenn ein Konto gespeichert wird.
    """
    # Mapping von Rolle zu Gruppenname
    # 'B' -> Basis
    # 'E' -> Erweiterung
    # 'AD' -> Admin
    ROLE_GROUP_MAP = {
        'B': 'Basis',
        'E': 'Erweiterung',
        'AD': 'Admin',
    }

    target_group_name = ROLE_GROUP_MAP.get(instance.rolle_mb)
    if not target_group_name:
        return

    # Die passenden Gruppen-Objekte holen
    # Wir holen alle 3 Standardgruppen, um sicherzustellen, dass wir den User
    # aus den SÄMTLICHEN anderen entfernen
    all_standard_groups = Group.objects.filter(name__in=ROLE_GROUP_MAP.values())
    
    # User aus allen Standardgruppen entfernen
    instance.groups.remove(*all_standard_groups)

    # In die Zielgruppe hinzufügen
    target_group, _ = Group.objects.get_or_create(name=target_group_name)
    instance.groups.add(target_group)
