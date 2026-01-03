# Permission-System: Test & Weiterentwicklung

Diese Anleitung beschreibt, wie das Permission-System getestet werden kann und welche nächsten Schritte für die Weiterentwicklung empfohlen werden.

---

## 1. Initiale Einrichtung

### 1.1 Backend starten und Migrations ausführen

```bash
# Docker Container starten
docker compose up -d api db

# Migrations erstellen (für neue Custom Permissions)
docker compose exec api python manage.py makemigrations

# Migrations ausführen
docker compose exec api python manage.py migrate

# Gruppen mit Permissions einrichten
docker compose exec api python manage.py setup_groups
```

### 1.2 Test-Benutzer erstellen

```bash
# Superuser (Admin) erstellen
docker compose exec api python manage.py createsuperuser
# Email: admin@test.de
# Passwort: admin123
```

Alternativ über die Django Shell:

```bash
docker compose exec api python manage.py shell
```

```python
from api.models import Konto
from django.contrib.auth.models import Group

# Basis-Benutzer erstellen
basis_user = Konto.objects.create_user(
    mail_mb='basis@test.de',
    password='test1234',
    vorname_mb='Basis',
    nachname_mb='User',
    rolle_mb='B'
)
basis_user.groups.add(Group.objects.get(name='Basis'))

# Erweiterung-Benutzer erstellen
erw_user = Konto.objects.create_user(
    mail_mb='erweiterung@test.de',
    password='test1234',
    vorname_mb='Erweiterung',
    nachname_mb='User',
    rolle_mb='E'
)
erw_user.groups.add(Group.objects.get(name='Erweiterung'))

# Admin-Benutzer erstellen
admin_user = Konto.objects.create_user(
    mail_mb='admin@test.de',
    password='test1234',
    vorname_mb='Admin',
    nachname_mb='User',
    rolle_mb='AD',
    is_staff=True
)
admin_user.groups.add(Group.objects.get(name='Admin'))

print("Test-Benutzer erstellt!")
```

---

## 2. API Tests mit cURL/HTTPie

### 2.1 Login und Cookie speichern

```bash
# Login als Basis-User
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "basis@test.de", "password": "test1234"}' \
  -c cookies.txt

# Login als Admin
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.de", "password": "test1234"}' \
  -c cookies_admin.txt
```

### 2.2 User-Daten mit Permissions abrufen

```bash
# Als Basis-User
curl -X GET http://localhost:8000/api/auth/user/ \
  -b cookies.txt \
  -H "Content-Type: application/json" | jq

# Erwartete Response:
# {
#   "id": 1,
#   "vorname_mb": "Basis",
#   "nachname_mb": "User",
#   "mail_mb": "basis@test.de",
#   "rolle_mb": "B",
#   "groups": ["Basis"],
#   "permissions": ["api.view_fall", "api.add_fall", "api.change_fall", ...]
# }
```

### 2.3 Permission-Tests

#### Test: Basis-User kann NICHT löschen

```bash
# Erst einen Fall erstellen
curl -X POST http://localhost:8000/api/faelle/ \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"klient": 1}' | jq

# Versuche zu löschen (sollte 403 geben)
curl -X DELETE http://localhost:8000/api/faelle/1/ \
  -b cookies.txt \
  -H "Content-Type: application/json" -v

# Erwartete Response: 403 Forbidden
```

#### Test: Admin kann löschen

```bash
curl -X DELETE http://localhost:8000/api/faelle/1/ \
  -b cookies_admin.txt \
  -H "Content-Type: application/json" -v

# Erwartete Response: 204 No Content
```

#### Test: Custom Permission (Export)

```bash
# Als Basis-User (sollte 403 geben)
curl -X GET http://localhost:8000/api/statistiken/1/export/ \
  -b cookies.txt \
  -H "Content-Type: application/json" -v

# Als Erweiterung/Admin (sollte funktionieren)
curl -X GET http://localhost:8000/api/statistiken/1/export/ \
  -b cookies_admin.txt \
  -H "Content-Type: application/json" | jq
```

---

## 3. Django Admin Panel Tests

### 3.1 Zugang

1. Navigiere zu `http://localhost:8000/admin/`
2. Login mit Superuser-Credentials

### 3.2 Gruppen verwalten

1. Gehe zu **Authentication and Authorization > Groups**
2. Klicke auf eine Gruppe (z.B. "Erweiterung")
3. Sieh dir die zugewiesenen Permissions an
4. **Test:** Entferne eine Permission und prüfe, ob der User sie nicht mehr hat

### 3.3 User Gruppen zuweisen

1. Gehe zu **Api > Benutzerkonten**
2. Klicke auf einen User
3. Unter "Groups" kannst du Gruppen hinzufügen/entfernen
4. Speichern und prüfen, ob sich die Permissions ändern

---

## 4. Frontend Tests

### 4.1 Frontend starten

```bash
cd frontend
npm install
npm run dev
```

### 4.2 Manuelle Tests im Browser

1. Öffne die Browser DevTools (F12)
2. Gehe zum **Network** Tab
3. Login über `/api/auth/login/`
4. Prüfe die Response von `/api/auth/user/` - enthält `permissions` Array?

### 4.3 Hook Tests in einer Komponente

Erstelle eine Test-Komponente:

```tsx
// src/app/test-permissions/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/PermissionGate';

export default function TestPermissions() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { can, isAdmin, Permissions } = usePermissions();

  if (isLoading) return <div>Laden...</div>;
  if (!isAuthenticated) return <div>Nicht eingeloggt</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Permission Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-2">User Info</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">Permission Checks (Hook)</h2>
        <ul className="list-disc pl-6">
          <li>can(VIEW_FALL): {can(Permissions.VIEW_FALL) ? '✅' : '❌'}</li>
          <li>can(DELETE_FALL): {can(Permissions.DELETE_FALL) ? '✅' : '❌'}</li>
          <li>can(CAN_EXPORT_STATISTIK): {can(Permissions.CAN_EXPORT_STATISTIK) ? '✅' : '❌'}</li>
          <li>can(CAN_MANAGE_USERS): {can(Permissions.CAN_MANAGE_USERS) ? '✅' : '❌'}</li>
          <li>isAdmin(): {isAdmin() ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-2">PermissionGate Tests</h2>
        
        <div className="space-y-2">
          <PermissionGate permission={Permissions.VIEW_FALL}>
            <div className="p-2 bg-green-100 rounded">
              ✅ VIEW_FALL: Dieser Text ist sichtbar
            </div>
          </PermissionGate>

          <PermissionGate permission={Permissions.DELETE_FALL} fallback={
            <div className="p-2 bg-red-100 rounded">
              ❌ DELETE_FALL: Keine Berechtigung
            </div>
          }>
            <div className="p-2 bg-green-100 rounded">
              ✅ DELETE_FALL: Dieser Text ist sichtbar
            </div>
          </PermissionGate>

          <PermissionGate adminOnly fallback={
            <div className="p-2 bg-red-100 rounded">
              ❌ Admin Only: Keine Berechtigung
            </div>
          }>
            <div className="p-2 bg-green-100 rounded">
              ✅ Admin Only: Dieser Text ist sichtbar
            </div>
          </PermissionGate>
        </div>
      </div>
    </div>
  );
}
```

### 4.4 Test-Szenarios

| Szenario | Login als | Erwartetes Ergebnis |
|----------|-----------|---------------------|
| Fälle anzeigen | Basis | ✅ Sichtbar |
| Fall löschen | Basis | ❌ Button versteckt |
| Fall löschen | Erweiterung | ✅ Button sichtbar |
| Statistik exportieren | Basis | ❌ Button versteckt |
| Statistik exportieren | Erweiterung | ✅ Button sichtbar |
| User verwalten | Erweiterung | ❌ Menü versteckt |
| User verwalten | Admin | ✅ Menü sichtbar |

---

## 5. Automatisierte Tests

### 5.1 Backend Unit Tests

Erstelle eine Test-Datei:

**Datei:** `backend/api/tests/test_permissions.py`

```python
from django.test import TestCase
from django.contrib.auth.models import Group, Permission
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Konto, Fall, KlientIn


class PermissionTestCase(TestCase):
    def setUp(self):
        # Management Command ausführen
        from django.core.management import call_command
        call_command('setup_groups')
        
        # Test-Klient erstellen
        self.klient = KlientIn.objects.create(
            klient_rolle='B',
            klient_geschlechtsidentitaet='K',
            klient_sexualitaet='K',
            klient_wohnort='K',
            klient_staatsangehoerigkeit='DE',
            klient_beruf='Test',
            klient_schwerbehinderung='N',
            klient_kontaktpunkt='Test'
        )
        
        # Basis User
        self.basis_user = Konto.objects.create_user(
            mail_mb='basis@test.de',
            password='test1234',
            vorname_mb='Basis',
            nachname_mb='User',
            rolle_mb='B'
        )
        self.basis_user.groups.add(Group.objects.get(name='Basis'))
        
        # Admin User
        self.admin_user = Konto.objects.create_user(
            mail_mb='admin@test.de',
            password='test1234',
            vorname_mb='Admin',
            nachname_mb='User',
            rolle_mb='AD'
        )
        self.admin_user.groups.add(Group.objects.get(name='Admin'))
        
        self.client = APIClient()

    def test_basis_user_cannot_delete_fall(self):
        """Basis-User sollte keine Fälle löschen können"""
        self.client.force_authenticate(user=self.basis_user)
        
        fall = Fall.objects.create(klient=self.klient, mitarbeiterin=self.basis_user)
        
        response = self.client.delete(f'/api/faelle/{fall.fall_id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_user_can_delete_fall(self):
        """Admin-User sollte Fälle löschen können"""
        self.client.force_authenticate(user=self.admin_user)
        
        fall = Fall.objects.create(klient=self.klient, mitarbeiterin=self.admin_user)
        
        response = self.client.delete(f'/api/faelle/{fall.fall_id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_permissions_in_response(self):
        """User-Endpoint sollte Permissions zurückgeben"""
        self.client.force_authenticate(user=self.basis_user)
        
        response = self.client.get('/api/auth/user/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('permissions', response.data)
        self.assertIn('groups', response.data)
        self.assertIn('api.view_fall', response.data['permissions'])

    def test_basis_user_has_no_delete_permission(self):
        """Basis-User sollte keine delete Permissions haben"""
        self.client.force_authenticate(user=self.basis_user)
        
        response = self.client.get('/api/auth/user/')
        self.assertNotIn('api.delete_fall', response.data['permissions'])

    def test_admin_has_custom_permissions(self):
        """Admin sollte Custom Permissions haben"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get('/api/auth/user/')
        self.assertIn('api.can_manage_users', response.data['permissions'])
        self.assertIn('api.can_view_all_data', response.data['permissions'])
```

### 5.2 Tests ausführen

```bash
docker compose exec api python manage.py test api.tests.test_permissions -v 2
```

---

## 6. Nächste Schritte / Weiterentwicklung

### 6.1 Sofort umsetzen

- [ ] Migrations ausführen (`makemigrations` + `migrate`)
- [ ] `setup_groups` Command ausführen
- [ ] Test-Benutzer erstellen
- [ ] API manuell testen

### 6.2 Kurzfristig

- [ ] Frontend Login-Page implementieren
- [ ] Protected Routes mit Permission-Checks
- [ ] Error-Handling für 403 Responses
- [ ] Loading-States während Auth-Check

### 6.3 Mittelfristig

- [ ] Unit Tests für Permissions schreiben
- [ ] Integration Tests für Frontend
- [ ] Audit-Logging für Permission-Änderungen
- [ ] UI für Gruppen-/Permission-Verwaltung (statt Django Admin)

### 6.4 Optional / Nice-to-have

- [ ] Row-Level Security (nur eigene Daten sehen)
- [ ] Temporäre Permissions (mit Ablaufdatum)
- [ ] Permission-Requests (User kann Berechtigungen anfragen)
- [ ] Hierarchische Permissions (Abteilungsleiter sieht Team-Daten)

---

## 7. Troubleshooting

### Problem: Migrations-Fehler

```bash
# Alle Migrations zurücksetzen
docker compose exec api python manage.py migrate api zero
docker compose exec api python manage.py migrate
```

### Problem: Permissions nicht sichtbar

```bash
# Permissions manuell erstellen
docker compose exec api python manage.py shell
```

```python
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from api.models import Konto

# ContentType holen
ct = ContentType.objects.get_for_model(Konto)

# Permission erstellen falls nicht vorhanden
Permission.objects.get_or_create(
    codename='can_manage_users',
    name='Kann Benutzerkonten verwalten',
    content_type=ct
)
```

### Problem: User hat keine Permissions nach Gruppen-Zuweisung

```python
# In Django Shell prüfen
from api.models import Konto
user = Konto.objects.get(mail_mb='test@test.de')

# Direkte Permissions
print(user.user_permissions.all())

# Gruppen
print(user.groups.all())

# Alle effektiven Permissions
print(user.get_all_permissions())
```

### Problem: Frontend zeigt veraltete Permissions

```typescript
// Nach Permission-Änderung im Backend:
const { refreshUser } = useAuth();
await refreshUser();
```

---

## 8. Checkliste für Go-Live

- [ ] Alle Test-Benutzer entfernt
- [ ] Produktions-Gruppen konfiguriert
- [ ] Superuser-Passwort geändert
- [ ] DEBUG=False in Django Settings
- [ ] HTTPS für Cookie-Sicherheit aktiviert
- [ ] CORS auf Produktions-Domain beschränkt
- [ ] Audit-Log aktiviert (optional)
