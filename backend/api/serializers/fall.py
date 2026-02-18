"""Serializer für Fälle."""

from rest_framework import serializers

from api.models import Fall

from api.serializers.auth import KontoSerializer
from api.serializers.klient import KlientInSerializer


class FallSerializer(serializers.ModelSerializer):
    klient_detail = KlientInSerializer(source='klient', read_only=True)
    mitarbeiterin_detail = KontoSerializer(source='mitarbeiterin', read_only=True)
    timeline = serializers.SerializerMethodField()

    class Meta:
        model = Fall
        fields = '__all__'

    def get_timeline(self, obj):
        # Local imports to avoid circular dependency
        from api.serializers.beratungstermin import BeratungsterminSerializer
        from api.serializers.fall_notiz import FallNotizSerializer

        # 1. Termine laden
        termine = obj.beratungstermine.all()
        # 2. Notizen laden
        notizen = obj.timeline_notizen.all()

        # 3. Serialisieren
        # Wir fügen ein "type"-Feld hinzu, damit das Frontend unterscheiden kann
        termine_data = BeratungsterminSerializer(termine, many=True).data
        for t in termine_data:
            t['type'] = 'appointment'
            # Fallback für Sortierung: nutze termin_beratung
            t['sort_date'] = t.get('termin_beratung')

        notizen_data = FallNotizSerializer(notizen, many=True).data
        for n in notizen_data:
            n['type'] = 'note'
            # Fallback für Sortierung: nutze created_at
            n['sort_date'] = n.get('created_at')

        # 4. Zusammenfügen und Sortieren (neueste zuerst)
        # Beachte: sort_date string comparison (ISO format) works generally well
        combined = termine_data + notizen_data
        combined.sort(key=lambda x: x.get('sort_date') or '', reverse=True)

        return combined
