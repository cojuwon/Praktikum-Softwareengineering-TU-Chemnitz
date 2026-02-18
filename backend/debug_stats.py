import os
import django
from django.test import RequestFactory
from api.views.statistik import StatistikViewSet
from api.services.statistik_service import StatistikService
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def debug_query():
    print("--- Starting Debug ---")
    payload = {
        "zeitraum_start": "2024-01-01",
        "zeitraum_ende": "2024-12-31",
        "_visible_sections": {
            "auslastung": True,
            "wohnsitz": False
        }
    }
    
    # 1. Test Service directly
    print("\n1. Testing Service.calculate_stats...")
    try:
        result = StatistikService.calculate_stats(payload)
        print("Service OK. Result keys:", result.keys())
    except Exception as e:
        print("Service FAILED:")
        import traceback
        traceback.print_exc()

    # 2. Test ViewSet logic (Serializer stripping)
    print("\n2. Testing ViewSet logic...")
    from api.views.statistik import StatistikQuerySerializer
    serializer = StatistikQuerySerializer(data=payload)
    if serializer.is_valid():
        print("Serializer Validated Data:", serializer.validated_data)
        # Check if _visible_sections is lost
        if '_visible_sections' not in serializer.validated_data:
            print("WARNING: _visible_sections stripped by serializer!")
            
        # Simulate View call
        filters = serializer.validated_data
        try:
            result = StatistikService.calculate_stats(filters)
            print("View Simulation OK (but fields missing).")
        except Exception as e:
            print("View Simulation FAILED:")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    debug_query()
