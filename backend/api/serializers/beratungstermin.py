"""Serializer für Beratungstermine."""

from rest_framework import serializers

from api.models import Beratungstermin


class BeratungsterminSerializer(serializers.ModelSerializer):
    """Serializer für Beratungstermin-Daten."""
    class Meta:
        model = Beratungstermin
        fields = '__all__'
