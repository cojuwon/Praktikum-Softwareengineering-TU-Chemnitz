from rest_framework import viewsets
from api.models import Anfrage
from api.serializers import AnfrageSerializer

class AnfrageViewSet(viewsets.ModelViewSet):
    queryset = Anfrage.objects.all()
    serializer_class = AnfrageSerializer
