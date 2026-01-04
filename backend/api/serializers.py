from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import Konto
import sys
import logging

logger = logging.getLogger(__name__)
logger.info("--- LOADING API SERIALIZERS ---")
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
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'vorname_mb': self.validated_data.get('vorname_mb', ''),
            'nachname_mb': self.validated_data.get('nachname_mb', ''),
        })
        return data

    def save(self, request):
        user = super().save(request)
        user.vorname_mb = self.cleaned_data.get('vorname_mb')
        user.nachname_mb = self.cleaned_data.get('nachname_mb')
        user.save()
        return user
    