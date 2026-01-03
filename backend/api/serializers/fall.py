"""Serializer für Fälle."""

from rest_framework import serializers

from api.models import Fall


class FallSerializer(serializers.ModelSerializer):
    """Serializer für Fall-Daten."""
    class Meta:
        model = Fall
        fields = '__all__'
