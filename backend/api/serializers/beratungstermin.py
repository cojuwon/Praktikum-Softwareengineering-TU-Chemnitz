"""Serializer für Beratungstermine."""

from rest_framework import serializers

from api.models import Beratungstermin
from api.serializers.auth import KontoSerializer


class BeratungsterminSerializer(serializers.ModelSerializer):
    """Serializer für Beratungstermin-Daten."""
    # Explizit DateTime-Feld mit ISO 8601 Format
    termin_beratung = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S", input_formats=[
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "iso-8601"
    ])
    notizen_beratung = serializers.JSONField(required=False, allow_null=True)
    berater_detail = KontoSerializer(source='berater', read_only=True)
    
    class Meta:
        model = Beratungstermin
        fields = '__all__'
