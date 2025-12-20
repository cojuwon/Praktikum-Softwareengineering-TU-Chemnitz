from rest_framework import viewsets
from api.models import Gewalttat
from api.serializers import GewalttatSerializer

class GewalttatViewSet(viewsets.ModelViewSet):
    queryset = Gewalttat.objects.all()
    serializer_class = GewalttatSerializer
