
import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Konto
from django.contrib.auth.models import Group

def verify_role_sync():
    print("Verifying Role -> Group Sync...")
    
    # Create Test User with 'Basis' Role
    email = "test_sync_user@example.com"
    if Konto.objects.filter(mail_mb=email).exists():
        Konto.objects.get(mail_mb=email).delete()
        
    user = Konto.objects.create_user(
        mail_mb=email,
        password="testpassword123",
        vorname_mb="Test",
        nachname_mb="User",
        rolle_mb='B' # Basis
    )
    
    print(f"Created user with role: {user.rolle_mb}")
    
    # Check Group
    basis_group = Group.objects.get(name='Basis')
    if basis_group in user.groups.all():
        print("SUCCESS: User is in 'Basis' group.")
    else:
        print(f"FAILURE: User is NOT in 'Basis' group. Groups: {list(user.groups.all())}")

    # Update Role to 'Admin'
    user.rolle_mb = 'AD'
    user.save()
    print(f"Updated user role to: {user.rolle_mb}")
    
    # Check Group Update
    admin_group = Group.objects.get(name='Admin')
    if admin_group in user.groups.all():
        print("SUCCESS: User is in 'Admin' group.")
    else:
        print(f"FAILURE: User is NOT in 'Admin' group. Groups: {list(user.groups.all())}")
        
    if basis_group not in user.groups.all():
         print("SUCCESS: User is NO LONGER in 'Basis' group.")
    else:
         print("FAILURE: User is STILL in 'Basis' group.")

    # Update Role to 'Erweiterung'
    user.rolle_mb = 'E'
    user.save()
    print(f"Updated user role to: {user.rolle_mb}")
    
    ext_group = Group.objects.get(name='Erweiterung')
    if ext_group in user.groups.all():
        print("SUCCESS: User is in 'Erweiterung' group.")
    else:
         print(f"FAILURE: User is NOT in 'Erweiterung' group. Groups: {list(user.groups.all())}")

    # Clean up
    user.delete()
    print("Test user deleted.")

if __name__ == "__main__":
    try:
        verify_role_sync()
    except Exception as e:
        print(f"An error occurred: {e}")
