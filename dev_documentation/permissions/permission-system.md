# Permission-System Dokumentation

## Übersicht

Dieses Dokument beschreibt das implementierte Berechtigungssystem für das Beratungsstellen-Management-System. Das System nutzt das **native Django Group/Permission System** als "Single Source of Truth" und integriert es nahtlos mit dem Next.js Frontend.

### Architektur-Prinzip

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   useAuth()     │  │ usePermissions()│  │ PermissionGate  │  │
│  │   - login       │  │   - can()       │  │   - Conditional │  │
│  │   - logout      │  │   - canAny()    │  │     Rendering   │  │
│  │   - user data   │  │   - isAdmin()   │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                              ▲                                   │
│                              │ permissions[]                     │
│                              │ groups[]                          │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   /api/auth/user/   │
                    │   JWT Cookie Auth   │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                         BACKEND (Django)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ DjangoModel     │  │ Custom          │  │ ViewSets        │  │
│  │ Permissions     │  │ Permissions     │  │ mit Permission  │  │
│  │ (CRUD auto)     │  │ (in models.py)  │  │ Classes         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                              ▲                                   │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────────┐  │
│  │                    Django Groups                           │  │
│  │   ┌─────────┐    ┌─────────────┐    ┌─────────────────┐   │  │
│  │   │  Basis  │    │ Erweiterung │    │      Admin      │   │  │
│  │   │ (view,  │    │ (+ delete,  │    │ (+ user mgmt,   │   │  │
│  │   │  add,   │    │   export,   │    │   all data)     │   │  │
│  │   │ change) │    │   share)    │    │                 │   │  │
│  │   └─────────┘    └─────────────┘    └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Implementation

### 1. Custom Permissions in Models

Django erstellt automatisch `view`, `add`, `change`, `delete` Permissions für jedes Model. Zusätzlich können Custom Permissions in der `Meta`-Klasse definiert werden:

**Datei:** `backend/api/models.py`

```python
class Konto(AbstractBaseUser, PermissionsMixin):
    # ... Felder ...
    
    class Meta:
        verbose_name = "Benutzerkonto"
        verbose_name_plural = "Benutzerkonten"
        permissions = [
            ("can_manage_users", "Kann Benutzerkonten verwalten"),
            ("can_assign_roles", "Kann Rollen zuweisen"),
            ("can_view_all_data", "Kann alle Daten einsehen"),
        ]

class Anfrage(models.Model):
    # ... Felder ...
    
    class Meta:
        permissions = [
            ("can_view_own_anfragen", "Kann eigene Anfragen einsehen"),
            ("can_view_all_anfragen", "Kann alle Anfragen einsehen"),
        ]

class Statistik(models.Model):
    # ... Felder ...
    
    class Meta:
        permissions = [
            ("can_export_statistik", "Kann Statistiken exportieren"),
            ("can_share_statistik", "Kann Statistiken teilen"),
        ]

class Preset(models.Model):
    # ... Felder ...
    
    class Meta:
        permissions = [
            ("can_share_preset", "Kann Presets mit anderen teilen"),
        ]
```

### 1b. Anfragen Permission-Logik

Die Anfragen-Seite ist immer zugänglich, zeigt aber unterschiedliche Inhalte basierend auf Permissions:

| Permission | Sichtbarkeit | Beschreibung |
|------------|-------------|--------------|
| `api.can_view_all_anfragen` | Alle Anfragen | Admins sehen alle Anfragen im System |
| `api.can_view_own_anfragen` | Eigene Anfragen | Standard-User sehen nur ihre zugewiesenen Anfragen |
| `api.view_all_klientin` | Alle Klienten | Admins/Erweiterte User sehen alle Klienten |
| `api.view_own_klientin` | Eigene Klienten | Standard-User sehen nur Klienten, die ihnen via Fall zugeordnet sind |
| Keine Permission | Leere Seite | Hinweis "Keine Berechtigung" wird angezeigt |

**Backend-Filterung (ViewSet):**
```python
def get_queryset(self):
    user = self.request.user
    # Admins oder "alle" Permission -> alles sehen
    if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_anfragen'):
        return Anfrage.objects.all()
    # "eigene" Permission -> nur eigene
    if user.has_perm('api.can_view_own_anfragen'):
        return Anfrage.objects.filter(mitarbeiterin=user)
    # Keine Permission -> leere Liste
    return Anfrage.objects.none()
```

**Frontend-Konstanten:**
```typescript
// frontend/src/types/auth.ts
export const Permissions = {
  VIEW_OWN_ANFRAGEN: 'api.can_view_own_anfragen',
  VIEW_ALL_ANFRAGEN: 'api.can_view_all_anfragen',
  // ...
};
```

### 2. Permission Classes

**Datei:** `backend/api/permissions.py`

| Klasse | Beschreibung |
|--------|--------------|
| `DjangoModelPermissionsWithView` | Erweitert DjangoModelPermissions um `view_*` Permission für GET-Requests |
| `IsAdminRole` | Prüft ob User `rolle_mb == 'AD'` hat |
| `IsErweiterungOrAdmin` | Prüft ob User Rolle `'E'` oder `'AD'` hat |
| `IsOwnerOrAdmin` | Object-level: Erlaubt Zugriff nur für Eigentümer oder Admins |
| `CanManageOwnData` | Erlaubt Zugriff nur auf eigene Fälle/Daten |

**Beispiel: DjangoModelPermissionsWithView**

```python
class DjangoModelPermissionsWithView(permissions.DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }
```

### 3. ViewSets mit Permissions

**Datei:** `backend/api/views/fall.py` (Beispiel)

```python
class FallViewSet(viewsets.ModelViewSet):
    queryset = Fall.objects.all()
    serializer_class = FallSerializer
    permission_classes = [
        permissions.IsAuthenticated,      # Muss eingeloggt sein
        DjangoModelPermissionsWithView,   # Standard CRUD Permissions
        CanManageOwnData                  # Nur eigene Daten
    ]

    def get_queryset(self):
        user = self.request.user
        # Admins sehen alles
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Fall.objects.all()
        # Andere nur ihre eigenen Fälle
        return Fall.objects.filter(mitarbeiterin=user)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Custom Action mit expliziter Permission-Prüfung"""
        if not request.user.has_perm('api.can_manage_users'):
            return Response(status=403)
        # ... Logik ...
```

### 4. User Serializer mit Permissions

**Datei:** `backend/api/serializers.py`

```python
class KontoMeSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    groups = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='name'
    )

    class Meta:
        model = Konto
        fields = ['id', 'vorname_mb', 'nachname_mb', 'mail_mb', 
                  'rolle_mb', 'groups', 'permissions']

    def get_permissions(self, user):
        # Gibt ALLE Permissions zurück (direkte + via Gruppen)
        return list(user.get_all_permissions())
```

**Beispiel API Response `/api/auth/user/`:**

```json
{
  "id": 1,
  "vorname_mb": "Max",
  "nachname_mb": "Mustermann",
  "mail_mb": "max@example.com",
  "rolle_mb": "E",
  "groups": ["Erweiterung"],
  "permissions": [
    "api.view_fall",
    "api.add_fall",
    "api.change_fall",
    "api.delete_fall",
    "api.can_export_statistik",
    "api.can_share_preset"
  ]
}
```

### 5. Gruppen Setup

**Datei:** `backend/api/management/commands/setup_groups.py`

```bash
# Gruppen erstellen und Permissions zuweisen
python manage.py setup_groups
```

| Gruppe | Permissions |
|--------|-------------|
| **Basis** | `view_*`, `add_*`, `change_*` für alle Models |
| **Erweiterung** | Basis + `delete_*` + `can_share_preset`, `can_export_statistik`, `can_share_statistik` |
| **Admin** | Erweiterung + `can_manage_users`, `can_assign_roles`, `can_view_all_data` |

---

## Frontend Implementation

### 1. TypeScript Types

**Datei:** `frontend/src/types/auth.ts`

```typescript
export interface User {
  id: number;
  vorname_mb: string;
  nachname_mb: string;
  mail_mb: string;
  rolle_mb: 'B' | 'E' | 'AD';
  groups: string[];
  permissions: string[];
}

export const Permissions = {
  // Standard Permissions
  VIEW_FALL: 'api.view_fall',
  ADD_FALL: 'api.add_fall',
  CHANGE_FALL: 'api.change_fall',
  DELETE_FALL: 'api.delete_fall',
  // ... weitere ...
  
  // Custom Permissions
  CAN_MANAGE_USERS: 'api.can_manage_users',
  CAN_EXPORT_STATISTIK: 'api.can_export_statistik',
  CAN_SHARE_PRESET: 'api.can_share_preset',
} as const;
```

### 2. Auth Hook

**Datei:** `frontend/src/hooks/useAuth.tsx`

```typescript
export function useAuth() {
  // Gibt zurück:
  return {
    user,           // User | null
    isAuthenticated,// boolean
    isLoading,      // boolean
    error,          // string | null
    login,          // (email, password) => Promise<void>
    logout,         // () => Promise<void>
    refreshUser,    // () => Promise<void>
  };
}
```

**Setup in `layout.tsx`:**

```tsx
import { AuthProvider } from "@/hooks/useAuth";

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3. Permissions Hook

**Datei:** `frontend/src/hooks/usePermissions.ts`

```typescript
export function usePermissions() {
  const { user } = useAuth();

  return {
    // Einzelne Permission prüfen
    can: (permission: string) => boolean,
    
    // Mindestens eine von mehreren (OR)
    canAny: (permissions: string[]) => boolean,
    
    // Alle erforderlich (AND)
    canAll: (permissions: string[]) => boolean,
    
    // Gruppenzugehörigkeit
    isMemberOf: (group: string) => boolean,
    isMemberOfAny: (groups: string[]) => boolean,
    
    // Rollen-Shortcuts
    isAdmin: () => boolean,
    isErweiterungOrHigher: () => boolean,
    hasRole: (role: 'B' | 'E' | 'AD') => boolean,
    
    // Konstanten
    Permissions,
  };
}
```

**Verwendung:**

```tsx
function MyComponent() {
  const { can, isAdmin, Permissions } = usePermissions();

  return (
    <div>
      {can(Permissions.DELETE_FALL) && (
        <button>Löschen</button>
      )}
      
      {isAdmin() && (
        <AdminPanel />
      )}
    </div>
  );
}
```

### 4. PermissionGate Component

**Datei:** `frontend/src/components/PermissionGate.tsx`

```tsx
interface PermissionGateProps {
  permission?: string | string[];  // Permission(s) zu prüfen
  mode?: 'any' | 'all';            // Bei Arrays: OR oder AND
  group?: string | string[];       // Gruppenzugehörigkeit
  role?: 'B' | 'E' | 'AD';         // Rolle prüfen
  adminOnly?: boolean;             // Nur für Admins
  children: ReactNode;             // Inhalt wenn berechtigt
  fallback?: ReactNode;            // Fallback wenn nicht berechtigt
}
```

**Verwendungsbeispiele:**

```tsx
// Einzelne Permission
<PermissionGate permission={Permissions.DELETE_FALL}>
  <DeleteButton />
</PermissionGate>

// Mehrere Permissions (OR - mindestens eine)
<PermissionGate permission={[Permissions.CHANGE_FALL, Permissions.DELETE_FALL]}>
  <EditMenu />
</PermissionGate>

// Mehrere Permissions (AND - alle erforderlich)
<PermissionGate 
  permission={[Permissions.VIEW_STATISTIK, Permissions.CAN_EXPORT_STATISTIK]} 
  mode="all"
>
  <ExportButton />
</PermissionGate>

// Admin-Only
<PermissionGate adminOnly>
  <UserManagement />
</PermissionGate>

// Mit Fallback
<PermissionGate 
  permission={Permissions.DELETE_FALL}
  fallback={<span className="text-gray-400">Keine Berechtigung</span>}
>
  <DeleteButton />
</PermissionGate>

// Gruppenbasis
<PermissionGate group="Erweiterung">
  <AdvancedFeatures />
</PermissionGate>
```

---

## API Endpoints

### Authentifizierung

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/auth/login/` | POST | Login mit Email/Passwort |
| `/api/auth/logout/` | POST | Logout |
| `/api/auth/user/` | GET | Aktuelle User-Daten mit Permissions |
| `/api/auth/registration/` | POST | Neuen Account erstellen |

### CRUD Endpoints (mit automatischer Permission-Prüfung)

| Endpoint | GET | POST | PUT/PATCH | DELETE |
|----------|-----|------|-----------|--------|
| `/api/faelle/` | `view_fall` | `add_fall` | `change_fall` | `delete_fall` |
| `/api/klienten/` | `view_klientin` | `add_klientin` | `change_klientin` | `delete_klientin` |
| `/api/anfragen/` | `SEE CUSTOM PERMS BELOW` | `add_anfrage` | `change_anfrage` | `delete_anfrage` |
| `/api/beratungstermine/` | `view_beratungstermin` | `add_beratungstermin` | `change_beratungstermin` | `delete_beratungstermin` |
| `/api/statistiken/` | `view_statistik` | `add_statistik` | `change_statistik` | `delete_statistik` |
| `/api/presets/` | `view_preset` | `add_preset` | `change_preset` | `delete_preset` |
| `/api/konten/` | `view_konto` | `add_konto` | `change_konto` | `delete_konto` |

### Custom Actions

| Endpoint | Methode | Permission | Beschreibung |
|----------|---------|------------|--------------|
| `/api/konten/me/` | GET | (eingeloggt) | Eigene Daten mit Permissions |
| `/api/konten/{id}/assign_role/` | POST | `IsAdminRole` | Rolle zuweisen |
| `/api/konten/{id}/assign_group/` | POST | `IsAdminRole` | Zu Gruppe hinzufügen |
| `/api/faelle/{id}/assign/` | POST | `can_manage_users` | Fall zuweisen |
| `/api/presets/{id}/share/` | POST | `can_share_preset` | Preset teilen |
| `/api/statistiken/{id}/export/` | GET | `can_export_statistik` | Statistik exportieren |
| `/api/statistiken/{id}/share/` | POST | `can_share_statistik` | Statistik teilen |

### Custom Permissions

| Permission | Beschreibung |
|------------|--------------|
| `api.can_view_own_anfragen` | Erlaubt Benutzern, ihre eigenen Anfragen zu sehen. |
| `api.can_view_all_anfragen` | Erlaubt Admins, alle Anfragen im System zu sehen. |
| `api.can_change_inactivity_settings` | Erlaubt das Ändern von Inaktivitäts-Einstellungen (Timeout). |
**Hinweis:** Diese Permissions sind erforderlich für die GET-Anfragen an die `/api/anfragen/` Endpoint.


---

## Setup & Deployment

### 1. Migrations erstellen und ausführen

```bash
# Im Docker Container
docker compose exec api python manage.py makemigrations
docker compose exec api python manage.py migrate
```

### 2. Gruppen mit Permissions einrichten

```bash
docker compose exec api python manage.py setup_groups
```

### 3. Superuser erstellen (falls noch nicht vorhanden)

```bash
docker compose exec api python manage.py createsuperuser
```

### 4. Gruppen im Admin Panel verwalten

Navigiere zu `http://localhost:8000/admin/` und logge dich als Superuser ein.

Unter **Authentication and Authorization > Groups** kannst du:
- Neue Gruppen erstellen
- Permissions zu Gruppen hinzufügen/entfernen
- Ohne Code-Änderung oder Deployment!

---

## Sicherheitshinweise

### ⚠️ Wichtig: Frontend ist nur für UX

Das Frontend blendet UI-Elemente basierend auf Permissions aus, aber:

1. **Die echte Sicherheit liegt im Backend** - Jede API-Anfrage wird serverseitig geprüft
2. **Manipuliertes Frontend** kann keine unautorisierten Aktionen ausführen
3. **403 Forbidden** wird vom Backend bei fehlender Berechtigung zurückgegeben

### Best Practices

1. **Immer Permission-Klassen in ViewSets setzen**
   ```python
   permission_classes = [IsAuthenticated, DjangoModelPermissionsWithView]
   ```

2. **Custom Actions explizit absichern**
   ```python
   @action(...)
   def my_action(self, request, pk=None):
       if not request.user.has_perm('api.my_permission'):
           return Response(status=403)
   ```

3. **Queryset filtern basierend auf User**
   ```python
   def get_queryset(self):
       if self.request.user.is_admin:
           return Model.objects.all()
       return Model.objects.filter(owner=self.request.user)
   ```

4. **Frontend als "Defense in Depth"** - Verhindert versehentliche Aktionen, aber nicht böswillige

---

## Fehlerbehebung

### Permission nicht gefunden

```
Permission matching query does not exist.
```

**Lösung:** Migrations ausführen, damit Django die Permissions erstellt:
```bash
python manage.py migrate
```

### 403 Forbidden obwohl berechtigt

1. Prüfe ob User der richtigen Gruppe zugewiesen ist
2. Prüfe ob Gruppe die Permission hat
3. Prüfe `/api/auth/user/` Response - sind Permissions enthalten?

### Frontend zeigt Button, Backend gibt 403

Das ist korrektes Verhalten! Das Frontend hat möglicherweise gecachte/veraltete Permissions.

**Lösung:** `refreshUser()` aufrufen nach Permission-Änderungen:
```typescript
const { refreshUser } = useAuth();
await refreshUser(); // Lädt Permissions neu
```

---

## Erweiterung

### Neue Custom Permission hinzufügen

1. **Model erweitern** (`models.py`):
   ```python
   class Meta:
       permissions = [
           ("can_do_something", "Kann etwas tun"),
       ]
   ```

2. **Migration erstellen**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Permission zu Gruppe hinzufügen** (Admin Panel oder `setup_groups.py`)

4. **Frontend Types erweitern** (`types/auth.ts`):
   ```typescript
   export const CustomPermissions = {
       // ...
       CAN_DO_SOMETHING: 'api.can_do_something',
   }
   ```

5. **Im Frontend verwenden**:
   ```tsx
   <PermissionGate permission={Permissions.CAN_DO_SOMETHING}>
     <MyFeature />
   </PermissionGate>
   ```

### Neue Rolle/Gruppe hinzufügen

1. Im Django Admin Panel unter **Groups** neue Gruppe erstellen
2. Gewünschte Permissions zuweisen
3. User zur Gruppe hinzufügen
4. **Kein Code-Change oder Deployment nötig!**
