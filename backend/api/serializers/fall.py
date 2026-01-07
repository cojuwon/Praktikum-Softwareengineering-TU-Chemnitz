"""Serializer für Fälle."""

from rest_framework import serializers

from api.models import Fall
from api.serializers.klient import KlientInSerializer


class FallSerializer(serializers.ModelSerializer):
    """Serializer für Fall-Daten."""
    klient_detail = KlientInSerializer(source='klient', read_only=True)

    class Meta:
        model = Fall
        fields = '__all__'
