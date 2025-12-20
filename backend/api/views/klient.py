from rest_framework import viewsets
from api.models import KlientIn
from api.serializers import KlientInSerializer

class KlientInViewSet(viewsets.ModelViewSet):
    queryset = KlientIn.objects.all()
    serializer_class = KlientInSerializer
