from rest_framework import viewsets
from api.models import Fall
from api.serializers import FallSerializer

class FallViewSet(viewsets.ModelViewSet):
    queryset = Fall.objects.all()
    serializer_class = FallSerializer
