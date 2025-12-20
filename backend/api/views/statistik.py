from rest_framework import viewsets
from api.models import Statistik
from api.serializers import StatistikSerializer

class StatistikViewSet(viewsets.ModelViewSet):
    queryset = Statistik.objects.all()
    serializer_class = StatistikSerializer
