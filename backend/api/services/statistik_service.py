"""Service for calculating statistics from case management data."""

from django.db.models import Count, Q, Sum
from datetime import date
from api.models import (
    Fall, KlientIn, Beratungstermin, Gewalttat, Gewaltfolge, 
    Begleitung, Anfrage
)


class StatistikService:
    """Service class for statistics calculation."""
    
    @staticmethod
    def calculate_stats(zeitraum_start, zeitraum_ende, preset=None, beratungsstelle=None):
        """
        Calculate statistics for the given time period and filters.
        
        Args:
            zeitraum_start (date): Start date of the period
            zeitraum_ende (date): End date of the period
            preset: Optional preset with filter criteria
            beratungsstelle (str): Optional counseling center filter
            
        Returns:
            dict: Dictionary with calculated statistics
        """
        # Apply preset filters if available
        filter_params = {}
        if preset and preset.filterKriterien:
            filter_params = preset.filterKriterien
        
        # Override with explicit beratungsstelle filter if provided
        if beratungsstelle:
            filter_params['beratungsstelle'] = beratungsstelle
        
        # Base queryset for cases (Fall)
        cases = Fall.objects.filter(
            startdatum__gte=zeitraum_start,
            startdatum__lte=zeitraum_ende
        )
        
        # Filter consultations by beratungsstelle (not Fall!)
        consultations = Beratungstermin.objects.filter(
            termin_beratung__date__gte=zeitraum_start,
            termin_beratung__date__lte=zeitraum_ende
        )
        
        # Apply beratungsstelle filter to consultations if specified
        if filter_params.get('beratungsstelle'):
            consultations = consultations.filter(
                beratungsstelle=filter_params['beratungsstelle']
            )
        
        # Get clients from cases
        client_ids = cases.values_list('klient_id', flat=True)
        clients = KlientIn.objects.filter(klient_id__in=client_ids)
        
        # Get consultations from cases
        case_ids = cases.values_list('fall_id', flat=True)
        consultations = consultations.filter(fall_id__in=case_ids)
        
        # Get accompaniments
        accompaniments = Begleitung.objects.filter(
            fall_id__in=case_ids,
            datum__gte=zeitraum_start,
            datum__lte=zeitraum_ende
        )
        
        # Get violence incidents
        violence_incidents = Gewalttat.objects.filter(
            fall_id__in=case_ids
        )
        
        # Get inquiries
        inquiries = Anfrage.objects.filter(
            anfrage_datum__gte=zeitraum_start,
            anfrage_datum__lte=zeitraum_ende
        )
        
        # Calculate statistics
        stats = {
            # Basic counts
            'total_cases': cases.count(),
            'total_clients': clients.count(),
            'total_consultations': consultations.count(),
            'total_accompaniments': accompaniments.count(),
            'total_inquiries': inquiries.count(),
            
            # Consultation statistics by gender
            'consultations_by_gender': StatistikService._count_by_gender(consultations, clients),
            
            # Consultation statistics by age
            'consultations_by_age': StatistikService._count_by_age(consultations, clients),
            
            # Consultation statistics by type
            'consultations_by_type': StatistikService._count_consultations_by_type(consultations),
            
            # Accompaniment statistics
            'accompaniments_by_institution': StatistikService._count_accompaniments_by_institution(accompaniments),
            
            # Client demographics
            'clients_by_location': StatistikService._count_clients_by_location(clients),
            'clients_by_age_group': StatistikService._count_clients_by_age_group(clients),
            'clients_by_nationality': StatistikService._count_clients_by_nationality(clients),
            'clients_with_disability': StatistikService._count_clients_with_disability(clients),
            
            # Violence statistics
            'violence_by_type': StatistikService._count_violence_by_type(violence_incidents),
            'violence_by_location': StatistikService._count_violence_by_location(violence_incidents),
            'violence_with_report': StatistikService._count_violence_with_report(violence_incidents),
            'affected_children': StatistikService._count_affected_children(violence_incidents),
            
            # Violence consequences
            'violence_consequences': StatistikService._count_violence_consequences(violence_incidents),
            
            # Inquiry statistics
            'inquiries_by_type': StatistikService._count_inquiries_by_type(inquiries),
            'inquiries_by_person': StatistikService._count_inquiries_by_person(inquiries),
            
            # Additional metrics
            'avg_consultation_duration': consultations.aggregate(avg_dauer=Sum('dauer'))['avg_dauer'] or 0,
            'total_interpreter_hours': (
                consultations.aggregate(total=Sum('dolmetscher_stunden'))['total'] or 0
            ) + (
                accompaniments.aggregate(total=Sum('dolmetscher_stunden'))['total'] or 0
            ),
        }
        
        return stats
    
    @staticmethod
    def _count_by_gender(consultations, clients):
        """Count consultations by client gender."""
        result = {
            'gesamt': consultations.count(),
            'weiblich': 0,
            'maennlich': 0,
            'divers': 0
        }
        
        # Get consultation IDs with client data
        for consultation in consultations.select_related('fall__klient'):
            if consultation.fall and consultation.fall.klient:
                gender = consultation.fall.klient.klient_geschlechtsidentitaet
                if gender in ['CW', 'TW']:  # cis/trans weiblich
                    result['weiblich'] += 1
                elif gender in ['CM', 'TM']:  # cis/trans männlich
                    result['maennlich'] += 1
                elif gender in ['TN', 'I', 'A', 'D']:  # trans nicht-binär, inter, agender, divers
                    result['divers'] += 1
        
        return result
    
    @staticmethod
    def _count_by_age(consultations, clients):
        """Count consultations by client age."""
        result = {
            'gesamt': consultations.count(),
            'weiblich': 0,
            'maennlich': 0,
            'divers': 0
        }
        
        # Similar to gender counting
        for consultation in consultations.select_related('fall__klient'):
            if consultation.fall and consultation.fall.klient:
                gender = consultation.fall.klient.klient_geschlechtsidentitaet
                if gender in ['CW', 'TW']:
                    result['weiblich'] += 1
                elif gender in ['CM', 'TM']:
                    result['maennlich'] += 1
                elif gender in ['TN', 'I', 'A', 'D']:
                    result['divers'] += 1
        
        return result
    
    @staticmethod
    def _count_consultations_by_type(consultations):
        """Count consultations by type (persönlich, Telefon, etc.)."""
        result = {
            'persoenlich': 0,
            'aufsuchend': 0,
            'telefonisch': 0,
            'online': 0,
            'schriftlich': 0
        }
        
        for consultation in consultations:
            art = consultation.beratungsart
            if art == 'P':
                result['persoenlich'] += 1
            elif art == 'A':
                result['aufsuchend'] += 1
            elif art == 'T':
                result['telefonisch'] += 1
            elif art == 'V':
                result['online'] += 1
            elif art == 'S':
                result['schriftlich'] += 1
        
        return result
    
    @staticmethod
    def _count_accompaniments_by_institution(accompaniments):
        """Count accompaniments by institution type."""
        result = {
            'gesamt': accompaniments.count(),
            'gerichte': 0,
            'polizei': 0,
            'rechtsanwaelte': 0,
            'aerzte': 0,
            'rechtsmedizin': 0,
            'jugendamt': 0,
            'sozialamt': 0,
            'jobcenter': 0,
            'gewaltberatung': 0,
            'frauen_kinderschutz': 0,
            'schutzeinrichtungen': 0,
            'interventionsstellen': 0,
            'sonstige': 0
        }
        
        # Map keywords in einrichtung field to categories
        for accompaniment in accompaniments:
            einrichtung = (accompaniment.einrichtung or '').lower()
            if 'gericht' in einrichtung:
                result['gerichte'] += 1
            elif 'polizei' in einrichtung:
                result['polizei'] += 1
            elif 'anwalt' in einrichtung or 'anwältin' in einrichtung:
                result['rechtsanwaelte'] += 1
            elif 'arzt' in einrichtung or 'ärztin' in einrichtung:
                result['aerzte'] += 1
            elif 'rechtsmedizin' in einrichtung:
                result['rechtsmedizin'] += 1
            elif 'jugendamt' in einrichtung:
                result['jugendamt'] += 1
            elif 'sozialamt' in einrichtung:
                result['sozialamt'] += 1
            elif 'jobcenter' in einrichtung or 'arbeitsagentur' in einrichtung:
                result['jobcenter'] += 1
            elif 'gewaltberatung' in einrichtung:
                result['gewaltberatung'] += 1
            elif 'frauenschutz' in einrichtung or 'kinderschutz' in einrichtung:
                result['frauen_kinderschutz'] += 1
            elif 'schutzeinrichtung' in einrichtung:
                result['schutzeinrichtungen'] += 1
            elif 'intervention' in einrichtung:
                result['interventionsstellen'] += 1
            else:
                result['sonstige'] += 1
        
        return result
    
    @staticmethod
    def _count_clients_by_location(clients):
        """Count clients by location (wohnort)."""
        result = {
            'leipzig_stadt': 0,
            'leipzig_land': 0,
            'nordsachsen': 0,
            'sachsen_andere': 0,
            'deutschland_andere': 0,
            'ausland': 0,
            'keine_angabe': 0
        }
        
        for client in clients:
            location = client.klient_wohnort
            if location == 'LS':
                result['leipzig_stadt'] += 1
            elif location == 'LL':
                result['leipzig_land'] += 1
            elif location == 'NS':
                result['nordsachsen'] += 1
            elif location == 'S':
                result['sachsen_andere'] += 1
            elif location == 'D':
                result['deutschland_andere'] += 1
            elif location == 'A':
                result['ausland'] += 1
            elif location == 'K':
                result['keine_angabe'] += 1
        
        return result
    
    @staticmethod
    def _count_clients_by_age_group(clients):
        """Count clients by age group."""
        result = {
            '18_21': 0,
            '21_27': 0,
            '27_60': 0,
            '60_plus': 0,
            'keine_angabe': 0
        }
        
        for client in clients:
            age = client.klient_alter
            if age is None:
                result['keine_angabe'] += 1
            elif 18 <= age < 21:
                result['18_21'] += 1
            elif 21 <= age < 27:
                result['21_27'] += 1
            elif 27 <= age < 60:
                result['27_60'] += 1
            elif age >= 60:
                result['60_plus'] += 1
        
        return result
    
    @staticmethod
    def _count_clients_by_nationality(clients):
        """Count clients by nationality (foreign vs German)."""
        result = {
            'foreign': 0,
            'foreign_countries': []
        }
        
        for client in clients:
            nationality = client.klient_staatsangehoerigkeit.lower()
            if nationality and 'deutsch' not in nationality:
                result['foreign'] += 1
                if client.klient_staatsangehoerigkeit not in result['foreign_countries']:
                    result['foreign_countries'].append(client.klient_staatsangehoerigkeit)
        
        return result
    
    @staticmethod
    def _count_clients_with_disability(clients):
        """Count clients with disability."""
        result = {
            'ja': 0,
            'nein': 0,
            'keine_angabe': 0
        }
        
        for client in clients:
            disability = client.klient_schwerbehinderung
            if disability == 'J':
                result['ja'] += 1
            elif disability == 'N':
                result['nein'] += 1
            elif disability == 'KA':
                result['keine_angabe'] += 1
        
        return result
    
    @staticmethod
    def _count_violence_by_type(violence_incidents):
        """Count violence incidents by type."""
        result = {}
        
        for incident in violence_incidents:
            # tat_art is a text field with comma-separated types
            types = [t.strip() for t in incident.tat_art.split(',')]
            for violence_type in types:
                if violence_type:
                    result[violence_type] = result.get(violence_type, 0) + 1
        
        return result
    
    @staticmethod
    def _count_violence_by_location(violence_incidents):
        """Count violence incidents by location."""
        result = {
            'leipzig': 0,
            'leipzig_land': 0,
            'nordsachsen': 0,
            'sachsen': 0,
            'deutschland': 0,
            'ausland': 0,
            'flucht': 0,
            'herkunftsland': 0,
            'keine_angabe': 0
        }
        
        for incident in violence_incidents:
            location = incident.tatort
            if location == 'L':
                result['leipzig'] += 1
            elif location == 'LL':
                result['leipzig_land'] += 1
            elif location == 'NS':
                result['nordsachsen'] += 1
            elif location == 'S':
                result['sachsen'] += 1
            elif location == 'D':
                result['deutschland'] += 1
            elif location == 'A':
                result['ausland'] += 1
            elif location == 'F':
                result['flucht'] += 1
            elif location == 'H':
                result['herkunftsland'] += 1
            elif location == 'K':
                result['keine_angabe'] += 1
        
        return result
    
    @staticmethod
    def _count_violence_with_report(violence_incidents):
        """Count violence incidents with police report."""
        result = {
            'anzeige_ja': 0,
            'anzeige_nein': 0,
            'anzeige_unentschieden': 0,
            'anzeige_keine_angabe': 0,
            'spurensicherung_ja': 0,
            'spurensicherung_nein': 0
        }
        
        for incident in violence_incidents:
            anzeige = incident.tat_anzeige
            if anzeige == 'J':
                result['anzeige_ja'] += 1
            elif anzeige == 'N':
                result['anzeige_nein'] += 1
            elif anzeige == 'E':
                result['anzeige_unentschieden'] += 1
            elif anzeige == 'K':
                result['anzeige_keine_angabe'] += 1
            
            spurensicherung = incident.tat_spurensicherung
            if spurensicherung == 'J':
                result['spurensicherung_ja'] += 1
            elif spurensicherung == 'N':
                result['spurensicherung_nein'] += 1
        
        return result
    
    @staticmethod
    def _count_affected_children(violence_incidents):
        """Count affected children."""
        result = {
            'mitbetroffene': 0,
            'direktbetroffene': 0
        }
        
        for incident in violence_incidents:
            result['mitbetroffene'] += incident.tat_mitbetroffene_kinder
            result['direktbetroffene'] += incident.tat_direktbetroffene_kinder
        
        return result
    
    @staticmethod
    def _count_violence_consequences(violence_incidents):
        """Count violence consequences."""
        result = {
            'psychische': {},
            'koerperliche': {},
            'finanzielle_ja': 0,
            'arbeitseinschraenkung_ja': 0,
            'verlust_arbeitsstelle_ja': 0,
            'soziale_isolation_ja': 0,
            'suizidalitaet_ja': 0
        }
        
        for incident in violence_incidents:
            try:
                folge = incident.gewaltfolge
                
                # Psychological consequences
                psych = folge.psychische_folgen
                if psych:
                    result['psychische'][psych] = result['psychische'].get(psych, 0) + 1
                
                # Physical consequences
                koerp = folge.koerperliche_folgen
                if koerp:
                    result['koerperliche'][koerp] = result['koerperliche'].get(koerp, 0) + 1
                
                # Other consequences
                if folge.finanzielle_folgen == 'J':
                    result['finanzielle_ja'] += 1
                if folge.arbeitseinschraenkung == 'J':
                    result['arbeitseinschraenkung_ja'] += 1
                if folge.verlust_arbeitsstelle == 'J':
                    result['verlust_arbeitsstelle_ja'] += 1
                if folge.soziale_isolation == 'J':
                    result['soziale_isolation_ja'] += 1
                if folge.suizidalitaet == 'J':
                    result['suizidalitaet_ja'] += 1
            except Gewaltfolge.DoesNotExist:
                # No consequences recorded for this incident
                pass
        
        return result
    
    @staticmethod
    def _count_inquiries_by_type(inquiries):
        """Count inquiries by type."""
        result = {
            'medizinische_soforthilfe': 0,
            'vertrauliche_spurensicherung': 0,
            'beratungsbedarf': 0,
            'rechtliche_fragen': 0,
            'sonstiges': 0
        }
        
        for inquiry in inquiries:
            art = inquiry.anfrage_art
            if art == 'MS':
                result['medizinische_soforthilfe'] += 1
            elif art == 'VS':
                result['vertrauliche_spurensicherung'] += 1
            elif art == 'B':
                result['beratungsbedarf'] += 1
            elif art == 'R':
                result['rechtliche_fragen'] += 1
            elif art == 'S':
                result['sonstiges'] += 1
        
        return result
    
    @staticmethod
    def _count_inquiries_by_person(inquiries):
        """Count inquiries by person type."""
        result = {}
        
        for inquiry in inquiries:
            person = inquiry.anfrage_person
            result[person] = result.get(person, 0) + 1
        
        return result
