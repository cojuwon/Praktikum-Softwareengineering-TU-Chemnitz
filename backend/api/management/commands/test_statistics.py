"""Management command to test statistics calculation."""

from django.core.management.base import BaseCommand
from datetime import date, timedelta
from api.services.statistik_service import StatistikService
import json


class Command(BaseCommand):
    help = 'Tests statistics calculation'

    def handle(self, *args, **options):
        self.stdout.write('Testing StatistikService...')
        
        # Calculate stats for the last 60 days
        start_date = date.today() - timedelta(days=60)
        end_date = date.today()
        
        self.stdout.write(f'Calculating statistics from {start_date} to {end_date}...')
        
        stats = StatistikService.calculate_stats(
            zeitraum_start=start_date,
            zeitraum_ende=end_date
        )
        
        self.stdout.write(self.style.SUCCESS('\n=== STATISTICS RESULTS ===\n'))
        
        # Print basic counts
        self.stdout.write(f'Total Cases: {stats["total_cases"]}')
        self.stdout.write(f'Total Clients: {stats["total_clients"]}')
        self.stdout.write(f'Total Consultations: {stats["total_consultations"]}')
        self.stdout.write(f'Total Accompaniments: {stats["total_accompaniments"]}')
        self.stdout.write(f'Total Inquiries: {stats["total_inquiries"]}')
        self.stdout.write(f'Avg Consultation Duration: {stats["avg_consultation_duration"]} min')
        self.stdout.write(f'Total Interpreter Hours: {stats["total_interpreter_hours"]}')
        
        # Print consultations by gender
        self.stdout.write('\n--- Consultations by Gender ---')
        for key, value in stats['consultations_by_gender'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print consultations by type
        self.stdout.write('\n--- Consultations by Type ---')
        for key, value in stats['consultations_by_type'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print accompaniments by institution
        self.stdout.write('\n--- Accompaniments by Institution ---')
        for key, value in stats['accompaniments_by_institution'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print clients by location
        self.stdout.write('\n--- Clients by Location ---')
        for key, value in stats['clients_by_location'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print clients by age group
        self.stdout.write('\n--- Clients by Age Group ---')
        for key, value in stats['clients_by_age_group'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print violence statistics
        self.stdout.write('\n--- Violence with Report ---')
        for key, value in stats['violence_with_report'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print affected children
        self.stdout.write('\n--- Affected Children ---')
        for key, value in stats['affected_children'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print violence consequences
        self.stdout.write('\n--- Violence Consequences ---')
        consequences = stats['violence_consequences']
        self.stdout.write(f'  Finanzielle Folgen (Ja): {consequences["finanzielle_ja"]}')
        self.stdout.write(f'  Arbeitseinschränkung (Ja): {consequences["arbeitseinschraenkung_ja"]}')
        self.stdout.write(f'  Verlust Arbeitsstelle (Ja): {consequences["verlust_arbeitsstelle_ja"]}')
        self.stdout.write(f'  Soziale Isolation (Ja): {consequences["soziale_isolation_ja"]}')
        self.stdout.write(f'  Suizidalität (Ja): {consequences["suizidalitaet_ja"]}')
        
        self.stdout.write('\n--- Psychische Folgen ---')
        for key, value in consequences['psychische'].items():
            self.stdout.write(f'  {key}: {value}')
        
        self.stdout.write('\n--- Körperliche Folgen ---')
        for key, value in consequences['koerperliche'].items():
            self.stdout.write(f'  {key}: {value}')
        
        # Print inquiries
        self.stdout.write('\n--- Inquiries by Type ---')
        for key, value in stats['inquiries_by_type'].items():
            self.stdout.write(f'  {key}: {value}')
        
        self.stdout.write(self.style.SUCCESS('\n=== TEST COMPLETED ==='))
