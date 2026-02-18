from rest_framework import serializers
from api.models import FallNotiz
from .auth import KontoSerializer

class FallNotizSerializer(serializers.ModelSerializer):
    autor = KontoSerializer(read_only=True)
    autor_id = serializers.PrimaryKeyRelatedField(
        source='autor', 
        read_only=True
    )

    class Meta:
        model = FallNotiz
        fields = [
            'notiz_id', 'fall', 'beratungstermin', 
            'autor', 'autor_id',
            'content', 
            'datum',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'autor']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.beratungstermin:
             # Manual serialization or import to avoid circular dependency if strictly needed
             # But here we just need basic info like date and type
             representation['beratungstermin_info'] = {
                 'id': instance.beratungstermin.pk,
                 'datum': instance.beratungstermin.termin_beratung,
                 'art': instance.beratungstermin.beratungsart
             }
        return representation

    def create(self, validated_data):
        # Set author from context request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['autor'] = request.user
        return super().create(validated_data)
