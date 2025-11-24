from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import Konto

class KontoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Konto
        fields = ('id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb')
        read_only_fields = ('id', 'mail_mb', 'rolle_mb')
        
class CustomLoginSerializer(LoginSerializer):
    username = None 
    def validate(self, attrs):
        return super().validate(attrs)
    
class CustomRegisterSerializer(RegisterSerializer):
    username = None
    
    vorname_mb = serializers.CharField(required=True)
    nachname_mb = serializers.CharField(required=True)
    