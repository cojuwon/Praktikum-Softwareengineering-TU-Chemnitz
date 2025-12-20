from rest_framework import viewsets
from api.models import Gewaltfolge
from api.serializers import GewaltfolgeSerializer

class GewaltfolgeViewSet(viewsets.ModelViewSet):
    queryset = Gewaltfolge.objects.all()
    serializer_class = GewaltfolgeSerializer
