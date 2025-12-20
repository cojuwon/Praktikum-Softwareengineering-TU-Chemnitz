from rest_framework.views import APIView
from rest_framework.response import Response
from api.models import (
    BERECHTIGUNG_CHOICES, KLIENT_ROLLE_CHOICES, KLIENT_GESCHLECHT_CHOICES,
    KLIENT_SEXUALITAET_CHOICES, STANDORT_CHOICES, JA_NEIN_KA_CHOICES,
    BERATUNGSSTELLE_CHOICES, BERATUNGSART_CHOICES, ANZAHL_VORFAELLE_CHOICES,
    ANZAHL_TAETER_CHOICES, TATORT_CHOICES, ANZEIGE_CHOICES,
    PSYCH_FOLGEN_CHOICES, KOERPER_FOLGEN_CHOICES, ANFRAGE_PERSON_CHOICES,
    ANFRAGE_ART_CHOICES, BEGLEITUNG_ART_CHOICES, VERWEISUNG_ART_CHOICES
)

class EingabefeldView(APIView):
    def get(self, request):
        return Response({
            'berechtigung': BERECHTIGUNG_CHOICES,
            'klient_rolle': KLIENT_ROLLE_CHOICES,
            'klient_geschlecht': KLIENT_GESCHLECHT_CHOICES,
            'klient_sexualitaet': KLIENT_SEXUALITAET_CHOICES,
            'standort': STANDORT_CHOICES,
            'ja_nein_ka': JA_NEIN_KA_CHOICES,
            'beratungsstelle': BERATUNGSSTELLE_CHOICES,
            'beratungsart': BERATUNGSART_CHOICES,
            'anzahl_vorfaelle': ANZAHL_VORFAELLE_CHOICES,
            'anzahl_taeter': ANZAHL_TAETER_CHOICES,
            'tatort': TATORT_CHOICES,
            'anzeige': ANZEIGE_CHOICES,
            'psych_folgen': PSYCH_FOLGEN_CHOICES,
            'koerper_folgen': KOERPER_FOLGEN_CHOICES,
            'anfrage_person': ANFRAGE_PERSON_CHOICES,
            'anfrage_art': ANFRAGE_ART_CHOICES,
            'begleitung_art': BEGLEITUNG_ART_CHOICES,
            'verweisung_art': VERWEISUNG_ART_CHOICES,
        })
