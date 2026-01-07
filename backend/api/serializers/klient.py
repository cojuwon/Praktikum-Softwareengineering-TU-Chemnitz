"""Serializer für Klient:innen."""

from rest_framework import serializers

from api.models import KlientIn


class KlientInSerializer(serializers.ModelSerializer):
    """Serializer für Klient:innen-Daten."""
    class Meta:
        model = KlientIn
        fields = '__all__'
