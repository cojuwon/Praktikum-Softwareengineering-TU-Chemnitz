import os
import django
from django.conf import settings

import dotenv
dotenv.load_dotenv()
# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Fall, KlientIn, Beratungstermin, Begleitung, Gewalttat, Anfrage
from api.services.statistik_service import StatistikService

def check_data():
    print("--- Database Counts ---")
    print(f"Fall: {Fall.objects.count()}")
    print(f"KlientIn: {KlientIn.objects.count()}")
    print(f"Beratungstermin: {Beratungstermin.objects.count()}")
    print(f"Begleitung: {Begleitung.objects.count()}")
    print(f"Gewalttat: {Gewalttat.objects.count()}")
    print(f"Anfrage: {Anfrage.objects.count()}")

    print("\n--- Example Data (First 3) ---")
    for k in KlientIn.objects.all()[:3]:
        print(f"Klient {k.klient_id}: wohnort={k.klient_wohnort}, geschlecht={k.klient_geschlechtsidentitaet}")

    for f in Fall.objects.all()[:3]:
        print(f"Fall {f.fall_id}: startdatum={f.startdatum}")

    print("\n--- StatistikService Calculation ---")
    stats = StatistikService.calculate_stats({})
    
    # Print non-zero values from result
    def print_non_zero(data, prefix=""):
        for k, v in data.items():
            if isinstance(v, dict):
                print_non_zero(v, prefix + k + " -> ")
            elif isinstance(v, (int, float)) and v > 0:
                print(f"{prefix}{k}: {v}")
            elif isinstance(v, str) and v != "-":
                 print(f"{prefix}{k}: {v}")

    print_non_zero(stats['data'])

if __name__ == "__main__":
    check_data()
