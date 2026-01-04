"""Serializer für Statistiken."""

from rest_framework import serializers

from api.models import Statistik


class StatistikSerializer(serializers.ModelSerializer):
    """Serializer für Statistik-Daten."""
    class Meta:
        model = Statistik
        fields = '__all__'
