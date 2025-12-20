from rest_framework import viewsets
from api.models import Begleitung
from api.serializers import BegleitungSerializer

class BegleitungViewSet(viewsets.ModelViewSet):
    queryset = Begleitung.objects.all()
    serializer_class = BegleitungSerializer
