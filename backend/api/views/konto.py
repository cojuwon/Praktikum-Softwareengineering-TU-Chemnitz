from rest_framework import viewsets
from api.models import Konto
from api.serializers import KontoSerializer

class KontoViewSet(viewsets.ModelViewSet):
    queryset = Konto.objects.all()
    serializer_class = KontoSerializer
