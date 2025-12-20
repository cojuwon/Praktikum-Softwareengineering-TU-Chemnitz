from rest_framework import viewsets
from api.models import Beratungstermin
from api.serializers import BeratungsterminSerializer

class BeratungsterminViewSet(viewsets.ModelViewSet):
    queryset = Beratungstermin.objects.all()
    serializer_class = BeratungsterminSerializer
