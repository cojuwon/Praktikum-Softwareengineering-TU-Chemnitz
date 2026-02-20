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
        from api.serializers.gewalttat import GewalttatSerializer

        # 1. Termine laden
        termine = obj.beratungstermine.all()
        # 2. Notizen laden
        notizen = obj.timeline_notizen.all()
        # 3. Gewalttaten laden
        gewalttaten = obj.gewalttaten.all()

        # 4. Serialisieren
        timeline_items = []

        # Beratungstermine
        termine_data = BeratungsterminSerializer(termine, many=True).data
        for t in termine_data:
            t['type'] = 'appointment'
            t['sort_date'] = t.get('termin_beratung')
            timeline_items.append(t)

        # Notizen
        notizen_data = FallNotizSerializer(notizen, many=True).data
        for n in notizen_data:
            n['type'] = 'note'
            n['sort_date'] = n.get('datum')
            timeline_items.append(n)

        # Gewalttaten
        gewalttaten_data = GewalttatSerializer(gewalttaten, many=True).data
        for g in gewalttaten_data:
            g['type'] = 'crime'
            g['sort_date'] = g.get('tat_datum')
            timeline_items.append(g)

        # 5. Sortieren (neueste zuerst)
        # Beachte: sort_date string comparison (ISO format) works generally well
        timeline_items.sort(key=lambda x: str(x.get('sort_date') or ''), reverse=True)

        return timeline_items
