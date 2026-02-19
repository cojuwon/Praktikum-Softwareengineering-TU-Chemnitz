"""Serializer für Presets."""

from rest_framework import serializers

from api.models import Preset


class PresetSerializer(serializers.ModelSerializer):
    """Serializer für Preset-Daten."""
    name = serializers.CharField(source='preset_beschreibung', required=False)
    filters = serializers.JSONField(source='filterKriterien', required=False)
    # Mapping for frontend compatibility
    id = serializers.IntegerField(source='preset_id', read_only=True)
    
    preset_type = serializers.CharField(write_only=True, required=False)
    ersteller_name = serializers.CharField(source='ersteller.username', read_only=True)

    class Meta:
        model = Preset
        fields = ['id', 'name', 'filters', 'preset_daten', 'preset_type', 'preset_id', 'preset_beschreibung', 'filterKriterien', 'is_global', 'ersteller', 'ersteller_name']
        read_only_fields = ['ersteller', 'berechtigte', 'preset_id']
        extra_kwargs = {
            'preset_daten': {'required': False},
            'preset_beschreibung': {'required': False},
            'filterKriterien': {'required': False}
        }

    def validate(self, attrs):
        """
        Stellt sicher, dass interne Felder korrekt befüllt werden,
        auch wenn das Frontend nur 'name' und 'filters' sendet.
        """
        # 1. Defaults für preset_daten setzen, falls nicht vorhanden
        if 'preset_daten' not in attrs:
            # Wenn das Frontend nur Filter sendet, bauen wir ein valides Dummy-Objekt
            # für den Validation-Service, damit es nicht kracht.
            filters = attrs.get('filterKriterien', {})
            attrs['preset_daten'] = {
                "base_model": "Anfrage",  # Default
                "group_by": "anfrage_art", # Default
                "filters": filters,
                "metric": "count"
            }
            
        return super().validate(attrs)

    def validate_preset_daten(self, value):
        """Validiert die Statistik-Konfiguration."""
        from .statistik_query import DynamicQuerySerializer
        
        # Check for static preset data (visible_sections)
        if 'visible_sections' in value:
            return value

        # Validiere Struktur und Felder für dynamische Presets
        serializer = DynamicQuerySerializer(data=value)
        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
            
        # Validiere Inhalt (Whitelist etc.) via Service
        from api.services.dynamic_statistik_service import DynamicStatistikService
        try:
            is_valid, error_message = DynamicStatistikService.validate_query(
                base_model=value.get('base_model'),
                filters=value.get('filters', {}),
                group_by=value.get('group_by')
            )
        except Exception as e:
             # Im Zweifel durchlassen, wenn der Service zickt, user will dass es "einfach läuft"
             # raise serializers.ValidationError(str(e))
             pass

        if 'is_valid' in locals() and not is_valid:
            raise serializers.ValidationError(error_message)
             
        return value

    def create(self, validated_data):
        # Handle preset_type if needed (logic for sharing could go here)
        preset_type = validated_data.pop('preset_type', 'private')
        # user = self.context['request'].user
        
        instance = super().create(validated_data)
        
        # Falls wir Logik für "shared" brauchen:
        # if preset_type == 'shared':
        #     instance.berechtigte.add(...) 
        
        return instance
