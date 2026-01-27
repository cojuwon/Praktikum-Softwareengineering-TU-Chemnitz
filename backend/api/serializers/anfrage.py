"""
Serializer für Anfragen.

Implementiert die Validierungs- und Transformationslogik für die UML-Methoden:
- anfrageAnlegen() (create)
- anfrageBearbeiten() (update)
"""

from django.db import transaction
from rest_framework import serializers

from api.models import Anfrage, Beratungstermin, ANFRAGE_PERSON_CHOICES, ANFRAGE_ART_CHOICES, STANDORT_CHOICES
from .beratungstermin import BeratungsterminSerializer


class AnfrageSerializer(serializers.ModelSerializer):
    """
    Serializer für Anfragen mit Unterstützung für nested Beratungstermin-Erstellung.
    
    Wichtig:
    - `mitarbeiterin` ist read_only (wird serverseitig via perform_create/perform_update gesetzt)
    - `beratungstermin_data` erlaubt das optionale Erstellen eines Beratungstermins
    
    Validierung:
    - Enum-Felder werden gegen die definierten Choices validiert
    - Das mitarbeiterin-Feld wird vom ViewSet kontrolliert (Schutz gegen "Ticket-Stealing")
    """
    # Read-only: wird im ViewSet via perform_create/perform_update gesetzt
    mitarbeiterin = serializers.PrimaryKeyRelatedField(read_only=True)
    
    # Read: Zeigt den Mitarbeiter-Namen für bessere UX
    mitarbeiterin_display = serializers.SerializerMethodField(read_only=True)

    # Nested Write: Optional kann ein Beratungstermin mitgeschickt werden
    beratungstermin_data = BeratungsterminSerializer(write_only=True, required=False)

    # Read: Zeigt den verknüpften Beratungstermin an
    anfrage_art_display = serializers.CharField(source='get_anfrage_art_display', read_only=True)
    anfrage_ort_display = serializers.CharField(source='get_anfrage_ort_display', read_only=True)

    class Meta:
        model = Anfrage
        fields = [
            'anfrage_id', 'anfrage_weg', 'anfrage_datum', 'anfrage_ort', 'anfrage_ort_display',
            'anfrage_person', 'anfrage_art', 'anfrage_art_display', 'mitarbeiterin', 'mitarbeiterin_display',
            'fall', 'beratungstermin', 'beratungstermin_data'
        ]
        read_only_fields = ['anfrage_id', 'mitarbeiterin']

    def get_mitarbeiterin_display(self, obj):
        """Gibt den Namen der Mitarbeiterin zurück."""
        if obj.mitarbeiterin:
            return f"{obj.mitarbeiterin.vorname_mb} {obj.mitarbeiterin.nachname_mb}"
        return None

    def validate_anfrage_ort(self, value):
        """Validiert, dass anfrage_ort ein gültiger STANDORT_CHOICES Wert ist."""
        valid_choices = [choice[0] for choice in STANDORT_CHOICES]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"'{value}' ist kein gültiger Wert. Erlaubt: {', '.join(valid_choices)}"
            )
        return value

    def validate_anfrage_person(self, value):
        """Validiert, dass anfrage_person ein gültiger ANFRAGE_PERSON_CHOICES Wert ist."""
        valid_choices = [choice[0] for choice in ANFRAGE_PERSON_CHOICES]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"'{value}' ist kein gültiger Wert. Erlaubt: {', '.join(valid_choices)}"
            )
        return value

    def validate_anfrage_art(self, value):
        """Validiert, dass anfrage_art ein gültiger ANFRAGE_ART_CHOICES Wert ist."""
        valid_choices = [choice[0] for choice in ANFRAGE_ART_CHOICES]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"'{value}' ist kein gültiger Wert. Erlaubt: {', '.join(valid_choices)}"
            )
        return value

    def create(self, validated_data):
        """
        anfrageAnlegen(): Erstellt eine Anfrage und optional einen verknüpften Beratungstermin.
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

    def update(self, instance, validated_data):
        """
        anfrageBearbeiten(): Aktualisiert eine bestehende Anfrage.
        
        Besonderheiten:
        - Das mitarbeiterin-Feld kann NICHT über diesen Serializer geändert werden
          (wird im ViewSet.perform_update kontrolliert)
        - Beratungstermin kann neu verknüpft oder erstellt werden
        - Alle Änderungen erfolgen atomar (Transaktion)
        """
        beratungstermin_data = validated_data.pop('beratungstermin_data', None)

        with transaction.atomic():
            # Falls neue Beratungstermin-Daten mitgeschickt wurden
            if beratungstermin_data:
                # Berater vom aktuellen User übernehmen, falls nicht explizit gesetzt
                if 'berater' not in beratungstermin_data:
                    beratungstermin_data['berater'] = self.context['request'].user
                
                # Fall übernehmen, falls in der Anfrage vorhanden
                if 'fall' not in beratungstermin_data:
                    beratungstermin_data['fall'] = validated_data.get('fall', instance.fall)
                
                beratungstermin = Beratungstermin.objects.create(**beratungstermin_data)
                instance.beratungstermin = beratungstermin

            # Alle anderen Felder aktualisieren
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()

        return instance
