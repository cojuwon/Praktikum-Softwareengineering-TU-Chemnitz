from rest_framework import viewsets
from api.models import Preset
from api.serializers import PresetSerializer

class PresetViewSet(viewsets.ModelViewSet):
    queryset = Preset.objects.all()
    serializer_class = PresetSerializer
