"""Serializer für Presets."""

from rest_framework import serializers

from api.models import Preset


class PresetSerializer(serializers.ModelSerializer):
    """Serializer für Preset-Daten."""
    class Meta:
        model = Preset
        fields = '__all__'
