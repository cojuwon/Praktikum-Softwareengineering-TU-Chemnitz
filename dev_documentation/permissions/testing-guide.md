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

## 2. API Tests mit Swagger UI

Swagger UI (`drf_spectacular`) bietet eine interaktive Dokumentation für alle API-Endpoints mit eingebauter Test-Funktionalität.

### 2.1 Swagger UI öffnen

Navigiere zu: `http://localhost:8000/api/docs/`

Die Swagger UI zeigt alle verfügbaren Endpoints mit ihrer Dokumentation an.

### 2.2 Authentifizierung in Swagger

Das Backend verwendet **JWT Cookie Authentication**. Swagger zeigt zwei Auth-Optionen:

1. **jwtCookieAuth** (apiKey) - JWT Token im Cookie
2. **jwtHeaderAuth** (http, Bearer) - JWT Token im Authorization Header

#### Methode 1: Cookie-basierte Authentifizierung (Empfohlen)

**Schritt 1: Login durchführen**

1. Finde den Endpoint `POST /api/auth/login/` in Swagger
2. Klicke auf "Try it out"
3. Gib folgende Daten ein:
   ```json
   {
     "email": "admin@test.de",
     "password": "admin123"
   }
   ```
4. Klicke "Execute"

**Schritt 2: Cookie wird automatisch gesetzt**

Nach erfolgreichem Login setzt der Browser automatisch das Cookie `app-auth` (HttpOnly).

**Schritt 3: Authentifizierung in Swagger aktivieren**

1. Klicke oben rechts auf **"Authorize"** Button (🔒)
2. Unter **jwtCookieAuth** gib irgendeinen Platzhalter-Wert ein (z.B. "authenticated")
   - Der tatsächliche JWT-Token kommt aus dem Cookie, nicht aus diesem Feld
   - Das Feld muss nur ausgefüllt sein, damit Swagger weiß, dass Auth aktiv ist
3. Klicke "Authorize" und "Close"

**Schritt 4: Testen**

Alle nachfolgenden API-Calls verwenden jetzt automatisch das Cookie.

Beispiel:
- `GET /api/auth/user/` - Zeigt deine User-Daten mit Permissions
- `GET /api/faelle/` - Zeigt Fälle (Permission: `view_fall` nötig)

#### Methode 2: Header-basierte Authentifizierung (Manuell)

Diese Methode ist nützlich, wenn Cookies nicht funktionieren (z.B. bei CORS-Problemen).

**Schritt 1: Access Token aus Login-Response extrahieren**

1. Mache Login über `POST /api/auth/login/`
2. In der Response siehst du:
   ```json
   {
     "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { ... }
   }
   ```
3. Kopiere den **access** Token (der lange String)

**Schritt 2: Token in Authorization Header setzen**

1. Klicke auf **"Authorize"** (🔒)
2. Unter **jwtHeaderAuth (http, bearer)**:
   - Gib den Token ein (OHNE "Bearer " Prefix - Swagger fügt das automatisch hinzu)
   - Beispiel: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Klicke "Authorize" und "Close"

**Wichtig:** Access Tokens sind zeitlich begrenzt (Standard: 5 Minuten). Nach Ablauf musst du dich neu einloggen.

### 2.3 Test-Szenarien in Swagger

#### Test 1: User-Daten mit Permissions abrufen

```
GET /api/auth/user/
```

Erwartete Response:
```json
{
  "id": 1,
  "vorname_mb": "Admin",
  "nachname_mb": "User",
  "mail_mb": "admin@test.de",
  "rolle_mb": "AD",
  "groups": ["Admin"],
  "permissions": [
    "api.view_fall",
    "api.add_fall",
    "api.change_fall",
    "api.delete_fall",
    "api.can_manage_users",
    "api.can_view_all_data",
    ...
  ]
}
```

#### Test 2: Permission-Check (403 Forbidden)

**Als Basis-User einloggen:**
```json
{
  "email": "basis@test.de",
  "password": "test1234"
}
```

**Versuch, einen Fall zu löschen:**
```
DELETE /api/faelle/{id}/
```

**Erwartete Response:** `403 Forbidden`
```json
{
  "detail": "You do not have permission to perform this action."
}
```

#### Test 3: Custom Permission (Export)

**Endpoint:** `GET /api/statistiken/{id}/export/`

- Als **Basis-User** → `403 Forbidden`
- Als **Erweiterung/Admin** → `200 OK` mit Export-Daten

#### Test 4: Admin-Only Endpoint

**Endpoint:** `GET /api/konten/` (User-Verwaltung)

- Benötigt Permission: `api.can_manage_users`
- Nur Admin-Gruppe hat diese Permission

### 2.4 Swagger Tipps & Tricks

#### Cookie-Debugging

Wenn Cookies nicht funktionieren:

1. Öffne Browser DevTools (F12)
2. Gehe zu "Application" Tab → "Cookies" → `http://localhost:8000`
3. Prüfe, ob `app-auth` Cookie vorhanden ist
4. Wenn nicht: CORS-Konfiguration prüfen (siehe `settings.py`)

#### Swagger neu laden nach Änderungen

Nach Backend-Änderungen (z.B. neue Permissions):
- Swagger UI neu laden (F5)
- Schema neu generieren: `docker compose exec api python manage.py spectacular --file schema.yml`

#### Logout

Um auszuloggen:
```
POST /api/auth/logout/
```

Oder Browser-Cookies manuell löschen (DevTools → Application → Cookies → Delete).

### 2.5 Vergleich: Swagger vs. cURL

| Feature | Swagger UI | cURL |
|---------|-----------|------|
| **Setup** | Browser öffnen, fertig | Cookies manuell speichern |
| **Auth** | Button-Klick | Header/Cookie manuell setzen |
| **Doku** | Automatisch sichtbar | Keine Doku |
| **Request Builder** | Interaktiv | Manuell tippen |
| **Response Viewer** | Formatiert, farbig | Plain text |
| **Automationsfähig** | Nein | Ja (Scripting) |

**Empfehlung:** Swagger für manuelle Tests, cURL für Automation/CI.

---

## 3. API Tests mit cURL/HTTPie

### 3.1 Login und Cookie speichern

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

### 3.2 User-Daten mit Permissions abrufen

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

### 3.3 Permission-Tests

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

## 4. Django Admin Panel Tests

### 4.1 Zugang

1. Navigiere zu `http://localhost:8000/admin/`
2. Login mit Superuser-Credentials

### 4.2 Gruppen verwalten

1. Gehe zu **Authentication and Authorization > Groups**
2. Klicke auf eine Gruppe (z.B. "Erweiterung")
3. Sieh dir die zugewiesenen Permissions an
4. **Test:** Entferne eine Permission und prüfe, ob der User sie nicht mehr hat

### 4.3 User Gruppen zuweisen

1. Gehe zu **Api > Benutzerkonten**
2. Klicke auf einen User
3. Unter "Groups" kannst du Gruppen hinzufügen/entfernen
4. Speichern und prüfen, ob sich die Permissions ändern

---

## 5. Frontend Tests

### 5.1 Frontend starten

```bash
cd frontend
npm install
npm run dev
```

### 5.2 Manuelle Tests im Browser

1. Öffne die Browser DevTools (F12)
2. Gehe zum **Network** Tab
3. Login über `/api/auth/login/`
4. Prüfe die Response von `/api/auth/user/` - enthält `permissions` Array?

### 5.3 Hook Tests in einer Komponente

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

### 5.4 Test-Szenarios

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

## 6. Automatisierte Tests

### 6.1 Backend Unit Tests

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

### 6.2 Tests ausführen

```bash
docker compose exec api python manage.py test api.tests.test_permissions -v 2
```

---

## 7. Nächste Schritte / Weiterentwicklung

### 7.1 Sofort umsetzen

- [ ] Migrations ausführen (`makemigrations` + `migrate`)
- [ ] `setup_groups` Command ausführen
- [ ] Test-Benutzer erstellen
- [ ] API manuell testen

### 7.2 Kurzfristig

- [ ] Frontend Login-Page implementieren
- [ ] Protected Routes mit Permission-Checks
- [ ] Error-Handling für 403 Responses
- [ ] Loading-States während Auth-Check

### 7.3 Mittelfristig

- [ ] Unit Tests für Permissions schreiben
- [ ] Integration Tests für Frontend
- [ ] Audit-Logging für Permission-Änderungen
- [ ] UI für Gruppen-/Permission-Verwaltung (statt Django Admin)

### 7.4 Optional / Nice-to-have

- [ ] Row-Level Security (nur eigene Daten sehen)
- [ ] Temporäre Permissions (mit Ablaufdatum)
- [ ] Permission-Requests (User kann Berechtigungen anfragen)
- [ ] Hierarchische Permissions (Abteilungsleiter sieht Team-Daten)

---

## 8. Troubleshooting

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

## 9. Checkliste für Go-Live

- [ ] Alle Test-Benutzer entfernt
- [ ] Produktions-Gruppen konfiguriert
- [ ] Superuser-Passwort geändert
- [ ] DEBUG=False in Django Settings
- [ ] HTTPS für Cookie-Sicherheit aktiviert
- [ ] CORS auf Produktions-Domain beschränkt
- [ ] Audit-Log aktiviert (optional)
