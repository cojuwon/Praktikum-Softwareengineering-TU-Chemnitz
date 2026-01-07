"""Serializer für Gewaltfolgen."""

from rest_framework import serializers

from api.models import Gewaltfolge


class GewaltfolgeSerializer(serializers.ModelSerializer):
    """Serializer für Gewaltfolgen-Daten."""
    class Meta:
        model = Gewaltfolge
        fields = '__all__'
