"""Serializer für Presets."""

from rest_framework import serializers

from api.models import Preset


class PresetSerializer(serializers.ModelSerializer):
    """Serializer für Preset-Daten."""
    filterKriterien = serializers.JSONField(required=False, default=dict)

    def validate_preset_daten(self, value):
        """Validiert die Statistik-Konfiguration."""
        from .statistik_query import DynamicQuerySerializer
        
        # Validiere Struktur und Felder
        serializer = DynamicQuerySerializer(data=value)
        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)
            
        # Validiere Inhalt (Whitelist etc.) via Service
        from api.services.dynamic_statistik_service import DynamicStatistikService
        try:
            DynamicStatistikService.validate_query(
                base_model=value.get('base_model'),
                filters=value.get('filters', {}),
                group_by=value.get('group_by')
            )
        except Exception as e:
             raise serializers.ValidationError(str(e))
             
        return value

    class Meta:
        model = Preset
        fields = '__all__'
        read_only_fields = ['ersteller', 'berechtigte']
