from rest_framework import serializers
from api.models import Begleitung

class BegleitungSerializer(serializers.ModelSerializer):
    class Meta:
        model = Begleitung
        fields = '__all__'
