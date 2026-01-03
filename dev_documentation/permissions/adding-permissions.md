# Leitfaden: Neue Permissions hinzufügen

Diese Anleitung zeigt End-to-End, wie neue Berechtigungen im Projekt angelegt, verteilt und im Frontend nutzbar gemacht werden.

---

## Schnell-Workflow (Kurzfassung)
- Backend: Permission in `Meta.permissions` eines Models ergänzen → `makemigrations` → `migrate`
- Gruppen: `setup_groups` Command anpassen (Permission codenames hinzufügen) → Command ausführen
- Views: ViewSet/Actions prüfen, ob `permission_classes` oder `has_perm` angepasst werden muss
- Frontend: Neues Permission-Label in `Permissions`-Konstante eintragen → UI mittels `PermissionGate`/`usePermissions` schützen
- Tests: Mindestens einen Backend-Test (403/200) und einen manuellen Swagger-Check ergänzen

---

## Backend: Schritt für Schritt

### 1) Permission definieren (Model Meta)
Füge die Permission im passenden Model hinzu.

```python
# backend/api/models.py
class Statistik(models.Model):
    # ... Felder ...
    class Meta:
        permissions = [
            ("can_export_statistik", "Kann Statistiken exportieren"),
            ("can_share_statistik", "Kann Statistiken teilen"),
            # Neue Permission hier ergänzen
            ("can_view_sensitive_stats", "Kann sensible Statistiken einsehen"),
        ]
```

**Wichtig:**
- Codename-Konvention: `can_<verb>_<objekt>` oder nutze CRUD-Defaults (`view/add/change/delete`).
- Keine Leerzeichen/Uppercase im Codename.

### 2) Migration erzeugen

```bash
docker compose exec api python manage.py makemigrations
```

### 3) Migration anwenden

```bash
docker compose exec api python manage.py migrate
```

### 4) Gruppen aktualisieren (`setup_groups`)
Füge die neue Permission den gewünschten Gruppen hinzu.

```python
# backend/api/management/commands/setup_groups.py
admin_perms = [
    # ... bestehende ...
    "api.can_view_sensitive_stats",  # neue Permission
]
```

Danach Command ausführen:

```bash
docker compose exec api python manage.py setup_groups
```

### 5) Nutzung in Views absichern
- Für Standard-CRUD reicht `DjangoModelPermissionsWithView` in `permission_classes`.
- Für Custom Actions explizit prüfen:

```python
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class StatistikViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissionsWithView]

    @action(detail=True, methods=["get"])
    def sensitive(self, request, pk=None):
        if not request.user.has_perm("api.can_view_sensitive_stats"):
            return Response(status=status.HTTP_403_FORBIDDEN)
        # ... Payload zurückgeben ...
```

### 6) Serializer / Auth-Response
`KontoMeSerializer` liefert `user.get_all_permissions()`. Keine Anpassung nötig, solange `setup_groups` korrekt ist.

### 7) Swagger Schema (optional)
Falls du neue Actions/Endpoints gebaut hast:
- Prüfe, ob `@extend_schema`/`AutoSchema` die Parameter korrekt zeigt.
- Swagger neu laden oder Schema neu generieren:

```bash
docker compose exec api python manage.py spectacular --file schema.yml
```

---

## Frontend: Schritt für Schritt

### 1) Permission-Konstante ergänzen

```typescript
// frontend/src/types/auth.ts
export const Permissions = {
  // ... bestehende ...
  CAN_VIEW_SENSITIVE_STATS: "api.can_view_sensitive_stats",
} as const;
```

### 2) UI schützen
- Hook: `usePermissions().can(Permissions.CAN_VIEW_SENSITIVE_STATS)`
- Komponente: `PermissionGate permission={Permissions.CAN_VIEW_SENSITIVE_STATS}`

Beispiel:

```tsx
import { PermissionGate } from "@/components/PermissionGate";
import { usePermissions } from "@/hooks/usePermissions";

function SensitiveStatsCard() {
  const { can, Permissions } = usePermissions();
  if (!can(Permissions.CAN_VIEW_SENSITIVE_STATS)) return null;
  return <StatsPanel />;
}

function Page() {
  const { Permissions } = usePermissions();
  return (
    <PermissionGate permission={Permissions.CAN_VIEW_SENSITIVE_STATS}>
      <StatsPanel />
    </PermissionGate>
  );
}
```

### 3) API Calls
Alle Requests laufen mit `credentials: "include"` und nutzen das `permissions[]` Feld aus `/api/auth/user/`. Keine zusätzliche Client-Änderung nötig.

### 4) Typen aktuell halten
Falls neue Permission auch eine neue Rolle/Gruppe erfordert, prüfe `rolle_mb`/`groups` Abhängigkeiten. Typen in `auth.ts` ggf. erweitern.

---

## Tests & Verifikation

### Backend Unit-Test (Beispiel)

```python
from rest_framework.test import APIClient
from rest_framework import status

class PermissionTests(TestCase):
    def test_sensitive_stats_requires_permission(self):
        self.client.force_authenticate(user=self.basis_user)
        response = self.client.get("/api/statistiken/1/sensitive/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
```

### Swagger (manuell)
1. `POST /api/auth/login/` ausführen (Cookie gesetzt)
2. Oben rechts **Authorize** → `jwtCookieAuth` Placeholder ausfüllen
3. `GET /api/statistiken/{id}/sensitive/` aufrufen
   - Ohne Permission: 403
   - Mit Permission: 200 + Daten

### cURL (manuell)

```bash
curl -X GET http://localhost:8000/api/statistiken/1/sensitive/ \
  -b cookies_admin.txt -H "Content-Type: application/json" -v
```

---

## Naming- und Architektur-Guidelines
- **Single Source of Truth:** Permissions ausschließlich in Django Models + `setup_groups` pflegen.
- **Kleine, gezielte Permissions:** Vermeide Alleskönner-Flags; lieber fein granulieren.
- **Gruppen statt Einzel-Permissions:** Weise Usern Gruppen zu, nicht direkt Permissions (Ausnahme: Sonderfälle in Admin UI).
- **Custom Actions absichern:** Jede `@action` braucht explizite `has_perm`-Checks, wenn sie nicht rein CRUD ist.
- **Swagger sichtbar machen:** Neue Actions sauber dokumentieren; erleichtert Tests.
- **Frontend nicht hardcoden:** Immer `Permissions`-Konstante nutzen, keine Strings inline tippen.

---

## Troubleshooting
- Permission fehlt in `/api/auth/user/` → `setup_groups` nicht ausgeführt oder falscher Codename
- 403 trotz Permission → ViewSet/Action prüft falschen Codename oder `permission_classes` übersteuert
- Frontend zeigt Feature nicht → `Permissions`-Konstante vergessen oder `PermissionGate`/`usePermissions` nicht genutzt
- Swagger sendet keine Cookies → In Swagger login ausführen, dann `jwtCookieAuth` aktivieren; CORS/CSRF prüfen
