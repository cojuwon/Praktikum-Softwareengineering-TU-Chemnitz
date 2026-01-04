from rest_framework import serializers
from api.models import Eingabefeld

class EingabefeldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Eingabefeld
        fields = '__all__'
