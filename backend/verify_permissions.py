
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

Konto = get_user_model()

# Allow testserver
from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS = list(settings.ALLOWED_HOSTS) + ['testserver']

def verify_permissions():
    print("Verifying API Permissions...")
    
    # Setup Users
    admin_email = "admin_test@example.com"
    user_email = "user_test@example.com"
    
    # Cleanup
    Konto.objects.filter(mail_mb__in=[admin_email, user_email]).delete()
    
    admin = Konto.objects.create_superuser(mail_mb=admin_email, password="adminpassword", vorname_mb="Admin", nachname_mb="User")
    user = Konto.objects.create_user(mail_mb=user_email, password="userpassword", vorname_mb="Normal", nachname_mb="User", rolle_mb='B')
    
    client = APIClient()
    
    # 1. Test as Normal User (Should Fail)
    print("\n[TEST] User attempts to assign role...")
    client.force_authenticate(user=user)
    response = client.post(f'/api/konten/{user.id}/assign_role/', {'rolle': 'AD'})
    
    if response.status_code == 403:
        print("SUCCESS: User cannot assign role (403 Forbidden).")
    else:
        print(f"FAILURE: User got {response.status_code} - {str(response.content)[:200]}")

    print("\n[TEST] User attempts to assign group...")
    response = client.post(f'/api/konten/{user.id}/assign_group/', {'group_name': 'Admin'})
    
    if response.status_code == 403:
         print("SUCCESS: User cannot assign group (403 Forbidden).")
    else:
         print(f"FAILURE: User got {response.status_code} - {str(response.content)[:200]}")

    # 2. Test as Admin (Should Success)
    print("\n[TEST] Admin attempts to assign role...")
    client.force_authenticate(user=admin)
    response = client.post(f'/api/konten/{user.id}/assign_role/', {'rolle': 'E'})
    
    if response.status_code == 200:
        print("SUCCESS: Admin can assign role.")
        user.refresh_from_db()
        if user.rolle_mb == 'E':
             print("SUCCESS: Role updated to 'E'.")
        else:
             print(f"FAILURE: Role not updated in DB: {user.rolle_mb}")
    else:
        print(f"FAILURE: Admin got {response.status_code} - {str(response.content)[:200]}")

    # Cleanup
    admin.delete()
    user.delete()
    print("\nVerification Complete.")

if __name__ == "__main__":
    verify_permissions()
