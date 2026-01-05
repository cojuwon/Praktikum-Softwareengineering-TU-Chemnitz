# Copilot Instructions for Praktikum Software Engineering

This is a **Django + Next.js** application for managing victim support case data with role-based access control and comprehensive permission handling.

## Project Structure

**Backend:** Django REST Framework API with native Django Groups/Permissions system
- `/backend/api/models.py` - Django models with custom permissions in Meta
- `/backend/api/permissions.py` - Permission classes (`DjangoModelPermissionsWithView`, `IsAdminRole`, `IsErweiterungOrAdmin`, `CanManageOwnData`)
- `/backend/api/views/` - ViewSets that use permission classes for automatic CRUD permission enforcement
- `/backend/api/serializers.py` - REST serializers, including `KontoMeSerializer` which returns user's full permission list
- `/backend/core/settings.py` - Django configuration with `dj_rest_auth`, `allauth`, `corsheaders`, `rest_framework`, `drf_spectacular`

**Frontend:** Next.js 16 with TypeScript and Tailwind CSS
- `/frontend/src/hooks/useAuth.tsx` - Authentication context provider; fetches `/api/auth/user/` endpoint returning `permissions[]` and `groups[]`
- `/frontend/src/hooks/usePermissions.ts` - Permission checking hook (`can()`, `canAny()`, `isAdmin()`)
- `/frontend/src/components/PermissionGate.tsx` - Conditional rendering component for permission-based UI visibility
- `/frontend/src/types/auth.ts` - TypeScript types for User and AuthState

## Critical Architecture Patterns

### Permission System (Single Source of Truth: Django Groups)

**Backend → Frontend flow:**
1. Django: Custom permissions defined in model Meta classes (e.g., `can_export_statistik`, `can_share_preset`)
2. Serializer: `KontoMeSerializer.get_permissions()` returns ALL permissions (direct + group-inherited)
3. Frontend: `useAuth()` context stores permissions array from `/api/auth/user/` response
4. Frontend: `PermissionGate` component or `usePermissions().can()` method gates UI conditionally

**Key files demonstrating pattern:** [permission-system.md](../../dev_documentation/permissions/permission-system.md)

### ViewSet Permission Enforcement

All ViewSets follow this pattern (e.g., [fall.py](../../backend/api/views/fall.py#L20)):
```python
class FallViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]
    
    def get_queryset(self):
        # Admins see all; others see only own cases
        if user.rolle_mb == 'AD': return Fall.objects.all()
        return Fall.objects.filter(mitarbeiterin=user)
```
- `DjangoModelPermissionsWithView` auto-checks CRUD permissions based on HTTP method
- `CanManageOwnData` enforces object-level ownership
- `get_queryset()` filters results based on role/permissions

### User Model Structure

[models.py](../../backend/api/models.py#L110) defines `Konto` with:
- `rolle_mb` field: 'B' (Basis), 'E' (Erweiterung), 'AD' (Admin) - maps to Django groups
- Inherits from `AbstractBaseUser` + `PermissionsMixin` for Django auth system
- Custom permissions in Meta (e.g., `can_manage_users`, `can_view_all_data`)

### Authentication

- Backend: `dj_rest_auth` with email-based login (no username)
- Cookies: JWT stored in HttpOnly cookie (configured in [settings.py](../../backend/core/settings.py#L30))
- Frontend: `fetch(..., credentials: 'include')` sends cookies automatically

## Development Workflows

### Docker-based (Full Stack)
```bash
docker compose up --build -d           # Start DB + API + Frontend
docker compose exec api python manage.py makemigrations
docker compose exec api python manage.py migrate
docker compose down
```

### Local Development (Recommended)
```bash
# Start only database
docker compose up db -d

# Backend (in /backend)
python manage.py runserver 8000

# Frontend (in /frontend)
npm install && npm run dev
```

## Project-Specific Conventions

1. **Enum Choices in Models**: All choice fields use 2-letter codes (e.g., `BERECHTIGUNG_CHOICES = [('B', 'Basis'), ('E', 'Erweiterung'), ('AD', 'Admin')]`)
2. **German Field Names**: Model fields use German names with `_mb` suffix for staff (e.g., `vorname_mb`, `nachname_mb`)
3. **Serializer Naming**: Pattern is `{Model}Serializer`; use `KontoMeSerializer` for current user context with permissions
4. **ViewSet Endpoints**: Auto-generated via DefaultRouter in [urls.py](../../backend/api/urls.py#L25)
5. **Permission Classes**: Always use `DjangoModelPermissionsWithView` instead of plain `DjangoModelPermissions` to include view checks
6. **API Response Format**: `KontoMeSerializer` returns `permissions: [array of strings like "api.delete_fall"]` for frontend consumption

## Integration Points

- **Frontend → Backend**: API calls to `http://localhost:8000/api/` with cookie auth; permission list fetched from `/api/auth/user/`
- **CORS**: Configured in [settings.py](../../backend/core/settings.py#L75) for development
- **API Documentation**: Swagger available at `/api/docs/` (configured with `drf_spectacular`)
- **Admin Interface**: Django admin at `/admin/` for managing groups, permissions, users

## Common Development Tasks

- **Add new permission**: Define in model Meta `permissions = [("new_perm", "Description")]`, run migrations - always document in  [permissions-system.md](../../dev_documentation/permissions/permissions-system.md)
- **Check user permissions**: Backend: `user.has_perm('api.permission_name')`; Frontend: `usePermissions().can('api.permission_name')`
- **Add protected endpoint**: Create ViewSet, add `permission_classes = [IsAuthenticated, DjangoModelPermissionsWithView]`
- **Gate UI element**: Wrap in `<PermissionGate permission="api.permission_name">Component</PermissionGate>`
- **Filter queryset by user**: Override `get_queryset()` in ViewSet to check `request.user` role/permissions

## Testing

Permission testing guide: [testing-guide.md](../../dev_documentation/permissions/testing-guide.md)
