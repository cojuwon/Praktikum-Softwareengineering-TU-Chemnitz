"""Serializer für dynamische Statistik-Queries."""

from rest_framework import serializers


class DynamicQuerySerializer(serializers.Serializer):
    """
    Validiert dynamische Query-Requests für Statistiken.
    
    Beispiel-Request:
    {
        "base_model": "Anfrage",
        "filters": {"anfrage_datum__gte": "2024-01-01"},
        "group_by": "anfrage_art",
        "metric": "count"
    }
    """
    base_model = serializers.ChoiceField(
        choices=['Anfrage', 'Fall', 'KlientIn', 'Beratungstermin', 
                 'Begleitung', 'Gewalttat', 'Gewaltfolge'],
        help_text="Name des Django-Models für die Abfrage"
    )
    filters = serializers.DictField(
        required=False, 
        default=dict,
        help_text="Dictionary mit Django-Lookups (z.B. {'datum__gte': '2024-01-01'})"
    )
    group_by = serializers.CharField(
        required=True,
        help_text="Feld nach dem gruppiert werden soll (z.B. 'anfrage_art')"
    )
    metric = serializers.ChoiceField(
        choices=['count', 'sum'],
        default='count',
        help_text="Aggregationsfunktion: 'count' oder 'sum'"
    )
    sum_field = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Bei metric='sum': Feld das summiert werden soll"
    )
    
    def validate(self, attrs):
        """Validiere dass sum_field gesetzt ist wenn metric='sum'."""
        if attrs.get('metric') == 'sum' and not attrs.get('sum_field'):
            raise serializers.ValidationError({
                'sum_field': "Bei metric='sum' muss 'sum_field' angegeben werden."
            })
        return attrs
    
    def get_metric_string(self) -> str:
        """Gibt den Metric-String für den Service zurück."""
        if self.validated_data.get('metric') == 'sum':
            return f"sum_{self.validated_data.get('sum_field')}"
        return 'count'


class PresetQueryConfigSerializer(serializers.Serializer):
    """
    Serializer zur Validierung von Preset-Konfigurationen.
    Wird verwendet um preset_daten in Presets zu validieren.
    """
    base_model = serializers.ChoiceField(
        choices=['Anfrage', 'Fall', 'KlientIn', 'Beratungstermin', 
                 'Begleitung', 'Gewalttat', 'Gewaltfolge']
    )
    filters = serializers.DictField(required=False, default=dict)
    group_by = serializers.CharField(required=True)
    metric = serializers.ChoiceField(
        choices=['count', 'sum'],
        default='count'
    )
    sum_field = serializers.CharField(required=False, allow_blank=True)
