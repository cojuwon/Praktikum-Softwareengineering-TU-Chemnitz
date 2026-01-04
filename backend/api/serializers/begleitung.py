"""Serializer für Begleitungen/Verweisungen."""

from rest_framework import serializers

from api.models import Begleitung


class BegleitungSerializer(serializers.ModelSerializer):
    """Serializer für Begleitungs-/Verweisungs-Daten."""
    class Meta:
        model = Begleitung
        fields = '__all__'
