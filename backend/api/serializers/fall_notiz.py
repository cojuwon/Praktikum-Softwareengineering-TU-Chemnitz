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
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'autor']

    def create(self, validated_data):
        # Set author from context request
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['autor'] = request.user
        return super().create(validated_data)
