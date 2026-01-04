"""Serializer für Anfragen."""

from django.db import transaction
from rest_framework import serializers

from api.models import Anfrage, Beratungstermin
from .beratungstermin import BeratungsterminSerializer


class AnfrageSerializer(serializers.ModelSerializer):
    """
    Serializer für Anfragen mit Unterstützung für nested Beratungstermin-Erstellung.
    
    Wichtig:
    - `mitarbeiterin` ist read_only (wird serverseitig via perform_create gesetzt)
    - `beratungstermin_data` erlaubt das optionale Erstellen eines Beratungstermins
    """
    # Read-only: wird im ViewSet via perform_create gesetzt
    mitarbeiterin = serializers.PrimaryKeyRelatedField(read_only=True)

    # Nested Write: Optional kann ein Beratungstermin mitgeschickt werden
    beratungstermin_data = BeratungsterminSerializer(write_only=True, required=False)

    # Read: Zeigt den verknüpften Beratungstermin an
    beratungstermin = BeratungsterminSerializer(read_only=True)

    class Meta:
        model = Anfrage
        fields = [
            'anfrage_id', 'anfrage_weg', 'anfrage_datum', 'anfrage_ort',
            'anfrage_person', 'anfrage_art', 'mitarbeiterin', 'fall',
            'beratungstermin', 'beratungstermin_data'
        ]
        read_only_fields = ['anfrage_id', 'mitarbeiterin']

    def create(self, validated_data):
        """
        Erstellt eine Anfrage und optional einen verknüpften Beratungstermin.
        Beide werden in einer Transaktion erstellt (atomare Operation).
        """
        beratungstermin_data = validated_data.pop('beratungstermin_data', None)

        with transaction.atomic():
            # Falls Beratungstermin-Daten vorhanden, erst Termin erstellen
            if beratungstermin_data:
                # Berater wird vom aktuellen User übernommen (falls nicht explizit gesetzt)
                # Nutze request.user statt validated_data, da mitarbeiterin read_only ist
                if 'berater' not in beratungstermin_data:
                    beratungstermin_data['berater'] = self.context['request'].user
                
                # Fall übernehmen, falls in der Anfrage vorhanden
                if 'fall' not in beratungstermin_data and validated_data.get('fall'):
                    beratungstermin_data['fall'] = validated_data.get('fall')
                
                beratungstermin = Beratungstermin.objects.create(**beratungstermin_data)
                validated_data['beratungstermin'] = beratungstermin

            anfrage = Anfrage.objects.create(**validated_data)

        return anfrage
