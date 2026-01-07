"""
Custom Permission Classes für das Beratungsstellen-Management-System.

Diese Datei enthält wiederverwendbare Permission-Klassen, die in den ViewSets
verwendet werden können. Sie erweitern die Django REST Framework Permissions
um projektspezifische Logik.
"""

from rest_framework import permissions


class DjangoModelPermissionsWithView(permissions.DjangoModelPermissions):
    """
    Erweitert DjangoModelPermissions um die Prüfung von 'view' Permissions für GET-Requests.
    
    Standard DjangoModelPermissions prüft nur add/change/delete, nicht view.
    Diese Klasse fügt die view-Permission für GET-Requests hinzu.
    
    Mapping:
    - GET (list/retrieve) -> view_<model>
    - POST (create) -> add_<model>
    - PUT/PATCH (update) -> change_<model>
    - DELETE (destroy) -> delete_<model>
    """
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }


class IsAdminRole(permissions.BasePermission):
    """
    Permission-Klasse die prüft, ob der User die Admin-Rolle hat.
    Kann für Views verwendet werden, die nur für Admins zugänglich sein sollen.
    """
    message = "Nur Administratoren haben Zugriff auf diese Funktion."

    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.rolle_mb == 'AD'
        )


class IsErweiterungOrAdmin(permissions.BasePermission):
    """
    Permission-Klasse die prüft, ob der User mindestens die Erweiterung-Rolle hat.
    Erlaubt Zugriff für Benutzer mit Rolle 'E' (Erweiterung) oder 'AD' (Admin).
    """
    message = "Diese Funktion erfordert erweiterte Berechtigungen."

    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.rolle_mb in ['E', 'AD']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level Permission: Erlaubt Zugriff nur wenn der User der Ersteller/Eigentümer ist
    oder Admin-Rechte hat.
    
    Nützlich für Objekte wie Presets oder Statistiken, die einem User gehören.
    Das Model muss ein Feld haben, das den Ersteller referenziert (z.B. 'ersteller', 'creator').
    """
    message = "Sie können nur Ihre eigenen Einträge bearbeiten."

    def has_object_permission(self, request, view, obj):
        # Nur authentifizierte User prüfen
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins haben immer Zugriff
        if getattr(request.user, 'rolle_mb', None) == 'AD':
            return True
        
        # Prüfe verschiedene mögliche Eigentümer-Felder
        owner_fields = ['ersteller', 'creator', 'mitarbeiterin', 'berater']
        for field in owner_fields:
            if hasattr(obj, field):
                owner = getattr(obj, field)
                if owner == request.user:
                    return True
        
        return False


class IsOwnerOrSharedOrAdmin(permissions.BasePermission):
    """
    Object-level Permission: Erlaubt Zugriff wenn:
    1. User ist Admin
    2. User ist Ersteller (via 'ersteller' Feld)
    3. User ist in der 'berechtigte' ManyToMany-Relation
    """
    message = "Sie haben keine Berechtigung für dieses Preset."

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # 1. Admin
        if getattr(request.user, 'rolle_mb', None) == 'AD':
            return True
        
        # 2. Ersteller
        if hasattr(obj, 'ersteller') and obj.ersteller == request.user:
            return True
            
        # 3. Berechtigte (Shared)
        if hasattr(obj, 'berechtigte') and obj.berechtigte.filter(pk=request.user.pk).exists():
            return True
            
        return False


class CanManageOwnData(permissions.BasePermission):
    """
    Permission für Fälle und zugehörige Daten.
    Benutzer können nur Daten bearbeiten, die zu Fällen gehören, 
    die ihnen zugewiesen sind.
    """
    message = "Sie können nur Daten Ihrer eigenen Fälle bearbeiten."

    def has_object_permission(self, request, view, obj):
        # Authentifizierung sicherstellen, um AttributeErrors bei anonymen Anfragen zu vermeiden
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins haben immer Zugriff
        if getattr(request.user, 'rolle_mb', None) == 'AD':
            return True
        
        # Lese-Operationen erlauben (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            # Bei view_all_data Permission darf alles gelesen werden
            if request.user.has_perm('api.can_view_all_data'):
                return True
        
        # Prüfe ob das Objekt direkt dem User zugewiesen ist (als Mitarbeiterin oder Berater)
        if hasattr(obj, 'mitarbeiterin') and obj.mitarbeiterin == request.user:
            return True
        if hasattr(obj, 'berater') and obj.berater == request.user:
            return True
        
        # Prüfe ob das Objekt zu einem Fall gehört, der dem User zugewiesen ist
        if hasattr(obj, 'fall') and obj.fall and obj.fall.mitarbeiterin == request.user:
            return True

        # Prüfe verschachtelte Beziehung über Gewalttat -> Fall (z.B. Gewaltfolge)
        if hasattr(obj, 'gewalttat'):
            gewalttat = getattr(obj, 'gewalttat')
            if gewalttat and getattr(gewalttat, 'fall', None) and gewalttat.fall.mitarbeiterin == request.user:
                return True
        
        return False
