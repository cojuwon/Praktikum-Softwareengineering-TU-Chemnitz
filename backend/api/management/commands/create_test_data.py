"""Management command to create test data for statistics."""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from api.models import (
    Konto, KlientIn, Fall, Beratungstermin, Gewalttat, Gewaltfolge,
    Begleitung, Anfrage
)


class Command(BaseCommand):
    help = 'Creates test data for statistics testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')
        
        # Create test user
        user, created = Konto.objects.get_or_create(
            mail_mb='test@example.com',
            defaults={
                'vorname_mb': 'Test',
                'nachname_mb': 'User',
                'rolle_mb': 'E'
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {user.mail_mb}'))
        else:
            self.stdout.write(f'User already exists: {user.mail_mb}')
        
        # Create 10 clients with various demographics
        clients = []
        for i in range(10):
            client, created = KlientIn.objects.get_or_create(
                klient_id=1000 + i,
                defaults={
                    'klient_rolle': 'B',
                    'klient_alter': 20 + (i * 5),
                    'klient_geschlechtsidentitaet': ['CW', 'CM', 'D'][i % 3],
                    'klient_sexualitaet': 'H',
                    'klient_wohnort': ['LS', 'LL', 'NS'][i % 3],
                    'klient_staatsangehoerigkeit': 'Deutsch' if i % 3 == 0 else f'Land{i}',
                    'klient_beruf': f'Beruf {i}',
                    'klient_schwerbehinderung': 'J' if i % 4 == 0 else 'N',
                    'klient_kontaktpunkt': 'Polizei' if i % 2 == 0 else 'Beratungsstelle'
                }
            )
            if created:
                clients.append(client)
                self.stdout.write(f'Created client: {client.klient_id}')
        
        # Create cases for each client
        cases = []
        for i, client in enumerate(clients):
            fall, created = Fall.objects.get_or_create(
                fall_id=2000 + i,
                defaults={
                    'klient': client,
                    'mitarbeiterin': user,
                    'status': 'L',
                    'startdatum': date.today() - timedelta(days=30 - i),
                    'notizen': f'Test Fall {i}'
                }
            )
            if created:
                cases.append(fall)
                self.stdout.write(f'Created case: {fall.fall_id}')
        
        # Create consultations
        for i, fall in enumerate(cases):
            for j in range(3):  # 3 consultations per case
                consultation, created = Beratungstermin.objects.get_or_create(
                    beratungs_id=3000 + (i * 10) + j,
                    defaults={
                        'beratungsstelle': ['LS', 'NS', 'LL'][j % 3],
                        'termin_beratung': timezone.now() - timedelta(days=20 - i - j),
                        'dauer': 60 + (j * 30),
                        'status': 's',
                        'dolmetscher_stunden': 1.5 if i % 3 == 0 else 0,
                        'beratungsart': ['P', 'T', 'V'][j % 3],
                        'berater': user,
                        'fall': fall
                    }
                )
                if created:
                    self.stdout.write(f'Created consultation: {consultation.beratungs_id}')
        
        # Create violence incidents
        for i, fall in enumerate(cases):
            gewalttat, created = Gewalttat.objects.get_or_create(
                tat_id=4000 + i,
                defaults={
                    'tat_alter': 'J',
                    'tat_zeitraum': 'J',
                    'tat_anzahl_vorfaelle': 'M',
                    'tat_anzahl_taeter_innen': '1',
                    'tat_art': 'Körperliche Gewalt, Psychische Gewalt',
                    'tatort': ['L', 'LL', 'S'][i % 3],
                    'tat_anzeige': 'J' if i % 2 == 0 else 'N',
                    'tat_medizinische_versorgung': 'J',
                    'tat_spurensicherung': 'J' if i % 3 == 0 else 'N',
                    'tat_mitbetroffene_kinder': 2 if i % 4 == 0 else 0,
                    'tat_direktbetroffene_kinder': 1 if i % 5 == 0 else 0,
                    'klient': fall.klient,
                    'fall': fall
                }
            )
            if created:
                self.stdout.write(f'Created violence incident: {gewalttat.tat_id}')
                
                # Create consequences
                folge, created = Gewaltfolge.objects.get_or_create(
                    gewalttat=gewalttat,
                    defaults={
                        'psychische_folgen': ['D', 'A', 'PT'][i % 3],
                        'koerperliche_folgen': ['S', 'N'][i % 2],
                        'finanzielle_folgen': 'J' if i % 3 == 0 else 'N',
                        'arbeitseinschraenkung': 'J' if i % 4 == 0 else 'N',
                        'verlust_arbeitsstelle': 'N',
                        'soziale_isolation': 'J' if i % 2 == 0 else 'N',
                        'suizidalitaet': 'N'
                    }
                )
                if created:
                    self.stdout.write(f'Created violence consequence for: {gewalttat.tat_id}')
        
        # Create accompaniments
        for i, fall in enumerate(cases):
            einrichtungen = ['Gericht', 'Polizei', 'Rechtsanwalt', 'Arzt', 'Jugendamt']
            begleitung, created = Begleitung.objects.get_or_create(
                begleitungs_id=5000 + i,
                defaults={
                    'datum': date.today() - timedelta(days=15 - i),
                    'einrichtung': einrichtungen[i % len(einrichtungen)],
                    'dolmetscher_stunden': 0.5 if i % 3 == 0 else 0,
                    'klient': fall.klient,
                    'fall': fall
                }
            )
            if created:
                self.stdout.write(f'Created accompaniment: {begleitung.begleitungs_id}')
        
        # Create inquiries
        for i in range(10):
            anfrage, created = Anfrage.objects.get_or_create(
                anfrage_id=6000 + i,
                defaults={
                    'anfrage_weg': f'Weg {i}',
                    'anfrage_datum': date.today() - timedelta(days=25 - i),
                    'anfrage_ort': ['LS', 'LL', 'NS'][i % 3],
                    'anfrage_person': ['F', 'A', 'B'][i % 3],
                    'anfrage_art': ['MS', 'VS', 'B', 'R', 'S'][i % 5],
                    'mitarbeiterin': user
                }
            )
            if created:
                self.stdout.write(f'Created inquiry: {anfrage.anfrage_id}')
        
        self.stdout.write(self.style.SUCCESS('Test data creation completed!'))
        self.stdout.write(f'Total clients: {KlientIn.objects.count()}')
        self.stdout.write(f'Total cases: {Fall.objects.count()}')
        self.stdout.write(f'Total consultations: {Beratungstermin.objects.count()}')
        self.stdout.write(f'Total violence incidents: {Gewalttat.objects.count()}')
        self.stdout.write(f'Total accompaniments: {Begleitung.objects.count()}')
        self.stdout.write(f'Total inquiries: {Anfrage.objects.count()}')
