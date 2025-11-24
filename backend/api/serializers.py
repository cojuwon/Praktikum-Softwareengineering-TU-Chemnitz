from rest_framework import serializers
from .models import Konto

class KontoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Konto
        fields = ('user_id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb')
        read_only_fields = ('user_id', 'mail_mb', 'rolle_mb')