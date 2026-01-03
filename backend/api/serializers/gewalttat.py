"""Serializer für Gewalttaten."""

from rest_framework import serializers

from api.models import Gewalttat


class GewalttatSerializer(serializers.ModelSerializer):
    """Serializer für Gewalttat-Daten."""
    class Meta:
        model = Gewalttat
        fields = '__all__'
